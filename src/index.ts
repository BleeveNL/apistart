import Microservice from './microservice'
import configSchema from './validationSchemas/config.schema'
import {Config} from './systemInterfaces/config'

export const apiStart = <TConfig extends Config>(config: unknown) => {
  if (Microservice.validateConfig<TConfig>(config)) {
    return Microservice.factory<TConfig>(config)
  }

  throw configSchema.validate(config, {allowUnknown: true})
}

export default apiStart
