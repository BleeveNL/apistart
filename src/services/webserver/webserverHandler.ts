/* eslint-disable @typescript-eslint/no-explicit-any */

import * as http from 'http'
import * as https from 'https'
import immer from 'immer'
import * as Koa from 'koa'
import * as KoaBodyParser from 'koa-bodyparser'
import KoaRouter, {Params, Router} from 'koa-advanced-router'
import {
  WebserverHandlerDeps,
  WebServerObject,
  WebserverEnabledServiceConfigurator,
  WebserverFunction,
} from './interfaces'
import {Config} from '../../systemInterfaces/config'
import {InternalSystem} from '../../systemInterfaces/internalSystem'
import {ServiceConfigurator} from '../../systemInterfaces/serviceConfigurator'
import {
  WebserverServiceHttpEnabled,
  WebserverServiceHttpsEnabled,
  WebserverServiceVersionHandlingEnabled,
} from './interfaces/webserverServiceEnabled'
import {WebserverCallbackFunction} from './interfaces/webserverCallbackFunction'
import {Dependencies, DependencyFunction} from '../../systemInterfaces/dependencies'
import {IMiddleware} from './interfaces/middleware'
import {IRoute} from './interfaces/route'
import {IParam} from './interfaces/param'
import {Version} from './interfaces/version'
import {ApiStartSettings} from '../../systemInterfaces/apiStartSettings'
import {UserDefinedObject} from '../../systemInterfaces/userDefinedObject'

export class WebserverHandler<TSettings extends ApiStartSettings = ApiStartSettings> {
  private webserverEnabled: boolean

  // eslint-disable-next-line no-useless-constructor
  public constructor(private deps: WebserverHandlerDeps, config: Config) {
    this.webserverEnabled = this.WebserverIsEnabled(config)
  }

  public static factory<TSettings extends ApiStartSettings>(config: Config): WebserverHandler<TSettings> {
    return new this<TSettings>(
      {
        Http: http,
        Https: https,
        Immer: immer,
        Koa: Koa,
        KoaBodyParser: KoaBodyParser,
        KoaRouter: KoaRouter,
      },
      config,
    )
  }

  public setup(system: InternalSystem<TSettings>): WebserverFunction<TSettings> {
    if (this.webserverEnabled && this.WebserverIsEnabled(system.Config)) {
      const internalSystem = system as unknown as InternalSystem<ApiStartSettings<WebserverEnabledServiceConfigurator>>
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
    system: InternalSystem<ApiStartSettings<WebserverEnabledServiceConfigurator>>,
    instance: Koa,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    callback: WebserverCallbackFunction<TSettings> = () => {},
  ) {
    const server: WebServerObject = {}
    if (system.Config.services.webserver.connection.http.enabled) {
      const config = system.Config as Config<
        ApiStartSettings<ServiceConfigurator<any, any, any, WebserverServiceHttpEnabled>>
      >
      const httpWebserverSettings = config.services.webserver.connection.http
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
      const config = system.Config as Config<
        ApiStartSettings<ServiceConfigurator<any, any, any, WebserverServiceHttpsEnabled>>
      >
      const httpsWebserverSettings = config.services.webserver.connection.https
      server.https = this.deps.Https.createServer(
        {
          cert: config.services.webserver.connection.https.cert.cert,
          key: config.services.webserver.connection.https.cert.key,
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

  private MakeWebserviceInstance(system: InternalSystem<ApiStartSettings<WebserverEnabledServiceConfigurator>>) {
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

    if (system.Config.services.webserver.settings.versionHandler) {
      const config = system.Config as Config<
        ApiStartSettings<WebserverEnabledServiceConfigurator<WebserverServiceVersionHandlingEnabled>>
      >
      this.HandleVersions({...system, Config: config}, router, config.services.webserver.versions)
    }

    app.use(router.routes)
    return app
  }

  private HandleMiddleware(
    system: InternalSystem<ApiStartSettings<WebserverEnabledServiceConfigurator>>,
    middlewareList2Handle: IMiddleware[],
  ) {
    const middlewareList: Koa.Middleware[] = []
    for (const middleware of middlewareList2Handle) {
      if (typeof middleware === 'function') {
        middlewareList.push(middleware(this.HandleDependencies(system, {})))
      } else {
        middlewareList.push(
          middleware.fnc(this.HandleDependencies<typeof middleware.dependencies>(system, middleware.dependencies)),
        )
      }
    }

    return middlewareList
  }

  private HandleDependencies<TDeps extends UserDefinedObject = UserDefinedObject>(
    system: InternalSystem<ApiStartSettings<WebserverEnabledServiceConfigurator>>,
    dependencies: TDeps | DependencyFunction<TSettings, TDeps>,
  ): Dependencies<TSettings> {
    const internalSystem = system as InternalSystem<TSettings>

    return {
      ...internalSystem,
      Dependencies:
        typeof dependencies === 'function' ? dependencies(this.HandleDependencies(system, {})) : dependencies,
    }
  }

  private HandleVersions(
    system: InternalSystem<ApiStartSettings<WebserverEnabledServiceConfigurator>>,
    router: Router,
    versions: Version[],
  ) {
    for (const version of versions) {
      if (version.enabled) {
        const versionRouter = router.version(version.identifier, version.options)
        this.HandleSingleVersion(system, versionRouter, version)
      }
    }
  }

  private HandleSingleVersion(
    system: InternalSystem<ApiStartSettings<WebserverEnabledServiceConfigurator>>,
    versionRouter: Router,
    version: Version,
  ) {
    if (version.middleware && version.middleware.length > 0) {
      versionRouter.use(this.HandleMiddleware(system, version.middleware))
    }

    this.HandleRoutes(system, version.router, versionRouter)
  }

  private HandleRoutes(
    system: InternalSystem<ApiStartSettings<WebserverEnabledServiceConfigurator>>,
    routes: IRoute[],
    router: Router,
  ) {
    for (const route of routes) {
      const methods = typeof route.method === 'string' ? [route.method] : route.method

      let middlewareList: Koa.Middleware[] = []
      const params: Params = {}

      if (route.middleware && route.middleware.length > 0) {
        middlewareList = middlewareList.concat(this.HandleMiddleware(system, route.middleware))
      }

      middlewareList.push(route.controller(this.HandleDependencies(system, route.dependencies || {})))

      if (route.params) {
        for (const paramKey in route.params) {
          params[paramKey] = this.handleParam(system, route.params[paramKey])
        }
      }

      router.route({
        methods,
        middleware: middlewareList,
        options: route.options,
        params,
        path: route.path,
      })
    }
  }

  private handleParam(system: InternalSystem<ApiStartSettings<WebserverEnabledServiceConfigurator>>, param: IParam) {
    if (typeof param === 'function') {
      return param(this.HandleDependencies(system, {}))
    } else {
      return param.fnc(this.HandleDependencies<typeof param.dependencies>(system, param.dependencies))
    }
  }

  private WebserverIsEnabled(config: Config): config is Config<ApiStartSettings<WebserverEnabledServiceConfigurator>> {
    return config.services.webserver.enabled
  }
}

export default WebserverHandler
