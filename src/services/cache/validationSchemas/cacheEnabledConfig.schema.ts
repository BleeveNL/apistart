import * as joi from '@hapi/joi'

export default joi.object({
  autoResendUnfulfilledCommands: joi.boolean().optional(),
  autoResubscribe: joi.boolean().optional(),
  connectTimeout: joi
    .number()
    .integer()
    .optional(),
  connectionName: joi.string().optional(),
  db: joi
    .number()
    .integer()
    .optional(),
  dropBufferSupport: joi.boolean().optional(),
  enableOfflineQueue: joi.boolean().optional(),
  enableReadyCheck: joi.boolean().optional(),
  enabled: joi.valid(true).required(),
  family: joi.valid(4, 6).optional(),
  host: joi.string().optional(),
  keepAlive: joi
    .number()
    .integer()
    .optional(),
  keyPrefix: joi.string().optional(),
  lazyConnect: joi.boolean().optional(),
  name: joi.string().optional(),
  password: joi.string().optional(),
  path: joi.string().optional(),
  port: joi
    .number()
    .integer()
    .optional(),
  readOnly: joi.boolean().optional(),
  reconnectOnError: joi
    .func()
    .arity(1)
    .optional(),
  retryStrategy: joi
    .func()
    .arity(1)
    .optional(),
  sentinels: joi
    .array()
    .items(
      joi.object({
        host: joi.string().required(),
        port: joi
          .number()
          .integer()
          .required(),
      }),
    )
    .optional(),
  showFriendlyErrorStack: joi.boolean().optional(),
  tls: joi.object().optional(),
  url: joi.string().optional(),
})
