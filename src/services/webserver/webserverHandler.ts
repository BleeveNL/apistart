/* eslint-disable @typescript-eslint/no-explicit-any */

import * as http from 'http'
import * as https from 'https'
import immer from 'immer'
import Koa from 'koa'
import KoaBodyParser from 'koa-bodyparser'
import KoaRouter, {Params, Router} from 'koa-advanced-router'
import {
  WebserverHandlerDeps,
  WebServerObject,
  WebserverEnabledServiceConfigurator,
  WebserverFunction,
} from './interfaces'
import {InternalSystem} from '../../systemInterfaces/internalSystem'
import {WebserverCallbackFunction} from './interfaces/webserverCallbackFunction'
import {Dependencies, DependencyFunction} from '../../systemInterfaces/dependencies'
import {IMiddleware} from './interfaces/middleware'
import {IRoute} from './interfaces/route'
import {IParam} from './interfaces/param'
import {Version} from './interfaces/version'
import {ApiStartSettings} from '../../systemInterfaces/apiStartSettings'
import {UserDefinedObject} from '../../systemInterfaces/userDefinedObject'
import {RequestContext} from '@mikro-orm/core'
import {ServiceConfigurator} from '../../systemInterfaces/serviceConfigurator'
import {WebserverServiceEnabled} from './interfaces/webserverServiceEnabled'

export class WebserverHandler<
  TSettings extends ApiStartSettings = ApiStartSettings<WebserverEnabledServiceConfigurator<any, any, any>>,
> {
  // eslint-disable-next-line no-useless-constructor
  public constructor(private deps: WebserverHandlerDeps) {}

  public static factory<TSettings extends ApiStartSettings>(): WebserverHandler<TSettings> {
    return new this<TSettings>({
      Http: http,
      Https: https,
      Immer: immer,
      Koa: Koa,
      KoaBodyParser: KoaBodyParser,
      KoaRouter: KoaRouter,
      DBMiddleware: RequestContext,
    })
  }

  public setup(system: InternalSystem<TSettings>): WebserverFunction<TSettings> {
    if (this.WebserverIsEnabled(system)) {
      const internalSystem = system
      const configuration = this.MakeWebserviceInstance(internalSystem)
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      return (callback =>
        this.start(internalSystem, configuration, callback) as unknown) as WebserverFunction<TSettings>
    }

    return () => {
      throw new Error('Webserver is started while service is disabled!')
    }
  }

  private start(
    system: InternalSystem<ApiStartSettings<WebserverEnabledServiceConfigurator<true, true, boolean>>>,
    instance: Koa,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    callback: WebserverCallbackFunction<TSettings> = () => {},
  ) {
    const server: WebServerObject = {}
    if (system.Config.services.webserver.connection.http.enabled) {
      const httpWebserverSettings = system.Config.services.webserver.connection.http
      server.http = this.deps.Http.createServer(instance.callback()).listen(
        httpWebserverSettings.port ? httpWebserverSettings.port : 80,
        () => {
          system.Log.info(`Webserver is started!`, {
            port: httpWebserverSettings.port ? httpWebserverSettings.port : 80,
            protocol: 'http',
            status: 'started',
          })

          const internalSystem: any = system
          callback(internalSystem)
        },
      )
    }
    if (system.Config.services.webserver.connection.https.enabled) {
      const httpsWebserverSettings = system.Config.services.webserver.connection.https
      server.https = this.deps.Https.createServer(
        {
          cert: system.Config.services.webserver.connection.https.cert.cert,
          key: system.Config.services.webserver.connection.https.cert.key,
        },
        instance.callback(),
      ).listen(httpsWebserverSettings.port ? httpsWebserverSettings.port : 443, () => {
        system.Log.info(`Webserver is started!`, {
          port: httpsWebserverSettings.port ? httpsWebserverSettings.port : 443,
          protocol: 'https',
          status: 'started',
        })

        const internalSystem: any = system
        callback(internalSystem)
      })
    }

    return {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      close: (callback = () => {}) => {
        if (server.http) {
          server.http.emit('close')
        }
        if (server.https) {
          server.https.emit('close')
        }

        callback()
      },
    }
  }

  private MakeWebserviceInstance(
    system: InternalSystem<ApiStartSettings<WebserverEnabledServiceConfigurator<true, true, boolean>>>,
  ) {
    const app = new this.deps.Koa()
    // settings
    app.env = system.Config.app.env
    app.proxy = system.Config.services.webserver.settings.proxy
      ? system.Config.services.webserver.settings.proxy
      : false
    app.subdomainOffset = system.Config.services.webserver.settings.subdomainOffset
      ? system.Config.services.webserver.settings.subdomainOffset
      : 2

    if (system.Config.services.webserver.settings.silent !== undefined) {
      app.silent = system.Config.services.webserver.settings.silent
    } else if (system.Config.app.env === 'production') {
      app.silent = true
    }

    app.on('error', (err: Error, ctx: Koa.Context) => {
      system.Log.err(err, ctx)
    })

    if (
      system.Config.services.webserver.settings &&
      system.Config.services.webserver.settings.bodyParser &&
      system.Config.services.webserver.settings.bodyParser.enabled
    ) {
      app.use(this.deps.KoaBodyParser(system.Config.services.webserver.settings.bodyParser))
    }

    if (system.Config.services.database.enabled) {
      const system2 = system as InternalSystem<
        ApiStartSettings<ServiceConfigurator<any, true, any, WebserverServiceEnabled<true, true, any>>>
      >
      app.use(({}, next) => this.deps.DBMiddleware.createAsync(system2.DB.em, next))
    }

    if (system.Config.services.webserver.middleware.length > 0) {
      for (const middleware of this.HandleMiddleware(system, system.Config.services.webserver.middleware)) {
        app.use(middleware)
      }
    }

    const router = this.deps.KoaRouter({
      allowedMethods: system.Config.services.webserver.settings.allowedMethods,
      cors: system.Config.services.webserver.settings.cors,
      expose: system.Config.services.webserver.settings.expose,
      prefix: system.Config.services.webserver.settings.prefix,
      sensitive: system.Config.services.webserver.settings.sensitive,
      versionHandler: system.Config.services.webserver.settings.versionHandler,
    })

    this.HandleRoutes(system, system.Config.services.webserver.router, router)

    if (this.versionHandlerIsEnabled(system)) {
      this.HandleVersions(system, router)
    }

    app.use(router.routes)
    return app
  }

  private HandleMiddleware(
    system: InternalSystem<ApiStartSettings<WebserverEnabledServiceConfigurator<true, true, any>>>,
    middlewareList2Handle: IMiddleware<ApiStartSettings<WebserverEnabledServiceConfigurator<true, true, any>>>[],
  ) {
    const middlewareList: Koa.Middleware[] = []
    if (system.Config.services.webserver.middleware.length > 0) {
      for (const middleware of middlewareList2Handle) {
        if (typeof middleware === 'function') {
          middlewareList.push(middleware(this.HandleDependencies(system, {}) as any))
        } else {
          middlewareList.push(
            middleware.fnc(
              this.HandleDependencies<typeof middleware.dependencies>(system, middleware.dependencies) as any,
            ),
          )
        }
      }
    }

    return middlewareList
  }

  private HandleDependencies<TDeps extends UserDefinedObject = UserDefinedObject>(
    system: InternalSystem<ApiStartSettings<WebserverEnabledServiceConfigurator<true, true, any>>>,
    dependencies: TDeps | DependencyFunction<TSettings, TDeps>,
  ): Dependencies<TSettings> {
    const internalSystem = system as unknown as InternalSystem<TSettings>

    return {
      ...internalSystem,
      Dependencies:
        typeof dependencies === 'function' ? dependencies(this.HandleDependencies(system, {})) : dependencies,
    }
  }

  private HandleVersions(
    system: InternalSystem<ApiStartSettings<WebserverEnabledServiceConfigurator<true, true, true>>>,
    router: Router,
  ) {
    for (const version of system.Config.services.webserver.versions) {
      if (version.enabled) {
        const versionRouter = router.version(version.identifier, version.options)
        this.HandleSingleVersion(system, versionRouter, version)
      }
    }
  }

  private HandleSingleVersion(
    system: InternalSystem<ApiStartSettings<WebserverEnabledServiceConfigurator<true, true, true>>>,
    versionRouter: Router,
    version: Version<ApiStartSettings<WebserverEnabledServiceConfigurator<true, true, any>>>,
  ) {
    if (version.middleware && version.middleware.length > 0) {
      versionRouter.use(this.HandleMiddleware(system, version.middleware) as any)
    }

    this.HandleRoutes(system, version.router, versionRouter)
  }

  private HandleRoutes(
    system: InternalSystem<ApiStartSettings<WebserverEnabledServiceConfigurator<true, true, any>>>,
    routes: IRoute<ApiStartSettings<WebserverEnabledServiceConfigurator<true, true, any>>>[],
    router: Router,
  ) {
    for (const route of routes) {
      const methods = typeof route.method === 'string' ? [route.method] : route.method

      let middlewareList: Koa.Middleware[] = []
      const params: Params = {}

      if (route.middleware && route.middleware.length > 0) {
        middlewareList = middlewareList.concat(this.HandleMiddleware(system, route.middleware))
      }

      const dependencies = this.HandleDependencies(system, route.dependencies || {})
      const controller = route.controller(dependencies as any)

      middlewareList.push(controller)

      if (route.params) {
        for (const paramKey in route.params) {
          params[paramKey] = this.handleParam(system, route.params[paramKey])
        }
      }

      router.route({
        methods,
        middleware: middlewareList as any,
        options: route.options,
        params,
        path: route.path,
      })
    }
  }

  private handleParam(
    system: InternalSystem<ApiStartSettings<WebserverEnabledServiceConfigurator<true, true, any>>>,
    param: IParam<any>,
  ) {
    if (typeof param === 'function') {
      return param(this.HandleDependencies(system, {}) as any)
    } else {
      return param.fnc(this.HandleDependencies(system, param.dependencies) as any)
    }
  }

  private WebserverIsEnabled(
    system: InternalSystem<any>,
  ): system is InternalSystem<ApiStartSettings<WebserverEnabledServiceConfigurator<true, true, boolean>>> {
    return system.Config.services.database.enabled
  }

  private versionHandlerIsEnabled(
    system: InternalSystem<ApiStartSettings<WebserverEnabledServiceConfigurator<true, true, any>>>,
  ): system is InternalSystem<ApiStartSettings<WebserverEnabledServiceConfigurator<true, true, true>>> {
    return system.Config.services.database.enabled && system.Config.services.webserver.settings.versionHandler !== false
  }
}

export default WebserverHandler
