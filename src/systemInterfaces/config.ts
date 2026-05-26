import {Config as logHandlerConfig} from 'loghandler'
import {DisabledService} from './services'
import {QueueService} from './serviceConfigurator'
import {WebserverConfig} from '../services/webserver/interfaces/config/webserverConfig'
import {WebserverServiceEnabled} from '../services/webserver/interfaces/webserverServiceEnabled'
import {ApiStartSettings} from './apiStartSettings'
import CacheConfig from '../services/cache/interfaces/cacheConfig.interface'
import {QueueConfig} from '../services/queue/interfaces/queueConfig.interface'

export interface Config<TSettings extends ApiStartSettings = any> {
  readonly app: {
    readonly env: string
    readonly debug?: boolean
    readonly name: string
    readonly version: string
  }
  readonly log: logHandlerConfig
  readonly services: {
    readonly cache: TSettings['ServiceConfigurator']['cache'] extends true ? CacheConfig : DisabledService
    readonly queue: TSettings['ServiceConfigurator']['queue'] extends QueueService
      ? QueueConfig<TSettings['ServiceConfigurator']['queue']['exchanges']>
      : DisabledService
    readonly webserver: TSettings['ServiceConfigurator']['webserver'] extends WebserverServiceEnabled
      ? WebserverConfig<TSettings, TSettings['ServiceConfigurator']['webserver']>
      : DisabledService
  }
}
