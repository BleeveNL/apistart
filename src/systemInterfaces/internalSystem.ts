import {Config} from './config'
import {Models} from '../services/database/interfaces/model'
import {ServiceConfigurator, QueueService} from './serviceConfigurator'
import {Redis} from 'ioredis'
import {Sequelize} from 'sequelize/types'
import {QueueClient} from '../services/queue/interfaces'
import {Log} from 'loghandler'

export interface InternalSystem<
  TConfig extends Config,
  TModels extends Models,
  TServiceConfigurator extends ServiceConfigurator
> {
  readonly Cache: TServiceConfigurator['cache'] extends true ? Redis : undefined
  readonly Config: TConfig
  readonly DB: TServiceConfigurator['db'] extends true ? Sequelize : undefined
  readonly Log: Log
  readonly Models: TServiceConfigurator['db'] extends true ? TModels : undefined
  readonly Queue: TServiceConfigurator['queue'] extends QueueService
    ? QueueClient<TServiceConfigurator['queue']['exchanges']>
    : undefined
}
