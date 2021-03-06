import produce from 'immer'
import * as Redis from 'ioredis'
import {Log} from 'loghandler'
import {EnabledService} from '../../systemInterfaces/services'
import {ServiceConfigurator} from '../../systemInterfaces/serviceConfigurator'

export interface Dependencies {
  readonly Immer: typeof produce
  readonly Log: Log
  readonly Redis: typeof Redis
}

export interface CacheConfig extends EnabledService, Redis.RedisOptions {
  readonly url?: string
}

export interface ServiceConfiguratorCacheEnabled extends ServiceConfigurator {
  cache: true
}
