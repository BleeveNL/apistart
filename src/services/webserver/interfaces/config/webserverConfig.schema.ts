import * as joi from '@hapi/joi'

const dependenciesSchema = joi.alternatives().try(joi.object(), joi.function().maxArity(1))

const middlewareSchema = joi.array().items(
  joi.alternatives().try(
    joi.function().maxArity(1),
    joi.object({
      dependencies: dependenciesSchema,
      fnc: joi.function().maxArity(1),
    }),
  ),
)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AllowedOriginValues = joi.alternatives().try(joi.string(), (joi.object() as any).regex(), joi.function().arity(1))

const CorsOptions = joi.object({
  allowCredentials: joi.boolean().required(),
  allowedHeaders: joi.array().items(joi.string()),
  allowedMethods: joi.array().items(joi.string()),
  allowedOrigin: joi.alternatives().try(AllowedOriginValues, joi.array().items(AllowedOriginValues)).required(),
  exposedHeaders: joi.array().items(joi.string()).required(),
  maxAge: joi.number().required(),
})

const routerSchema = joi.array().items({
  controller: joi.function().maxArity(1).required(),
  dependencies: dependenciesSchema.optional(),
  method: joi.alternatives().try(joi.array().items(joi.string()), joi.string()).required(),
  options: joi
    .object({
      allowedMethods: joi.boolean().optional(),
      cors: CorsOptions.optional(),
    })
    .optional(),
  params: joi.object().optional(),
  path: joi
    .alternatives()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .try((joi.object() as any).regex(), joi.string())
    .required(),
})

const versions = {
  connection: joi
    .object({
      http: joi
        .alternatives()
        .try(
          joi.object({enabled: joi.valid(false).required()}),
          joi.object({
            enabled: joi.valid(true).required(),
            port: joi.number().integer().optional(),
          }),
        )
        .required(),
      https: joi
        .alternatives()
        .try(
          joi.object({enabled: joi.valid(false).required()}),
          joi.object({
            cert: joi
              .object({
                cert: joi.alternatives().try(joi.string(), joi.binary()),
                key: joi.alternatives().try(joi.string(), joi.binary()),
              })
              .required(),
            enabled: joi.valid(true).required(),
            port: joi.number().integer().optional(),
          }),
        )
        .required(),
    })
    .required(),
  middleware: middlewareSchema,
  settings: joi
    .object({
      allowedMethods: joi.boolean().optional(),
      bodyParser: joi
        .object({
          detectJSON: joi.function().maxArity(1).optional(),
          enableTypes: joi.array().items(joi.string()).required(),
          enabled: joi.valid(true).required(),
          encode: joi.string().optional(),
          extendTypes: joi
            .object({
              form: joi.array().items(joi.string()).optional(),
              json: joi.array().items(joi.string()).optional(),
              text: joi.array().items(joi.string()).optional(),
            })
            .optional(),
          formLimit: joi.string().optional(),
          jsonLimit: joi.string().optional(),
          onerror: joi.function().maxArity(2).optional(),
          strict: joi.boolean().optional(),
          textLimit: joi.string().optional(),
        })
        .optional(),
      cors: joi.alternatives().try(CorsOptions, joi.array().items(CorsOptions)).optional(),
      expose: joi.boolean().optional(),
      prefix: joi.string().optional(),
      proxy: joi.boolean().optional(),
      sensitive: joi.boolean().optional(),
      silent: joi.boolean().optional(),
      subdomainOffset: joi.number().optional(),
      versionHandler: joi.alternatives().try(joi.valid('url', 'header'), joi.function().arity(1)).required(),
    })
    .required(),
  versions: joi
    .array()
    .items(
      joi.object({
        enabled: joi.boolean().required(),
        identifier: joi.string().required(),
        middleware: middlewareSchema,
        router: routerSchema,
      }),
    )
    .required(),
}

const normal = {
  connection: joi
    .object({
      http: joi
        .alternatives()
        .try(
          joi.object({enabled: joi.valid(false).required()}),
          joi.object({
            enabled: joi.valid(true).required(),
            port: joi.number().integer().optional(),
          }),
        )
        .required(),
      https: joi
        .alternatives()
        .try(
          joi.object({enabled: joi.valid(false).required()}),
          joi.object({
            cert: joi
              .object({
                cert: joi.alternatives().try(joi.string(), joi.binary()),
                key: joi.alternatives().try(joi.string(), joi.binary()),
              })
              .required(),
            enabled: joi.valid(true).required(),
            port: joi.number().integer().optional(),
          }),
        )
        .required(),
    })
    .required(),
  middleware: middlewareSchema,
  router: routerSchema.required(),
  settings: joi
    .object({
      allowedMethods: joi.boolean().optional(),
      bodyParser: joi
        .object({
          detectJSON: joi.function().maxArity(1).optional(),
          enableTypes: joi.array().items(joi.string()).required(),
          enabled: joi.valid(true).required(),
          encode: joi.string().optional(),
          extendTypes: joi
            .object({
              form: joi.array().items(joi.string()).optional(),
              json: joi.array().items(joi.string()).optional(),
              text: joi.array().items(joi.string()).optional(),
            })
            .optional(),
          formLimit: joi.string().optional(),
          jsonLimit: joi.string().optional(),
          onerror: joi.function().maxArity(2).optional(),
          strict: joi.boolean().optional(),
          textLimit: joi.string().optional(),
        })
        .optional(),
      cors: joi.alternatives().try(CorsOptions, joi.array().items(CorsOptions)).optional(),
      expose: joi.boolean().optional(),
      ignoreCaptures: joi.boolean().optional(),
      proxy: joi.boolean().optional(),
      sensitive: joi.boolean().optional(),
      silent: joi.boolean().optional(),
      strict: joi.boolean().optional(),
      subdomainOffset: joi.number().optional(),
      versionHandler: joi.valid(false),
    })
    .required(),
}

export default joi.alternatives().try(versions, normal)
