import {Config as logHandlerConfig} from 'loghandler'
import {DisabledService} from './services'
import {CacheConfig} from '../services/cache/interfaces'
import {ServiceConfigurator} from './serviceConfigurator'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface Config<Services extends ServiceConfigurator = any> {
  readonly app: {
    readonly env: string
    readonly name: string
    readonly version: string
  }
  readonly log: logHandlerConfig
  readonly storage: {
    readonly cache: Services['cache'] extends true ? CacheConfig : DisabledService
  }
}
