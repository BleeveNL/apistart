import {config, DotenvConfigOptions, DotenvParseOutput} from 'dotenv'

interface EnvOptions extends DotenvConfigOptions {
  UndefinedAllowed?: boolean
  schema?: {
    [key: string]: {
      required?: boolean
      default?: string
      minLength?: number
      maxLenght?: number
      regex?: RegExp
    }
  }
}

interface Dependencies {
  dotEnv: typeof config
}

export const loadEnv = <TEnvvars extends DotenvParseOutput = DotenvParseOutput>(
  deps: Dependencies,
  opts?: EnvOptions,
): TEnvvars => {
  const result = deps.dotEnv(opts)

  if (opts) {
    if ('UndefinedAllowed' in opts && opts.UndefinedAllowed === false && !result.parsed) {
      if (result.error) {
        const error: Error & {errno?: number; syscall?: string; code?: string; path?: string} = result.error

        if (error.syscall === 'open' && error.code === 'ENOENT') {
          if (error.path) {
            throw new Error(`Couldn't load .env file because file "${error.path}" isn't found`)
          }
          throw new Error(`Couldn't load .env file because file isn't found`)
        }
        throw error
      }

      throw new Error(`Couldn't parse .env file, because of an unknown error!`)
    }

    if (opts.schema !== undefined && result.parsed !== undefined) {
      const parsed = result.parsed
      const schema = opts.schema

      for (const envName in schema) {
        const itemSchema = schema[envName]
        const envValue = parsed[envName]

        if (itemSchema.required === true && envValue === undefined) {
          throw new Error(`Environment variable "${envName}" isn't available in .env file.`)
        } else if (itemSchema.default && (envValue === undefined || envValue.length === 0)) {
          process.env[envName] = itemSchema.default
          result.parsed[envName] = itemSchema.default
        } else if (itemSchema.maxLenght && envValue !== undefined && envValue.length > itemSchema.maxLenght) {
          throw new Error(
            `Value of environment variable "${envName}" is too long. length exceed limit of ${itemSchema.maxLenght} characters`,
          )
        } else if (itemSchema.minLength && envValue !== undefined && envValue.length < itemSchema.minLength) {
          throw new Error(
            `Value of environment variable "${envName}" is too short. length is shorter than given minimal length of ${itemSchema.maxLenght} characters`,
          )
        } else if (itemSchema.regex && envValue.match(itemSchema.regex) === null) {
          throw new Error(`Value of environment variable "${envName}" doesn't match with given Regexp.`)
        }
      }
    }
  } else {
    if (result.parsed === undefined) {
      throw new Error("Didn't load any parsed Environment variables")
    }
  }

  return result.parsed as TEnvvars
}

export const loadEnvFactory = <TEnvvars extends DotenvParseOutput = DotenvParseOutput>(opts?: EnvOptions): TEnvvars =>
  loadEnv<TEnvvars>({dotEnv: config}, opts)

export default loadEnvFactory
