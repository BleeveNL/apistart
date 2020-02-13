import {Config as logHandlerConfig} from 'loghandler'
import {DisabledService} from './services'
import {CacheConfig} from '../services/cache/interfaces'
import {ServiceConfigurator, QueueService} from './serviceConfigurator'
import {DatabaseConfig} from '../services/database/interfaces'
import {QueueConfig} from '../services/queue/interfaces'
import {WebserverConfig} from '../services/webserver/config/webserverConfig'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface Config<Services extends ServiceConfigurator = any> {
  readonly app: {
    readonly env: string
    readonly name: string
    readonly version: string
  }
  readonly log: logHandlerConfig
  readonly services: {
    readonly cache: Services['cache'] extends true ? CacheConfig : DisabledService
    readonly database: Services['db'] extends true ? DatabaseConfig : DisabledService
    readonly queue: Services['queue'] extends QueueService
      ? QueueConfig<Services['queue']['exchanges']>
      : DisabledService
    readonly webserver: Services['webserver'] extends true ? WebserverConfig : DisabledService
  }
}
