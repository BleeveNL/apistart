import logHandler from 'loghandler'
import * as Joi from 'joi'
import configSchema from './validationSchemas/config.schema'
import {Config} from './systemInterfaces/config'
import {Dependencies} from './interfaces'
import CacheHandler from './services/cache/cacheHandler'
import DatabaseHandler from './services/database/databaseHandler'
import QueueHandler from './services/queue/queueHandler'
import {Sequelize} from 'sequelize/types'
import {Models} from './services/database/interfaces/model'
import {InternalSystem} from './systemInterfaces/internalSystem'
import {Redis} from 'ioredis'
import WebserverHandler from './services/webserver/webserverHandler'
import {ApiStartSettings} from './systemInterfaces/apiStartSettings'
import SystemHelpers from './helpers/index'
import {ApiStart} from './systemInterfaces/apiStart'
export class Microservice<TSettings extends ApiStartSettings = ApiStartSettings> {
  private readonly deps: Dependencies<TSettings>

  private readonly config: Config<TSettings>

  public constructor(deps: Dependencies<TSettings>, config: Config<TSettings>) {
    this.deps = deps
    this.config = config
  }

  public static factory<TSettings extends ApiStartSettings>(
    config: Config<TSettings>,
    customHelpers: TSettings['Helpers'],
  ): Microservice<TSettings> {
    return new this<TSettings>(
      {
        helpers: {...SystemHelpers, ...customHelpers},
        joi: Joi,
        log: logHandler(config.log),
        services: {
          cache: CacheHandler.factory<TSettings>(config),
          database: DatabaseHandler.factory<TSettings>(config),
          queue: QueueHandler.factory<TSettings>(config),
          webserver: WebserverHandler.factory<TSettings>(config),
        },
      },
      config,
    )
  }

  public static configIsValid<Tsettings extends ApiStartSettings>(config: unknown): config is Config<Tsettings> {
    const validate = configSchema.validate(config, {allowUnknown: true})
    return validate.error === undefined
  }

  public static validateConfig(config: unknown): Joi.ValidationResult {
    const validate = configSchema.validate(config, {allowUnknown: true})
    return validate
  }

  public async setup(): Promise<ApiStart<TSettings>> {
    const [cache, DB, Queue] = await Promise.all([this.GetCache(), this.getDB(), this.getQueue()])

    const system: InternalSystem<TSettings> = {
      Cache: cache,
      Config: this.config,
      DB,
      Events: Queue.client,
      Helpers: this.deps.helpers,
      Log: this.deps.log,
      Models: this.GetModels(DB),
    }

    return {
      ...system,
      EventListener: Queue.server(system) as ApiStart<TSettings>['EventListener'],
      Webserver: this.deps.services.webserver.setup(system) as ApiStart<TSettings>['Webserver'],
    }
  }

  private async GetCache() {
    return ((this.config.services.cache.enabled ? this.deps.services.cache.setup() : undefined) as unknown) as Promise<
      TSettings['ServiceConfigurator']['cache'] extends true ? Redis : undefined
    >
  }

  private async getDB() {
    return ((this.config.services.database.enabled
      ? this.deps.services.database.setup()
      : undefined) as unknown) as TSettings['ServiceConfigurator']['database'] extends true ? Sequelize : undefined
  }

  private async getQueue() {
    return this.deps.services.queue.setup()
  }

  private GetModels<TModels extends Models>(db: Sequelize | undefined) {
    return ((this.config.services.database.enabled && db
      ? this.deps.services.database.getModels<TModels>(db)
      : undefined) as unknown) as TSettings['ServiceConfigurator']['database'] extends true ? TModels : undefined
  }
}

export default Microservice
