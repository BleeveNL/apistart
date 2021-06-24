import {Config} from '../../systemInterfaces/config'
import Immer from 'immer'
import redis from 'ioredis'
import {ApiStartSettings} from '../../systemInterfaces/apiStartSettings'
import ServiceConfiguratorCacheEnabled from './interfaces/ServiceConfiguratorCacheEnabled.interface'
import CacheConfig from './interfaces/cacheConfig.interface'
import {LogHandlerResults} from 'loghandler/lib/interfaces'

export interface SysDeps {
  Log: LogHandlerResults
}

export interface Dependencies extends SysDeps {
  readonly Immer: typeof Immer
  readonly Redis: typeof redis
}

export class CacheHandler<TSettings extends ApiStartSettings> {
  public constructor(private deps: Dependencies, private config: Config<TSettings>) {
    this.deps = deps
    this.config = config
  }

  public static factory<TSettings extends ApiStartSettings>(
    sysdeps: SysDeps,
    config: Config<TSettings>,
  ): CacheHandler<TSettings> {
    return new this<TSettings>(
      {
        ...sysdeps,
        Immer,
        Redis: redis,
      },
      config,
    )
  }

  public async setup() {
    if (this.CacheIsEnabled(this.config)) {
      const config = this.config
      const cacheConfig: CacheConfig = config.services.cache

      const client: redis.Redis = cacheConfig.url
        ? new this.deps.Redis(cacheConfig.url, cacheConfig)
        : new this.deps.Redis(cacheConfig)

      this.setListeners(client)
      return client
    }

    throw Error('Given configuration forbids to run CacheHandler. Cache is disabled in configuration object.')
  }

  private CacheIsEnabled(config: Config): config is Config<ApiStartSettings<ServiceConfiguratorCacheEnabled>> {
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
