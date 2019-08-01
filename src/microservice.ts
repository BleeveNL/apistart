import logHandler from 'loghandler'
import * as joi from '@hapi/joi'
import configSchema from './validationSchemas/config.schema'
import {Config} from './systemInterfaces/config'
import {Dependencies} from './interfaces'
import CacheHandler from './services/cache/cacheHandler'
import DatabaseHandler from './services/database/databaseHandler'

export class Microservice<TConfig extends Config = Config> {
  private readonly deps: Dependencies

  private readonly config: TConfig

  public constructor(deps: Dependencies, config: TConfig) {
    this.deps = deps
    this.config = config
  }

  public static factory<TConfig extends Config = Config>(config: TConfig) {
    return new this<TConfig>(
      {
        joi,
        log: logHandler(config.log),
        services: {
          cache: CacheHandler.factory(config),
          database: DatabaseHandler.factory(config),
        },
      },
      config,
    )
  }

  public static validateConfig<TConfig extends Config = Config>(config: unknown): config is TConfig {
    const validate = joi.validate(config, configSchema, {allowUnknown: true})
    return validate.error === null
  }

  public async setup() {
    const [cache, DB] = await Promise.all([this.GetCache(), this.getDB()])

    const system = {
      Cache: cache,
      Config: this.config,
      DB,
      Log: this.deps.log,
    }

    return system
  }

  private async GetCache() {
    return this.config.services.cache.enabled ? this.deps.services.cache.setup() : null
  }

  private async getDB() {
    return this.config.services.database.enabled ? this.deps.services.database.setup() : null
  }
}

export default Microservice
