import {Redis} from 'ioredis'
import {Sequelize} from 'sequelize/types'
import {QueueHandlerSetup} from '../services/queue/interfaces'
import {Log} from 'loghandler'
import {ApiStartSettings} from './apiStartSettings'
import SystemHelpers from '../helpers/interface'

export interface InternalSystem<TSettings extends ApiStartSettings> {
  readonly Cache: TSettings['ServiceConfigurator']['cache'] extends true ? Redis : undefined
  readonly Config: TSettings['Config']
  readonly DB: TSettings['ServiceConfigurator']['database'] extends true ? Sequelize : undefined
  readonly Helpers: SystemHelpers & TSettings['Helpers']
  readonly Log: Log
  readonly Models: TSettings['ServiceConfigurator']['database'] extends true ? TSettings['Models'] : undefined
  readonly Events: QueueHandlerSetup<TSettings>['client']
}
