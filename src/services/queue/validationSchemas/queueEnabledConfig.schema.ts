import * as joi from '@hapi/joi'

export default joi.object({
  enabled: joi.valid(true).required(),
  exchanges: joi
    .array()
    .items(
      joi.object({
        name: joi.string().required(),
        options: joi
          .object({
            alternateExchange: joi.string().optional(),
            arguments: joi.any().optional(),
            autoDelete: joi.boolean().optional(),
            durable: joi.boolean().optional(),
            internal: joi.boolean().optional(),
          })
          .optional(),
        type: joi.valid('default', 'direct', 'fanout', 'header', 'topic').required(),
      }),
    )
    .min(1)
    .required(),
  frameMax: joi.number().optional(),
  heartbeat: joi.number().optional(),
  hostname: joi.string().optional(),
  locale: joi.string().optional(),
  password: joi.string().optional(),
  port: joi.number().optional(),
  protocol: joi.string().optional(),
  username: joi.string().optional(),
  vhost: joi.string().optional(),
})
