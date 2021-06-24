/* eslint-disable @typescript-eslint/no-explicit-any */
import {assert} from 'chai'
import * as LoghandlerMock from '../../mocks/nodeModules/logHandler.mock'
import {Log} from 'loghandler'
import * as faker from 'faker'
import immer from 'immer'
import DefaultExport, {CacheHandler} from '../../../services/cache/cacheHandler'
import configMocked from '../../mocks/config.mock'
import DependencyMock from './mocks/dependencies.mock'
import {Config} from '../../../systemInterfaces/config'
import {ServiceConfiguratorCacheEnabled} from '../../../services/cache/interfaces/serviceConfiguratorCacheEnabled.interface'
import {Instance as RedisInstance} from '../../mocks/nodeModules/redis.mock'
import {ApiStartSettings} from '../../../systemInterfaces/apiStartSettings'

suite('Test CacheHandler (./services/cache/cacheHandler.ts)', () => {
  let correctConfig: Config<any> = JSON.parse(JSON.stringify(configMocked.correct.everythingDisabled))

  setup(() => {
    LoghandlerMock.reset()
    correctConfig = JSON.parse(JSON.stringify(configMocked.correct.everythingDisabled))
  })

  test('Returns as default a instanceOf the cacheHandler Class', () => {
    assert.instanceOf(new DefaultExport({} as any, correctConfig), CacheHandler)
  })

  test('Object has an static Factory function', () => {
    assert.isFunction(CacheHandler.factory)
  })

  test('factory gets 2 parameter', () => {
    assert.equal(CacheHandler.factory.length, 2)
  })

  test('factory() returns instance of cacheHanlder', () => {
    assert.instanceOf(
      CacheHandler.factory({Log: new LoghandlerMock.Instance() as unknown as Log}, correctConfig),
      CacheHandler,
    )
  })

  suite('Test setup()', () => {
    const cacheHandlerClass = new CacheHandler(DependencyMock.dependencies, correctConfig)

    setup(() => {
      DependencyMock.reset()
    })

    test('There is a function called setup', () => {
      assert.isFunction(cacheHandlerClass.setup)
    })

    test('Setup throws Error when cache is disabled in config', async () => {
      const config = immer(correctConfig, draft => {
        draft.services.cache.enabled = false
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
        const config = immer(configMocked.correct.everythingEnabled, configDraft => {
          configDraft.services.cache.url = faker.internet.url()
        })

        const cacheHandler = new CacheHandler(DependencyMock.dependencies, config)
        await cacheHandler.setup()

        assert.isTrue(DependencyMock.stubs.redis.constructor.called)
        assert.equal(DependencyMock.stubs.redis.constructor.callCount, 1)

        assert.deepEqual(DependencyMock.stubs.redis.constructor.args[0][0], config.services.cache.url)
        assert.deepEqual(DependencyMock.stubs.redis.constructor.args[0][1], config.services.cache)
      })

      test('When URL is not given make connection by other settings', async () => {
        const cacheHandler = new CacheHandler(DependencyMock.dependencies, configMocked.correct.everythingEnabled)
        await cacheHandler.setup()

        assert.isTrue(DependencyMock.stubs.redis.constructor.called)
        assert.equal(DependencyMock.stubs.redis.constructor.callCount, 1)
        assert.deepEqual(
          DependencyMock.stubs.redis.constructor.args[0][0],
          configMocked.correct.everythingEnabled.services.cache,
        )
      })

      test('When URL is  given make connection by other settings', async () => {
        const cacheHandler = new CacheHandler(DependencyMock.dependencies, configMocked.correct.everythingEnabled)
        await cacheHandler.setup()

        assert.isTrue(DependencyMock.stubs.redis.constructor.called)
        assert.equal(DependencyMock.stubs.redis.constructor.callCount, 1)
        assert.deepEqual(
          DependencyMock.stubs.redis.constructor.args[0][0],
          configMocked.correct.everythingEnabled.services.cache,
        )
      })
    })

    test('Listeners are created for redis and communicates to Loghandler', async () => {
      const cacheHandler = new CacheHandler(DependencyMock.dependencies, configMocked.correct.everythingEnabled)
      await cacheHandler.setup()

      assert.isTrue(DependencyMock.stubs.redis.on.called)
      assert.equal(DependencyMock.stubs.redis.on.callCount, 5)
    })

    test('setup() returns instanceOf ioredis when Cache is enabled', async () => {
      const config: Config<ApiStartSettings<ServiceConfiguratorCacheEnabled>> = {
        ...correctConfig,
        services: {
          cache: {
            enabled: true,
            host: 'example.com',
            port: 1234,
          },
          database: {
            enabled: false,
          },
          queue: {
            enabled: false,
          },
          webserver: {
            enabled: false,
          },
        },
      }

      const cacheHandler = new CacheHandler(DependencyMock.dependencies, config)
      const client = await cacheHandler.setup()

      assert.instanceOf(client, RedisInstance)
    })
  })
})
