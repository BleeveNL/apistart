import {Dependencies, ServiceConfiguratorCacheEnabled} from './interfaces'
import {Config} from '../../systemInterfaces/config'
import * as _ from 'lodash'
import Immer from 'immer'
import Loghandler from 'loghandler'
import * as redis from 'ioredis'

export class CacheHandler {
  private deps: Dependencies

  private config: Config

  public constructor(deps: Dependencies, config: Config) {
    this.deps = deps
    this.config = config
  }

  public static factory(config: Config) {
    return new this(
      {
        Immer,
        Log: Loghandler(config.log),
        Redis: redis,
        _,
      },
      config,
    )
  }

  public async setup() {
    if (this.CacheIsEnabled(this.config)) {
      const cacheConfig = this.config.services.cache

      const client = cacheConfig.url
        ? new this.deps.Redis(cacheConfig.url, cacheConfig)
        : new this.deps.Redis(cacheConfig)

      await client.connect()
      this.setListeners(client)
      return client
    }

    throw Error('Given configuration forbids to run CacheHandler. Cache is disabled in configuration object.')
  }

  private CacheIsEnabled(config: Config): config is Config<ServiceConfiguratorCacheEnabled> {
    return config.services.cache.enabled
  }

  private setListeners(client: redis.Redis) {
    client.on('connect', (...args) => {
      this.deps.Log.info('Connection to redis is established', {}, args)
    })

    client.on('error', (err: Error, ...args) => {
      err.message = `REDIS: ${err.message}`
      this.deps.Log.err(err, {errorObj: err}, args)
    })

    client.on('close', (...args) => {
      this.deps.Log.info('Connection to redis is closed', {}, args)
    })

    client.on('end', (...args) => {
      this.deps.Log.info('Connection to redis is ended', {}, args)
    })

    client.on('ready', (...args) => {
      this.deps.Log.info('Redis is booted and ready for use!', {}, args)
    })
  }
}

export default CacheHandler
