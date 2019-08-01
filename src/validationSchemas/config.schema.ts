import LogSchema from 'loghandler/lib/schemas/configSchema'
import {valid, alternatives, object, string} from '@hapi/joi'
import cacheEnabledConfigSchema from '../services/cache/validationSchemas/cacheEnabledConfig.schema'
import databaseEnabledConfigSchema from '../services/database/validationSchemas/databaseEnabledConfig.schema'

const serviceDisabled = object({
  enabled: valid(false).required(),
})

export default object({
  app: object({
    env: string().required(),
    name: string().required(),
    version: string().required(),
  }).required(),
  log: LogSchema,
  services: object({
    cache: alternatives()
      .try([serviceDisabled, cacheEnabledConfigSchema])
      .required(),
    database: alternatives()
      .try([serviceDisabled, databaseEnabledConfigSchema])
      .required(),
    queue: alternatives()
      .try([serviceDisabled, databaseEnabledConfigSchema])
      .required(),
  }).required(),
})
