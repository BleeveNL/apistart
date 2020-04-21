import Microservice from './microservice'
import configSchema from './validationSchemas/config.schema'
import {Config} from './systemInterfaces/config'
import {ServiceConfigurator} from './systemInterfaces/serviceConfigurator'
import {Models} from './services/database/interfaces/model'

export const apiStart = <
  TServiceConfigurator extends ServiceConfigurator = ServiceConfigurator,
  TConfig extends Config<TServiceConfigurator> = Config,
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
