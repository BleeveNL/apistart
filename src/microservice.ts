import logHandler from 'loghandler'
import * as joi from '@hapi/joi'
import configSchema from './validationSchemas/config.schema'
import {Config} from './systemInterfaces/config'
import {Dependencies} from './interfaces'
import CacheHandler from './services/cache/cacheHandler'
import DatabaseHandler from './services/database/databaseHandler'
import QueueHandler from './services/queue/queueHandler'
import {Sequelize} from 'sequelize/types'
import {Models} from './services/database/interfaces/model'
import {ServiceConfigurator} from './systemInterfaces/serviceConfigurator'
import {InternalSystem} from './systemInterfaces/internalSystem'
import {Redis} from 'ioredis'
import WebserverHandler from './services/webserver/webserverHandler'

export class Microservice<
  TServiceConfigurator extends ServiceConfigurator = ServiceConfigurator,
  TConfig extends Config = Config,
  TModels extends Models = Models
> {
  private readonly deps: Dependencies

  private readonly config: TConfig

  public constructor(deps: Dependencies, config: TConfig) {
    this.deps = deps
    this.config = config
  }

  public static factory<
    TServiceConfigurator extends ServiceConfigurator = ServiceConfigurator,
    TConfig extends Config = Config,
    TModels extends Models = Models
  >(config: TConfig) {
    return new this<TServiceConfigurator, TConfig, TModels>(
      {
        joi,
        log: logHandler(config.log),
        services: {
          cache: CacheHandler.factory(config),
          database: DatabaseHandler.factory(config),
          queue: QueueHandler.factory(config),
          webserver: WebserverHandler.factory(config),
        },
      },
      config,
    )
  }

  public static validateConfig<TConfig extends Config = Config>(config: unknown): config is TConfig {
    const validate = configSchema.validate(config, {allowUnknown: true})
    return validate.error === null
  }

  public async setup() {
    const [cache, DB, Queue] = await Promise.all([this.GetCache(), this.getDB(), this.getQueue()])

    const system: InternalSystem<TServiceConfigurator, TConfig, TModels> = {
      Cache: cache,
      Config: this.config,
      DB,
      Events: Queue.client,
      Log: this.deps.log,
      Models: this.GetModels(DB),
    }

    return {
      ...system,
      EventListener: Queue.server,
      Webserver: this.deps.services.webserver.setup(system),
    }
  }

  private async GetCache() {
    return ((this.config.services.cache.enabled ? this.deps.services.cache.setup() : undefined) as unknown) as Promise<
      TServiceConfigurator['cache'] extends true ? Redis : undefined
    >
  }

  private async getDB() {
    return ((this.config.services.database.enabled
      ? this.deps.services.database.setup()
      : undefined) as unknown) as TServiceConfigurator['db'] extends true ? Sequelize : undefined
  }

  private async getQueue() {
    const queue = await this.deps.services.queue.setup()
    return queue
  }

  private GetModels<TModels extends Models>(db: Sequelize | undefined) {
    console.log(db)
    return ((this.config.services.database.enabled && db
      ? this.deps.services.database.getModels<TModels>(db)
      : undefined) as unknown) as TServiceConfigurator['db'] extends true ? TModels : undefined
  }
}

export default Microservice
