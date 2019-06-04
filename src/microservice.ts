import logHandler from 'loghandler'
import * as joi from '@hapi/joi'
import configSchema from './validationSchemas/config.schema'
import {Config} from './systemInterfaces/config'
import {Dependencies} from './interfaces'

export class Microservice<TConfig extends Config = Config> {
  private readonly deps: Dependencies
  private readonly config: TConfig

  public constructor(deps: Dependencies, config: TConfig) {
    this.deps = deps
    this.config = config
  }

  public static factory<TConfig extends Config = Config>(config: unknown) {
    if (this.validateConfig<TConfig>(config)) {
      return new this<TConfig>(
        {
          joi,
          log: logHandler(config.log),
        },
        config,
      )
    } else {
      throw Error(`Given config isn't valid according to schema.`)
    }
  }

  public static validateConfig<TConfig extends Config = Config>(config: unknown): config is TConfig {
    const validate = joi.validate(config, configSchema, {allowUnknown: true})
    return validate.error === null
  }

  public async setup() {
    const [cache, db, queue] = await Promise.all([this.GetCache(), this.GetDB(), this.GetQueue()])

    const system = {
      Cache: cache,
      Config: this.config,
      DB: db,
      Log: this.deps.log,
      Queue: queue,
    }

    return system
  }

  private async GetCache() {
    return this.config.storage.cache.enabled ? await this.deps.services.cache.setup() : null
  }

  private async GetDB() {
    return true
  }

  private async GetQueue() {
    return true
  }
}

export default Microservice
