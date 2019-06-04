/* eslint-disable @typescript-eslint/no-explicit-any */
import * as chai from 'chai'
import * as _ from 'lodash'
import * as faker from 'faker'
import immer from 'immer'
import DefaultExport, {CacheHandler} from '../../../services/cache/cacheHandler'
import configMocked from '../../mocks/config.mock'
import DependencyMock from './mocks/dependencies.mock'
import {Config} from '../../../systemInterfaces/config'
import {ServiceConfiguratorCacheEnabled} from '../../../services/cache/interfaces'
import {Instance as RedisInstance} from '../../mocks/nodeModules/redis'

const assert = chai.assert

suite('Test CacheHandler (./services/cache/cacheHandler.ts)', () => {
  let correctConfig = _.cloneDeep(configMocked.correct)

  beforeEach(() => {
    correctConfig = _.cloneDeep(configMocked.correct)
  })

  test('Returns as default a instanceOf the cacheHandler Class', () => {
    assert.instanceOf(new DefaultExport({} as any, correctConfig), CacheHandler)
  })

  test('Object has an static Factory function', () => {
    assert.isFunction(CacheHandler.factory)
  })

  test('factory gets 1 parameter', () => {
    assert.equal(CacheHandler.factory.length, 1)
  })

  test('factory() returns instance of cacheHanlder', () => {
    assert.instanceOf(CacheHandler.factory(correctConfig), CacheHandler)
  })

  suite('Test setup()', () => {
    const cacheHandlerClass = new CacheHandler(DependencyMock.dependencies, correctConfig)

    beforeEach(() => {
      DependencyMock.reset()
    })

    test('There is a function called setup', () => {
      assert.isFunction(cacheHandlerClass.setup)
    })

    test('Setup throws Error when cache is disabled in config', async () => {
      const config = immer(correctConfig, draft => {
        draft.storage.cache.enabled = false
      })
      const cacheHandler = new CacheHandler(DependencyMock.dependencies, config)
      try {
        await cacheHandler.setup()
      } catch (err) {
        assert.instanceOf(err, Error)
        assert.equal(
          err.message,
          'Given configuration forbids to run CacheHandler. Cache is disabled in configuration object.',
        )
      }
    })

    suite('When Cache service is enabled, IORedis is correctly called to connect to redis DB', () => {
      test('When URL is given make connection over URL', async () => {
        const url = faker.internet.url()

        const config: Config<ServiceConfiguratorCacheEnabled> = {
          ...correctConfig,
          storage: {
            ...correctConfig.storage,
            cache: {
              enabled: true,
              url,
            },
          },
        }

        const cacheHandler = new CacheHandler(DependencyMock.dependencies, config)
        await cacheHandler.setup()

        assert.isTrue(DependencyMock.stubs.redis.constructor.called)
        assert.equal(DependencyMock.stubs.redis.constructor.callCount, 1)
        assert.equal(DependencyMock.stubs.redis.constructor.args[0][0], url)
        assert.deepEqual(DependencyMock.stubs.redis.constructor.args[0][1], config.storage.cache)
      })

      test('When URL is not given make connection by other settings', async () => {
        const config: Config<ServiceConfiguratorCacheEnabled> = {
          ...correctConfig,
          storage: {
            ...correctConfig.storage,
            cache: {
              enabled: true,
              host: 'example.com',
              port: 1234,
            },
          },
        }

        const cacheHandler = new CacheHandler(DependencyMock.dependencies, config)
        await cacheHandler.setup()

        assert.isTrue(DependencyMock.stubs.redis.constructor.called)
        assert.equal(DependencyMock.stubs.redis.constructor.callCount, 1)
        assert.deepEqual(DependencyMock.stubs.redis.constructor.args[0][0], config.storage.cache)
      })

      test('connect() is called after instanceOf ioredis is created.', async () => {
        const config: Config<ServiceConfiguratorCacheEnabled> = {
          ...correctConfig,
          storage: {
            ...correctConfig.storage,
            cache: {
              enabled: true,
              host: 'example.com',
              port: 1234,
            },
          },
        }

        const cacheHandler = new CacheHandler(DependencyMock.dependencies, config)
        await cacheHandler.setup()

        assert.isTrue(DependencyMock.stubs.redis.connect.called)
      })
    })

    test('Listeners are created for redis and communicates to Loghandler', async () => {
      const config: Config<ServiceConfiguratorCacheEnabled> = {
        ...correctConfig,
        storage: {
          ...correctConfig.storage,
          cache: {
            enabled: true,
            host: 'example.com',
            port: 1234,
          },
        },
      }

      const cacheHandler = new CacheHandler(DependencyMock.dependencies, config)
      await cacheHandler.setup()

      assert.isTrue(DependencyMock.stubs.redis.on.called)
      assert.equal(DependencyMock.stubs.redis.on.callCount, 5)
    })

    test('setup() returns instanceOf ioredis when Cache is enabled', async () => {
      const config: Config<ServiceConfiguratorCacheEnabled> = {
        ...correctConfig,
        storage: {
          ...correctConfig.storage,
          cache: {
            enabled: true,
            host: 'example.com',
            port: 1234,
          },
        },
      }

      const cacheHandler = new CacheHandler(DependencyMock.dependencies, config)
      const client = await cacheHandler.setup()

      assert.instanceOf(client, RedisInstance)
    })
  })
})
