import Microservice from './microservice'
import configSchema from './validationSchemas/config.schema'
import {Config} from './systemInterfaces/config'
import {ServiceConfigurator} from './systemInterfaces/serviceConfigurator'
import {Models} from './services/database/interfaces/model'

export const apiStart = <
  TServiceConfigurator extends ServiceConfigurator = ServiceConfigurator,
  TConfig extends Config<TServiceConfigurator> = Config<TServiceConfigurator>,
  TModels extends Models = Models
>(
  config: unknown,
) => {
  if (Microservice.validateConfig<TConfig>(config)) {
    return Microservice.factory<TServiceConfigurator, TConfig, TModels>(config)
  }

  throw configSchema.validate(config, {allowUnknown: true}).error
}

export default apiStart
export {ServiceConfigurator} from './systemInterfaces/serviceConfigurator'
export {Config} from './systemInterfaces/config'
export {IController} from './services/webserver/interfaces/controller'
export {Methods} from 'koa-advanced-router'
export {IMiddleware, MiddlewareFunction} from './services/webserver/interfaces/middleware'
export {IParam} from './services/webserver/interfaces/param'
export {IRoute} from './services/webserver/interfaces/route'
export {Version as IVersion} from './services/webserver/interfaces/version'
export {Models, Model} from './services/database/interfaces/model'
export {Migration} from './services/database/interfaces/migration'
export {Seed} from './services/database/interfaces/seed'
export {QueueEventListener, QueueService} from './services/queue/interfaces'
export {WebserverServiceEnabled} from './services/webserver/interfaces/webserverServiceEnabled'
