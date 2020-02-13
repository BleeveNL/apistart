import * as http from 'http'
import * as https from 'https'
import immer from 'immer'
import * as Koa from 'koa'
import * as KoaBodyParser from 'koa-bodyparser'
import * as KoaRouter from 'koa-router'
import * as koaCors from '@koa/cors'
import {WebserverHandlerDeps, ServiceConfiguratorWebserverEnabled} from './interfaces'
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
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      return (callback: () => void = () => {}) => this.start(system, {}, callback)
    }

    return () => {
      throw new Error('Webserver is started while service is disabled!')
    }
  }

  private start<TServiceConfigurator extends ServiceConfigurator, TConfig extends Config, TModels extends Models>(
    system: InternalSystem<TServiceConfigurator, TConfig, TModels>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    instance: any,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    callback: () => void = () => {},
  ) {
    this.deps.Immer({}, () => ({}))
    console.log(system.Log.crit)
    console.log(instance)
    callback()
    return true
  }

  private webserverEnabled(config: Config): config is Config<ServiceConfiguratorWebserverEnabled> {
    return config.services.webserver.enabled
  }
}

export default WebserverHandler
