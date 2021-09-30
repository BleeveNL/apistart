import Microservice from './microservice'
import configSchema from './validationSchemas/config.schema'
import {ApiStartSettings} from './systemInterfaces/apiStartSettings'
import * as Joi from 'joi'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const apiStart = <TSettings extends ApiStartSettings<any>>(
  config: unknown,
  helpers: TSettings['Helpers'],
): Microservice => {
  if (Microservice.configIsValid<TSettings>(config)) {
    return Microservice.factory<TSettings>(config, helpers)
  }

  throw configSchema.validate(config, {allowUnknown: true}).error
}

export const ValidateConfig = (config: unknown): Joi.ValidationResult | true => {
  const validate = Microservice.validateConfig(config)

  if (validate.error === undefined) {
    return true
  } else {
    return validate
  }
}

export default apiStart
export {ApiStartSettings as TypeSettings} from './systemInterfaces/apiStartSettings'
export {loadEnvFactory as loadEnv} from './helpers/fnc/loadEnv'
export {env} from './helpers/fnc/env'
export {ServiceConfigurator} from './systemInterfaces/serviceConfigurator'
export {Config} from './systemInterfaces/config'
export {IController} from './services/webserver/interfaces/controller'
export {Methods} from 'koa-advanced-router'
export {IMiddleware, MiddlewareFunction} from './services/webserver/interfaces/middleware'
export {IParam, ParamFunction} from './services/webserver/interfaces/param'
export {IRoute} from './services/webserver/interfaces/route'
export {Version as IVersion} from './services/webserver/interfaces/version'
export {QueueEventListener} from './services/queue/interfaces/queueEventListener.interface'
export {QueueEventListenerHandler} from './services/queue/interfaces/queueEventListenerHandler.interface'
export {QueueService} from './services/queue/interfaces/queueService.interface'
export {QueueEventListenerList} from './services/queue/interfaces/queueEventListenerList.interface'
export {WebserverServiceEnabled} from './services/webserver/interfaces/webserverServiceEnabled'
export {Context} from 'koa'
export {Dependencies as SystemDependencies} from './systemInterfaces/dependencies'
export {
  Entity as Model,
  Property,
  ManyToOne,
  OneToMany,
  OneToOne,
  ManyToMany,
  SerializedPrimaryKey,
  PrimaryKey,
  Enum,
  Formula,
  Index,
  Unique,
  BaseEntity as BaseModel,
} from '@mikro-orm/core'
export {Models} from './services/database/interfaces/models.interface'
