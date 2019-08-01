import {valid, object, string, number, boolean} from '@hapi/joi'

export default object({
  database: string().optional(),
  define: object().optional(),
  dialect: valid(['mysql', 'postgres', 'sqlite', 'mariadb', 'mssql', 'mariadb']).optional(),
  dialectModule: object().optional(),
  dialectModulePath: string().optional(),
  dialectOptions: object().optional(),
  enabled: valid(true).required(),
  folder: object({
    migrations: string().required(),
    seeds: string().required(),
  }).required(),
  hooks: object().optional(),
  host: string().optional(),
  isolationLevel: string().optional(),
  native: boolean().optional(),
  omitNull: boolean().optional(),
  operatorsAliases: object().optional(),
  password: string().optional(),
  pool: object().optional(),
  port: number()
    .integer()
    .optional(),
  protocol: string().optional(),
  query: object().optional(),
  quoteIdentifiers: boolean().optional(),
  replication: object().optional(),
  retry: object().optional(),
  set: object().optional(),
  ssl: boolean().optional(),
  standardConformingStrings: boolean().optional(),
  storage: string().optional(),
  sync: object().optional(),
  timezone: string().optional(),
  typeValidation: boolean().optional(),
  username: string().optional(),
})
