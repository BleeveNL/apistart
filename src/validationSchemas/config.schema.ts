import * as joi from '@hapi/joi'
import cacheEnabledConfigSchema from '../services/cache/validationSchemas/cacheEnabledConfig.schema'
import databaseEnabledConfigSchema from '../services/database/validationSchemas/databaseEnabledConfig.schema'
import queueEnabledConfigSchema from '../services/queue/validationSchemas/queueEnabledConfig.schema'
import webserverConfigSchema from '../services/webserver/config/webserverConfig.schema'

const schema = joi.object({
  app: joi
    .object({
      env: joi.string().required(),
      name: joi.string().required(),
      version: joi.string().required(),
    })
    .required(),
  log: joi
    .object()
    .required()
    .keys({
      reporters: joi
        .array()
        .items(
          joi.object().keys({
            log: joi.func().required(),
            name: joi.string().required(),
            timeOut: joi.number().optional(),
          }),
        )
        .required(),
      reporting: joi
        .object()
        .keys({
          minimalLevel2Report: joi
            .string()
            .valid('emerg', 'alert', 'crit', 'err', 'warning', 'notice', 'info', 'debug')
            .optional(),
          silent: joi
            .boolean()
            .optional()
            .default(false),
        })
        .optional(),
    }),
  services: joi
    .object({
      cache: joi
        .alternatives()
        .try(
          joi.object({
            enabled: joi.valid(false).required(),
          }),
          cacheEnabledConfigSchema,
        )
        .required(),
      database: joi
        .alternatives()
        .try(
          joi.object({
            enabled: joi.valid(false).required(),
          }),
          databaseEnabledConfigSchema,
        )
        .required(),
      queue: joi
        .alternatives()
        .try(
          joi.object({
            enabled: joi.valid(false).required(),
          }),
          queueEnabledConfigSchema,
        )
        .required(),
      webserver: joi
        .alternatives()
        .try(
          joi.object({
            enabled: joi.valid(false).required(),
          }),
          webserverConfigSchema,
        )
        .required(),
    })
    .required(),
})

export default schema
