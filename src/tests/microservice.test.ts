/* eslint-disable @typescript-eslint/no-explicit-any */
import {assert} from 'chai'
import DefaultExport, {Microservice} from '../microservice'
import * as mockedLogHandler from './mocks/nodeModules/logHandler.mock'
import * as joi from 'joi'
import {Log} from 'loghandler'
import mockedConfig from './mocks/config.mock'
import * as CacheHandlerMock from './mocks/cacheHandler.mock'
import * as DatabaseHandlerMock from './mocks/databaseHandler.mock'
import * as QueueHandlerMock from './mocks/queueHandler.mock'
import * as WebserverHandlerMock from './mocks/webserverHandler.mock'
import CacheHandler from '../services/cache/cacheHandler'
import DatabaseHandler from '../services/database/databaseHandler'
import QueueHandler from '../services/queue/queueHandler'
import WebserverHandler from '../services/webserver/webserverHandler'
import {Helpers} from '../systemInterfaces/helpers'
import * as faker from 'faker'

suite('Test plugin (microservice.ts).', () => {
  const MicroserviceClass: Microservice = new Microservice(
    {
      helpers: ({[faker.random.alphaNumeric()]: faker.random.alphaNumeric()} as unknown) as Helpers,
      joi,
      log: (new mockedLogHandler.Instance() as unknown) as Log,
      services: {
        cache: (new CacheHandlerMock.Instance() as any) as CacheHandler<any>,
        database: (new DatabaseHandlerMock.Instance() as any) as DatabaseHandler<any>,
        queue: (new QueueHandlerMock.Instance(false) as any) as QueueHandler<any>,
        webserver: (new WebserverHandlerMock.Instance() as any) as WebserverHandler,
      },
    },
    JSON.parse(JSON.stringify(mockedConfig.correct.everythingDisabled)),
  )

  teardown(() => {
    mockedLogHandler.reset()
    CacheHandlerMock.reset()
    DatabaseHandlerMock.reset()
    QueueHandlerMock.reset()
    WebserverHandlerMock.reset()
  })

  test('Returns as default a instanceOf the Microservice Class', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    assert.instanceOf(
      new DefaultExport(
        {
          helpers: {} as Helpers,
          joi,
          log: (new mockedLogHandler.Instance() as unknown) as Log,
          services: {
            cache: (new CacheHandlerMock.Instance() as any) as CacheHandler<any>,
            database: (new DatabaseHandlerMock.Instance() as any) as DatabaseHandler<any>,
            queue: (new QueueHandlerMock.Instance(true) as any) as QueueHandler<any>,
            webserver: (new WebserverHandlerMock.Instance() as any) as WebserverHandler,
          },
        },
        mockedConfig.correct.everythingDisabled,
      ),
      Microservice,
    )
  })

  suite('Test factory()', () => {
    test('factory() function exists and is static.', () => {
      assert.typeOf(Microservice.factory, 'function')
    })

    test('factory() needs one parameter', () => {
      assert.equal(Microservice.factory.length, 2)
    })

    test('factory() return instanceOf MicroService Class', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      assert.instanceOf(Microservice.factory(mockedConfig.correct.everythingDisabled, {}), Microservice)
    })
  })

  suite('Test setup()', () => {
    test('exists', () => {
      assert.typeOf(MicroserviceClass.setup, 'function')
    })

    test("setup() doesn't need any parameters", () => {
      assert.equal(MicroserviceClass.setup.length, 0)
    })

    test('When all services are disabled. Setup() returns object according schema', async () => {
      const microservice = await MicroserviceClass.setup()

      assert.typeOf(microservice, 'object')

      assert.isTrue('Cache' in microservice)
      assert.isUndefined(microservice.Cache)

      assert.isTrue('Config' in microservice)
      assert.deepEqual(microservice.Config, mockedConfig.correct.everythingDisabled)

      assert.isTrue('DB' in microservice)
      assert.isUndefined(microservice.DB)

      assert.isTrue('Events' in microservice)
      assert.isUndefined(microservice.Events)

      assert.isTrue('Log' in microservice)
      assert.instanceOf(microservice.Log, mockedLogHandler.Instance)

      assert.isTrue('Models' in microservice)
      assert.isUndefined(microservice.Models)

      assert.isTrue('EventListener' in microservice)
      assert.isTrue(QueueHandlerMock.stubs.setup.calledOnce)

      assert.isTrue('Webserver' in microservice)
      assert.isTrue(WebserverHandlerMock.stubs.setup.calledOnce)

      Object.keys(microservice).forEach(key => {
        assert.isTrue(
          ['Cache', 'Config', 'DB', 'Helpers', 'Events', 'Log', 'Models', 'EventListener', 'Webserver'].includes(key),
          `${key} isn't part of object schema`,
        )
      })
    })

    test('When all services are enabled. Setup() returns object according schema', async () => {
      DatabaseHandlerMock.stubs.setup.returns(true)

      const helpers = ({[faker.random.alphaNumeric()]: faker.random.alphaNumeric()} as unknown) as Helpers
      const MicroserviceClass: Microservice = new Microservice(
        {
          helpers,
          joi,
          log: (new mockedLogHandler.Instance() as unknown) as Log,
          services: {
            cache: (new CacheHandlerMock.Instance() as any) as CacheHandler<any>,
            database: (new DatabaseHandlerMock.Instance() as any) as DatabaseHandler<any>,
            queue: (new QueueHandlerMock.Instance(true) as any) as QueueHandler<any>,
            webserver: (new WebserverHandlerMock.Instance() as any) as WebserverHandler,
          },
        },
        mockedConfig.correct.everythingEnabled,
      )
      const microservice = await MicroserviceClass.setup()

      assert.typeOf(microservice, 'object')

      assert.isTrue('Cache' in microservice)
      assert.isUndefined(microservice.Cache)

      assert.isTrue('Config' in microservice)
      assert.deepEqual(microservice.Config, mockedConfig.correct.everythingEnabled)

      assert.isTrue('Helpers' in microservice)
      assert.deepEqual(microservice.Helpers, helpers)

      assert.isTrue('DB' in microservice)
      assert.isTrue(DatabaseHandlerMock.stubs.setup.calledOnce)

      assert.isTrue('Events' in microservice)
      assert.isTrue(QueueHandlerMock.stubs.setup.calledOnce)

      assert.isTrue('Log' in microservice)
      assert.instanceOf(microservice.Log, mockedLogHandler.Instance)

      assert.isTrue('Models' in microservice)
      assert.isTrue(DatabaseHandlerMock.stubs.getModels.calledOnce)

      assert.isTrue('EventListener' in microservice)
      assert.isTrue(QueueHandlerMock.stubs.setup.calledOnce)

      assert.isTrue('Webserver' in microservice)
      assert.isTrue(WebserverHandlerMock.stubs.setup.calledOnce)

      Object.keys(microservice).forEach(key => {
        assert.isTrue(
          ['Cache', 'Config', 'DB', 'Helpers', 'Events', 'Log', 'Models', 'EventListener', 'Webserver'].includes(key),
          `${key} isn't part of object schema`,
        )
      })
    })
  })
})
