import * as joi from '@hapi/joi'

export default {
  security: joi
    .object({
      cors: joi
        .alternatives()
        .try(
          joi.object({
            allowHeaders: joi
              .alternatives()
              .try(joi.string(), joi.array().items(joi.string()))
              .optional(),
            allowMethods: joi
              .alternatives()
              .try(joi.string(), joi.array().items(joi.string()))
              .optional(),
            credentials: joi.boolean().optional(),
            enabled: joi.valid(true).required(),
            exposeHeaders: joi
              .alternatives()
              .try(joi.string(), joi.array().items(joi.string()))
              .optional(),
            keepHeadersOnError: joi.boolean().optional(),
            maxAge: joi
              .alternatives()
              .try(joi.string(), joi.number())
              .optional(),
            origin: joi
              .alternatives()
              .try(joi.string(), joi.func().arity(1))
              .optional(),
          }),
          joi.object({
            enabled: joi.valid(false).required(),
          }),
        )
        .optional(),
    })
    .optional(),
  settings: joi
    .object({
      connection: joi
        .object({
          http: joi
            .alternatives()
            .try(
              joi.object({enabled: joi.valid(false).required()}),
              joi.object({
                enabled: joi.valid(true).required(),
                port: joi
                  .number()
                  .min(1)
                  .max(65535)
                  .optional(),
              }),
            )
            .required(),
          https: joi
            .alternatives()
            .try(
              joi.object({enabled: joi.valid(false).required()}),
              joi.object({
                enabled: joi.valid(true).required(),
                cert: joi
                  .object({
                    cert: joi
                      .alternatives()
                      .try(joi.string(), joi.binary())
                      .required(),
                    key: joi
                      .alternatives()
                      .try(joi.string(), joi.binary())
                      .required(),
                  })
                  .required(),
                port: joi
                  .number()
                  .min(1)
                  .max(65535)
                  .optional(),
              }),
            )
            .required(),
        })
        .required(),
      proxy: joi.boolean().required(),
      subdomainOffset: joi
        .number()
        .min(0)
        .required(),
      versionHandler: joi.valid(false, 'url', 'header').required(),
    })
    .required(),
}
