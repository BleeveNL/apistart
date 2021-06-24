import {EnabledService} from '../../../systemInterfaces/services'
import * as Redis from 'ioredis'

export interface CacheConfig extends EnabledService, Redis.RedisOptions {
  readonly url?: string
}

export default CacheConfig
