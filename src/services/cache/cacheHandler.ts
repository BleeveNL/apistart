import {Dependencies, ServiceConfiguratorCacheEnabled} from './interfaces'
import {Config} from '../../systemInterfaces/config'
import Immer from 'immer'
import Loghandler from 'loghandler'
import * as redis from 'ioredis'
import {ApiStartSettings} from '../../systemInterfaces/apiStartSettings'

export class CacheHandler<TSettings extends ApiStartSettings> {
  private deps: Dependencies

  private config: Config<TSettings>

  public constructor(deps: Dependencies, config: Config) {
    this.deps = deps
    this.config = config
  }

  public static factory<TSettings extends ApiStartSettings>(config: Config<TSettings>): CacheHandler<TSettings> {
    return new this<TSettings>(
      {
        Immer,
        Log: Loghandler(config.log),
        Redis: redis,
      },
      config,
    )
  }

  public async setup<TSettings extends ApiStartSettings>(): Promise<
    TSettings['ServiceConfigurator']['cache'] extends false ? never : Promise<redis.Redis>
  > {
    if (this.CacheIsEnabled(this.config)) {
      const cacheConfig = this.config.services.cache

      const client = cacheConfig.url
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
