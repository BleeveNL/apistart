import Microservice from './microservice'
import {validate} from '@hapi/joi'
import configSchema from './validationSchemas/config.schema'
import {Config} from './systemInterfaces/config'

export const apiStart = <TConfig extends Config>(config: unknown) => {
  if (Microservice.validateConfig<TConfig>(config)) {
    return Microservice.factory<TConfig>(config)
  }

  throw validate(config, configSchema)
}

export default apiStart
