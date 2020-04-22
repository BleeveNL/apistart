import Microservice from './microservice'
import configSchema from './validationSchemas/config.schema'
import {Config as TConfig} from './systemInterfaces/config'
import {ServiceConfigurator as TServiceConfigurator} from './systemInterfaces/serviceConfigurator'
import {Models as TModels, Model as TModel} from './services/database/interfaces/model'
import {Migration as TMigration} from './services/database/interfaces/migration'
import {Seed as TSeed} from './services/database/interfaces/seed'
import {IMiddleware} from './services/webserver/interfaces/middleware'
import {CustomDependencies as TCustomDependencies} from './services/webserver/interfaces/dependencies'
import {IController} from './services/webserver/interfaces/controller'
import {IParam} from './services/webserver/interfaces/param'
import {QueueEventListener as IQueueEventListener, QueueService} from './services/queue/interfaces'
import {WebserverServiceEnabled} from './services/webserver/interfaces/webserverServiceEnabled'
import * as koa from 'koa'

export const apiStart = <
  ServiceConfigurator extends TServiceConfigurator = TServiceConfigurator,
  Config extends TConfig<ServiceConfigurator> = TConfig<ServiceConfigurator>,
  Models extends TModels = TModels
>(
  config: unknown,
) => {
  if (Microservice.validateConfig<Config>(config)) {
    return Microservice.factory<ServiceConfigurator, Config, Models>(config)
  }

  throw configSchema.validate(config, {allowUnknown: true}).error
}
export default apiStart

export type ServiceConfigurator<
  TCache = boolean,
  TDb = boolean,
  TQueue = false | QueueService,
  TWebserver = false | WebserverServiceEnabled
> = TServiceConfigurator<TCache, TDb, TQueue, TWebserver>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Config<Services extends ServiceConfigurator = any> = TConfig<Services>

export type Controller<
  Dependencies extends TCustomDependencies = {},
  ServiceConfigurator extends TServiceConfigurator = TServiceConfigurator,
  Config extends TConfig<ServiceConfigurator> = TConfig<ServiceConfigurator>,
  Models extends TModels = TModels,
  Context extends koa.Context = koa.Context
> = IController<Dependencies, ServiceConfigurator, Config, Models, Context>

export type Middleware<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Dependencies extends TCustomDependencies = any,
  ServiceConfigurator extends TServiceConfigurator = TServiceConfigurator,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Config extends TConfig<ServiceConfigurator> = TConfig<ServiceConfigurator>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Models extends TModels = TModels
> = IMiddleware<Dependencies, ServiceConfigurator, Config, Models>

export type Param<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Dependencies extends TCustomDependencies = any,
  ServiceConfigurator extends TServiceConfigurator = TServiceConfigurator,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Config extends TConfig<ServiceConfigurator> = TConfig<ServiceConfigurator>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Models extends TModels = TModels
> = IParam<Dependencies, ServiceConfigurator, Config, Models>

export type QueueEventListener<
  ServiceConfigurator extends TServiceConfigurator,
  Dependencies extends TCustomDependencies,
  Config extends TConfig<ServiceConfigurator>,
  Models extends TModels
> = IQueueEventListener<ServiceConfigurator, Dependencies, Config, Models>

export type Model = TModel
export type Models = TModels
export type Migration = TMigration
export type Seed = TSeed
