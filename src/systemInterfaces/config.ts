import {Config as logHandlerConfig} from 'loghandler'
import {DisabledService} from './services'
import {CacheConfig} from '../services/cache/interfaces'
import {QueueService} from './serviceConfigurator'
import {DatabaseConfig} from '../services/database/interfaces'
import {QueueConfig} from '../services/queue/interfaces'
import {WebserverConfig} from '../services/webserver/interfaces/config/webserverConfig'
import {WebserverServiceEnabled} from '../services/webserver/interfaces/webserverServiceEnabled'
import {ApiStartSettings} from './apiStartSettings'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface Config<TSettings extends ApiStartSettings = any> {
  readonly app: {
    readonly env: string
    readonly name: string
    readonly version: string
  }
  readonly log: logHandlerConfig
  readonly services: {
    readonly cache: TSettings['ServiceConfigurator']['cache'] extends true ? CacheConfig : DisabledService
    readonly database: TSettings['ServiceConfigurator']['database'] extends true ? DatabaseConfig : DisabledService
    readonly queue: TSettings['ServiceConfigurator']['queue'] extends QueueService
      ? QueueConfig<TSettings['ServiceConfigurator']['queue']['exchanges']>
      : DisabledService
    readonly webserver: TSettings['ServiceConfigurator']['webserver'] extends WebserverServiceEnabled
      ? WebserverConfig<TSettings, TSettings['ServiceConfigurator']['webserver']>
      : DisabledService
  }
}
