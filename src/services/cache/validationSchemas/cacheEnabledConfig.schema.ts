import {valid, object, string, number, boolean, func, array} from '@hapi/joi'

export default object({
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
