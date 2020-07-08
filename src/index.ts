import Microservice from './microservice'
import configSchema from './validationSchemas/config.schema'
import {ApiStartSettings} from './systemInterfaces/apiStartSettings'
import {ValidationResult} from '@hapi/joi'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const apiStart = <TSettings extends ApiStartSettings<any>>(
  config: unknown,
  helpers: TSettings['Helpers'],
): Microservice => {
  if (Microservice.configIsValid<TSettings['Config']>(config)) {
    return Microservice.factory<TSettings>(config, helpers)
  }

  throw configSchema.validate(config, {allowUnknown: true}).error
}

export const ValidateConfig = (config: unknown): ValidationResult | true => {
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
export {Models, ModelAbstract, Model} from './services/database/interfaces/model'
export {Migration} from './services/database/interfaces/migration'
export {Seed} from './services/database/interfaces/seed'
export {QueueEventListener, QueueEventListenerHandler, QueueService} from './services/queue/interfaces'
export {WebserverServiceEnabled} from './services/webserver/interfaces/webserverServiceEnabled'
export {DBDataTypes} from './services/database/interfaces'
export {Model as BaseModel} from 'sequelize'
export {Context} from 'koa'
export {Dependencies as SystemDependencies} from './systemInterfaces/dependencies'
