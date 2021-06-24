import {Redis} from 'ioredis'
import {Log} from 'loghandler'
import {ApiStartSettings} from './apiStartSettings'
import SystemHelpers from '../helpers/interface'
import {MikroORM, IDatabaseDriver, Connection} from '@mikro-orm/core'
import {EntityRepositoryList} from '../services/database/interfaces/entityRepositoryList.interface'
import {QueueHandlerSetup} from '../services/queue/interfaces/queueHandlerSetup.interface'

export interface InternalSystem<TSettings extends ApiStartSettings> {
  readonly Cache: TSettings['ServiceConfigurator']['cache'] extends true ? Redis : undefined
  readonly Config: TSettings['Config']
  readonly DB: TSettings['ServiceConfigurator']['database'] extends true
    ? MikroORM<IDatabaseDriver<Connection>>
    : undefined
  readonly Helpers: SystemHelpers & TSettings['Helpers']
  readonly Log: Log
  readonly Models: TSettings['ServiceConfigurator']['database'] extends true
    ? EntityRepositoryList<TSettings['Models']>
    : undefined
  readonly Events: QueueHandlerSetup<TSettings>['client']
}
