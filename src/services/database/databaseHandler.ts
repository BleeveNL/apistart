import {ApiStartSettings} from '../../systemInterfaces/apiStartSettings'
import {Config} from '../../systemInterfaces/config'
import {MikroORM, Connection, IDatabaseDriver, EntityRepository, AnyEntity} from '@mikro-orm/core'
import {MikroORMOptions} from '@mikro-orm/core/utils/Configuration'
import {LogHandlerResults} from 'loghandler/lib/interfaces'
import {EntityRepositoryList} from './interfaces/entityRepositoryList.interface'
import {ServiceConfiguratorDBEnabled} from './interfaces/serviceConfiguratorDBEnabled.interface'
import {DatabaseConfig} from './interfaces/databaseConfig.interface'

export interface SysDeps {
  Log: LogHandlerResults
}

export interface Dependencies extends SysDeps {
  MikroORM: typeof MikroORM
}

export class DatabaseHandler<TSettings extends ApiStartSettings> {
  private orm?: MikroORM<IDatabaseDriver<Connection>>

  public constructor(private deps: Dependencies, private config: Config<TSettings>) {}

  public static factory<TSettings extends ApiStartSettings>(sysDeps: SysDeps, config: Config<TSettings>) {
    return new this<TSettings>(
      {
        ...sysDeps,
        MikroORM,
      },
      config,
    )
  }

  public async setup() {
    if (this.DBisEnabled(this.config)) {
      const config = this.config
      const orm = await this.connect(config.services.database)
      this.orm = orm
      return orm
    }

    throw new Error(`Given configuration forbids to run DatabaseHandler. Datbase is disabled in configuration object.`)
  }

  public async getModels(round = 0): Promise<EntityRepositoryList<TSettings['Models']>> {
    if (this.DBisEnabled(this.config) && this.orm && (await this.orm.isConnected())) {
      const config = this.config
      const models: {[key: string]: EntityRepository<AnyEntity>} = {}

      for (const entityName in config.services.database.models) {
        const entity = config.services.database.models[entityName]
        models[entityName] = this.orm.em.getRepository(entity)
      }

      return models as unknown as EntityRepositoryList<TSettings['Models']>
    } else {
      if (round < 4) {
        await this.setup()
        return this.getModels(round++)
      }
    }

    throw new Error(`Couldn't get Entities, because there went something wrong with connection to database.`)
  }

  private DBisEnabled(config: Config): config is Config<ApiStartSettings<ServiceConfiguratorDBEnabled>> {
    return config.services.database.enabled
  }

  private async connect(config: DatabaseConfig<TSettings['Models']>) {
    const entities: MikroORMOptions['entities'] = []
    for (const entityName in config.models) {
      const entity = config.models[entityName]
      entities.push(entity)
    }

    return this.deps.MikroORM.init(
      {
        ...config,
        entities,
        autoJoinOneToOneOwner: true,
        cache: {
          enabled: false,
        },
        debug: true,
        discovery: {
          warnWhenNoEntities: false,
          requireEntitiesArray: true,
          alwaysAnalyseProperties: false,
        },
        ensureIndexes: true,
        implicitTransactions: config.type === 'mongo',
        logger: this.getLogger(config.logger),
        propagateToOneOwner: true,
        strict: true,
        validate: true,
      },
      true,
    )
  }

  private getLogger(loggerFunction?: (message: string) => void): (message: string) => void {
    const log = this.deps.Log
    return (msg: string) => {
      log.debug(msg)
      if (loggerFunction) {
        loggerFunction(msg)
      }
    }
  }
}

export default DatabaseHandler
