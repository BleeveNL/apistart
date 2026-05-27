import {Redis} from 'ioredis'
import {Log} from 'loghandler'
import {ApiStartSettings} from './apiStartSettings'
import SystemHelpers from '../helpers/interface'
import {QueueHandlerSetup} from '../services/queue/interfaces/queueHandlerSetup.interface'

export interface InternalSystem<TSettings extends ApiStartSettings> {
  readonly Cache: TSettings['ServiceConfigurator']['cache'] extends true ? Redis : undefined
  readonly Config: TSettings['Config']
  readonly Helpers: SystemHelpers & TSettings['Helpers']
  readonly Log: Log
  readonly Events: QueueHandlerSetup<TSettings>['client']
}
