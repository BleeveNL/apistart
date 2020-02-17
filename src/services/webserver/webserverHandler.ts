import * as http from 'http'
import * as https from 'https'
import immer from 'immer'
import * as Koa from 'koa'
import * as KoaBodyParser from 'koa-bodyparser'
import * as KoaRouter from 'koa-router'
import * as koaCors from '@koa/cors'
import {
  WebserverHandlerDeps,
  ServiceConfiguratorWebserverEnabled,
  WebserverCallbackFunction,
  WebServerObject,
} from './interfaces'
import {Config} from '../../systemInterfaces/config'
import {InternalSystem} from '../../systemInterfaces/internalSystem'
import {Models} from '../database/interfaces/model'
import {ServiceConfigurator} from '../../systemInterfaces/serviceConfigurator'

export class WebserverHandler {
  // eslint-disable-next-line no-useless-constructor
  public constructor(private deps: WebserverHandlerDeps, private config: Config) {}

  public static factory(config: Config) {
    return new this(
      {
        Http: http,
        Https: https,
        Immer: immer,
        Koa: Koa,
        KoaBodyParser: KoaBodyParser,
        KoaCors: koaCors,
        KoaRouter: KoaRouter,
      },
      config,
    )
  }

  public setup<TServiceConfigurator extends ServiceConfigurator, TConfig extends Config, TModels extends Models>(
    system: InternalSystem<TServiceConfigurator, TConfig, TModels>,
  ) {
    if (this.webserverEnabled(this.config)) {
      const configuration = this.MakeWebserviceInstance<TServiceConfigurator, TConfig, TModels>(system)
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      return (callback: () => void = () => {}) => this.start(system, configuration, callback)
    }

    return () => {
      throw new Error('Webserver is started while service is disabled!')
    }
  }

  private start<TServiceConfigurator extends ServiceConfigurator, TConfig extends Config, TModels extends Models>(
    system: InternalSystem<TServiceConfigurator, TConfig, TModels>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    instance: Koa,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    callback: WebserverCallbackFunction<TServiceConfigurator, TConfig, TModels> = () => {},
  ) {
    const server: WebServerObject = {}
    if (this.config.services.webserver.enabled && this.config.services.webserver.connection.http.enabled) {
      const httpWebserverSettings = this.config.services.webserver.connection.http
      server.http = this.deps.Http.createServer(instance.callback()).listen(
        httpWebserverSettings.port ? httpWebserverSettings.port : 80,
        () => {
          system.Log.info(`Webserver is started!`, {
            port: httpWebserverSettings.port ? httpWebserverSettings.port : 80,
            protocol: 'http',
            status: 'started',
          })
          callback(system)
        },
      )
    }

    if (this.config.services.webserver.enabled && this.config.services.webserver.connection.https.enabled) {
      const httpsWebserverSettings = this.config.services.webserver.connection.https
      server.https = this.deps.Https.createServer(instance.callback()).listen(
        httpsWebserverSettings.port ? httpsWebserverSettings.port : 443,
        () => {
          system.Log.info(`Webserver is started!`, {
            port: httpsWebserverSettings.port ? httpsWebserverSettings.port : 443,
            protocol: 'https',
            status: 'started',
          })
          callback(system)
        },
      )
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

  private webserverEnabled(config: Config): config is Config<ServiceConfiguratorWebserverEnabled> {
    return config.services.webserver.enabled
  }

  private MakeWebserviceInstance<
    TServiceConfigurator extends ServiceConfigurator,
    TConfig extends Config,
    TModels extends Models
  >(system: InternalSystem<TServiceConfigurator, TConfig, TModels>) {
    const app = new this.deps.Koa()
    const config = this.getConfig()
    // settings
    app.env = config.app.env
    app.proxy = config.services.webserver.settings.proxy ? config.services.webserver.settings.proxy : false
    app.subdomainOffset = config.services.webserver.settings.subdomainOffset
      ? config.services.webserver.settings.subdomainOffset
      : 2

    if (config.services.webserver.settings.silent !== undefined) {
      app.silent = config.services.webserver.settings.silent
    } else if (config.app.env === 'production') {
      app.silent = true
    }

    app.on('error', (err: Error, ctx: Koa.Context) => {
      system.Log.err(err, {ctx})
    })

    if (
      config.services.webserver.security &&
      config.services.webserver.security.cors &&
      config.services.webserver.security.cors.enabled
    ) {
      app.use(this.deps.KoaCors(config.services.webserver.security.cors))
    }

    if (
      config.services.webserver.settings &&
      config.services.webserver.settings.bodyParser &&
      config.services.webserver.settings.bodyParser.enabled
    ) {
      app.use(this.deps.KoaBodyParser(config.services.webserver.settings.bodyParser))
    }

    return app
  }

  private getConfig(): Config<ServiceConfiguratorWebserverEnabled> {
    return this.config
  }
}

export default WebserverHandler
