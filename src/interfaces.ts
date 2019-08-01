import * as joi from '@hapi/joi'
import {Log} from 'loghandler'
import {ServiceConfigurator} from './systemInterfaces/serviceConfigurator'
import CacheHandler from './services/cache/cacheHandler'
import DatabaseHandler from './services/database/databaseHandler'

export interface Dependencies {
  readonly joi: typeof joi
  readonly log: Log
  readonly services: {
    readonly database: DatabaseHandler
    readonly cache: CacheHandler
  }
}

export interface CacheEnabledServiceConfigurator extends ServiceConfigurator {
  cache: true
}
