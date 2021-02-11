import {Config} from '../../systemInterfaces/config'
import Immer from 'immer'
import Loghandler from 'loghandler'
import {Dependencies, ServiceConfiguratorDBEnabled} from './interfaces'
import {Sequelize, Options} from 'sequelize'
import * as fs from 'fs'
import Migrations from './models/migrations'
import {Models} from './interfaces/model'
import {ApiStartSettings} from '../../systemInterfaces/apiStartSettings'

export class DatabaseHandler<TSettings extends ApiStartSettings> {
  private deps: Dependencies

  private config: Config<TSettings>

  public constructor(deps: Dependencies, config: Config<TSettings>) {
    this.deps = deps
    this.config = config
  }

  public static factory<TSettings extends ApiStartSettings>(config: Config<TSettings>): DatabaseHandler<TSettings> {
    return new this<TSettings>(
      {
        Immer,
        Log: Loghandler(config.log),
        Sequelize,
        fs,
        systemModels: {Migrations: Migrations},
      },
      config,
    )
  }

  public async setup<TSettings extends ApiStartSettings>(): Promise<
    TSettings['ServiceConfigurator']['database'] extends false ? never : Sequelize
  > {
    if (this.DBisEnabled(this.config)) {
      const config = this.config
      const connection = this.connect(config.services.database)
      await connection.authenticate().then(async () => {
        this.deps.Log.info('Database connection is made')
        await this.SyncMigrationTable(connection, this.deps.systemModels, config).catch(err => {
          this.deps.Log.err('Error during syncing system DB Models', err)
        })
      })

      return connection as TSettings['ServiceConfigurator']['database'] extends false ? never : Sequelize
    }

    throw new Error(`Given configuration forbids to run DatabaseHandler. Cache is disabled in configuration object.`)
  }

  public getModels<TModels extends Models>(DB: Sequelize): TModels {
    if (this.DBisEnabled(this.config)) {
      const models = this.config.services.database.models
      let output: Models = {}

      for (const modelName in models) {
        const model = models[modelName]
        output = this.deps.Immer(output, draft => {
          model.init(model.structure, {
            ...model.settings,
            sequelize: DB,
          })
          draft[modelName] = model
        })
      }

      return output as TModels
    }

    throw new Error(`Database "getModels()" shouldn't be called, because service is turned off by configuration!`)
  }

  private DBisEnabled(config: Config): config is Config<ApiStartSettings<ServiceConfiguratorDBEnabled>> {
    return config.services.database.enabled
  }

  private connect(config: Options) {
    const log = this.deps.Log
    const connection = new this.deps.Sequelize({
      benchmark: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      logging: (msg: string, speed?: number, ...atr: any[]) => {
        log.debug(msg, {speed}, atr)
      },
      ...config,
    })

    return connection
  }

  private async SyncMigrationTable(
    DB: Sequelize,
    models: Models,
    config: Config<ApiStartSettings<ServiceConfiguratorDBEnabled>>,
  ) {
    for (const modelName in models) {
      const model = models[modelName]
      model.init(model.structure, {sequelize: DB, ...model.settings})
      await model.sync(config.services.database.sync)
    }
  }
}

export default DatabaseHandler
