import * as joi from '@hapi/joi'
import {Log} from 'loghandler'
import {ServiceConfigurator} from './systemInterfaces/serviceConfigurator'
import CacheHandler from './services/cache/cacheHandler'

export interface Dependencies {
  readonly joi: typeof joi
  readonly log: Log
  readonly services: {
    readonly cache: CacheHandler
  }
}

export interface CacheEnabledServiceConfigurator extends ServiceConfigurator {
  cache: true
}
