import {Config} from './config'
import {Models} from '../services/database/interfaces/model'
import {ServiceConfigurator} from './serviceConfigurator'
import {Redis} from 'ioredis'
import {Sequelize} from 'sequelize/types'
import {QueueHandlerSetup} from '../services/queue/interfaces'
import {Log} from 'loghandler'

export interface InternalSystem<
  TServiceConfigurator extends ServiceConfigurator,
  TConfig extends Config,
  TModels extends Models
> {
  readonly Cache: TServiceConfigurator['cache'] extends true ? Redis : undefined
  readonly Config: TConfig
  readonly DB: TServiceConfigurator['database'] extends true ? Sequelize : undefined
  readonly Log: Log
  readonly Models: TServiceConfigurator['database'] extends true ? TModels : undefined
  readonly Events: QueueHandlerSetup<TServiceConfigurator, TConfig, TModels>['client']
}
