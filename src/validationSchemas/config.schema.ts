import LogSchema from 'loghandler/lib/schemas/configSchema'
import {valid, alternatives, object, string, number, boolean, func, array} from '@hapi/joi'

const serviceDisabled = object({
  enabled: valid(false).required(),
})

const cacheEnabled = object({
  autoResendUnfulfilledCommands: boolean().optional(),
  autoResubscribe: boolean().optional(),
  connectTimeout: number()
    .integer()
    .optional(),
  connectionName: string().optional(),
  db: number()
    .integer()
    .optional(),
  dropBufferSupport: boolean().optional(),
  enableOfflineQueue: boolean().optional(),
  enableReadyCheck: boolean().optional(),
  enabled: valid(true).required(),
  family: valid([4, 6]).optional(),
  host: string().optional(),
  keepAlive: number()
    .integer()
    .optional(),
  keyPrefix: string().optional(),
  lazyConnect: boolean().optional(),
  name: string().optional(),
  password: string().optional(),
  path: string().optional(),
  port: number()
    .integer()
    .optional(),
  readOnly: boolean().optional(),
  reconnectOnError: func()
    .arity(1)
    .optional(),
  retryStrategy: func()
    .arity(1)
    .optional(),
  sentinels: array()
    .items(
      object({
        host: string().required(),
        port: number()
          .integer()
          .required(),
      }),
    )
    .optional(),
  showFriendlyErrorStack: boolean().optional(),
  tls: object().optional(),
  url: string().optional(),
})

export default object({
  app: object({
    env: string().required(),
    name: string().required(),
    version: string().required(),
  }).required(),
  log: LogSchema,
  storage: object({
    cache: alternatives()
      .try([serviceDisabled, cacheEnabled])
      .required(),
  }).required(),
})
