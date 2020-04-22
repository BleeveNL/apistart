import * as joi from '@hapi/joi'

export default joi.object({
  database: joi.string().optional(),
  define: joi.object().optional(),
  dialect: joi.valid('mysql', 'postgres', 'sqlite', 'mariadb', 'mssql', 'mariadb').optional(),
  dialectModule: joi.object().optional(),
  dialectModulePath: joi.string().optional(),
  dialectOptions: joi.object().optional(),
  enabled: joi.valid(true).required(),
  folder: joi
    .object({
      migrations: joi.string().required(),
      seeds: joi.string().required(),
    })
    .required(),
  hooks: joi.object().optional(),
  host: joi.string().optional(),
  isolationLevel: joi.string().optional(),
  native: joi.boolean().optional(),
  omitNull: joi.boolean().optional(),
  operatorsAliases: joi.object().optional(),
  password: joi.string().optional(),
  pool: joi.object().optional(),
  port: joi.number().integer().optional(),
  protocol: joi.string().optional(),
  query: joi.object().optional(),
  quoteIdentifiers: joi.boolean().optional(),
  replication: joi.object().optional(),
  retry: joi.object().optional(),
  set: joi.object().optional(),
  ssl: joi.boolean().optional(),
  standardConformingStrings: joi.boolean().optional(),
  storage: joi.string().optional(),
  sync: joi.object().optional(),
  timezone: joi.string().optional(),
  typeValidation: joi.boolean().optional(),
  username: joi.string().optional(),
})
