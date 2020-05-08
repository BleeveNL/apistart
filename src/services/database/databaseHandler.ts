import {Config} from '../../systemInterfaces/config'
import Immer from 'immer'
import Loghandler from 'loghandler'
import {Dependencies, ServiceConfiguratorDBEnabled} from './interfaces'
import {Sequelize, Options} from 'sequelize'
import * as fs from 'fs'
import Migrations from './models/migrations'
import {Model, Models} from './interfaces/model'

export class DatabaseHandler {
  private deps: Dependencies

  private config: Config

  public constructor(deps: Dependencies, config: Config) {
    this.deps = deps
    this.config = config
  }

  public static factory(config: Config) {
    return new this(
      {
        Immer,
        Log: Loghandler(config.log),
        Sequelize,
        fs,
        systemModels: [Migrations],
      },
      config,
    )
  }

  public async setup() {
    if (this.DBisEnabled(this.config)) {
      const config = this.config
      const connection = this.connect(config.services.database)
      await connection.authenticate().then(async () => {
        this.deps.Log.info('Database connection is made')
        await this.SyncMigrationTable(connection, this.deps.systemModels).catch(err => {
          this.deps.Log.err('Error during syncing system DB Models', err)
        })
      })

      return connection
    }

    throw new Error(`Given configuration forbids to run DatabaseHandler. Cache is disabled in configuration object.`)
  }

  public getModels<TModels extends Models>(DB: Sequelize): TModels {
    if (this.DBisEnabled(this.config)) {
      const models = this.config.services.database.models
      let output: Models = {}

      for (const model of models) {
        output = this.deps.Immer(output, draft => {
          model.init(model.structure, {
            ...model.settings,
            sequelize: DB,
          })
          draft[model.name] = model
        })
      }

      return output as TModels
    }

    throw new Error(`Database "getModels()" shouldn't be called, because service is turned off by configuration!`)
  }

  private DBisEnabled(config: Config): config is Config<ServiceConfiguratorDBEnabled> {
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

  private async SyncMigrationTable(DB: Sequelize, models: Model[]) {
    for (const model of models) {
      model.init(model.structure, {sequelize: DB, ...model.settings})
      await model.sync()
    }
  }
}

export default DatabaseHandler
