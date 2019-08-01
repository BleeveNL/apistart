/* eslint-disable @typescript-eslint/no-explicit-any */
import {assert} from 'chai'
import * as _ from 'lodash'
import * as faker from 'faker'
import DefaultExport, {Microservice} from '../microservice'
import * as mockedLogHandler from './mocks/nodeModules/logHandler.mock'
import * as joi from '@hapi/joi'
import {Log} from 'loghandler'
import mockedConfig from './mocks/config.mock'
import * as CacheHandlerMock from './mocks/cacheHandler.mock'
import * as databaseHandlerMock from './mocks/databaseHandler.mock'
import CacheHandler from '../services/cache/cacheHandler'
import DatabaseHandler from '../services/database/databaseHandler'

suite('Test plugin (microservice.ts).', () => {
  const MicroserviceClass: Microservice = new Microservice(
    {
      joi,
      log: (new mockedLogHandler.Instance() as unknown) as Log,
      services: {
        cache: (new CacheHandlerMock.Instance() as any) as CacheHandler,
        database: (new databaseHandlerMock.Instance() as any) as DatabaseHandler,
      },
    },
    _.cloneDeep(mockedConfig.correct),
  )

  teardown(() => {
    mockedLogHandler.reset()
    CacheHandlerMock.reset()
    databaseHandlerMock.reset()
  })

  test('Returns as default a instanceOf the Microservice Class', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    assert.instanceOf(
      new DefaultExport(
        {
          joi,
          log: (new mockedLogHandler.Instance() as unknown) as Log,
          services: {
            cache: (new CacheHandlerMock.Instance() as any) as CacheHandler,
            database: (new databaseHandlerMock.Instance() as any) as DatabaseHandler,
          },
        },
        mockedConfig.correct,
      ),
      Microservice,
    )
  })

  suite('Test factory()', () => {
    test('factory() function exists and is static.', () => {
      assert.typeOf(Microservice.factory, 'function')
    })

    test('factory() needs one parameter', () => {
      assert.equal(Microservice.factory.length, 1)
    })

    test('factory() return instanceOf MicroService Class', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      assert.instanceOf(Microservice.factory(mockedConfig.correct), Microservice)
    })
  })

  suite('Test setup()', () => {
    test('exists', () => {
      assert.typeOf(MicroserviceClass.setup, 'function')
    })

    test("setup() doesn't need any parameters", () => {
      assert.equal(MicroserviceClass.setup.length, 0)
    })

    test('Returns an object.', async () => {
      assert.typeOf(await MicroserviceClass.setup(), 'object')
    })

    suite('Test of Caching Service is working properly when caching is disabled', () => {
      test('CacheHandler.setup() is called during microservice Setup Process', async () => {
        await MicroserviceClass.setup()
        assert.isFalse(CacheHandlerMock.stubs.setup.called)
      })

      test('Microservice returns Null on Cache, when cache service is disabled', async () => {
        const microservice = await MicroserviceClass.setup()
        assert.isNull(microservice.Cache)
      })
    })

    suite('Test of Caching Service is working properly when caching is enabled', () => {
      const MicroserviceClass2: Microservice = new Microservice(
        {
          joi,
          log: (new mockedLogHandler.Instance() as unknown) as Log,
          services: {
            cache: (new CacheHandlerMock.Instance() as any) as CacheHandler,
            database: (new databaseHandlerMock.Instance() as any) as DatabaseHandler,
          },
        },
        {
          ...mockedConfig.correct,
          services: {
            ...mockedConfig.correct.services,
            cache: {
              enabled: true,
            },
          },
        },
      )
      test('CacheHandler.setup() is called once during microservice Setup Process', async () => {
        await MicroserviceClass2.setup()
        assert.isTrue(CacheHandlerMock.stubs.setup.called)
        assert.equal(CacheHandlerMock.stubs.setup.callCount, 1)
      })

      test('Microservice returns Null on Cache, when cache service is disabled', async () => {
        const returnedValue: any = faker.random.objectElement()
        CacheHandlerMock.stubs.setup.returns(returnedValue)

        const microservice = await MicroserviceClass2.setup()
        assert.isNotNull(microservice.Cache)
        assert.equal(microservice.Cache, returnedValue)
      })
    })

    suite('Test of Database Service is working properly when database is disabled', () => {
      test('CacheHandler.setup() is called during microservice Setup Process', async () => {
        await MicroserviceClass.setup()
        assert.isFalse(CacheHandlerMock.stubs.setup.called)
      })

      test('Microservice returns Null on Cache, when cache service is disabled', async () => {
        const microservice = await MicroserviceClass.setup()
        assert.isNull(microservice.Cache)
      })
    })

    suite('Test of Database Service is working properly when database is enabled', () => {
      const MicroserviceClass2: Microservice = new Microservice(
        {
          joi,
          log: (new mockedLogHandler.Instance() as unknown) as Log,
          services: {
            cache: (new CacheHandlerMock.Instance() as any) as CacheHandler,
            database: (new databaseHandlerMock.Instance() as any) as DatabaseHandler,
          },
        },
        mockedConfig.dbEnabled,
      )
      test('database.setup() is called once during microservice Setup Process', async () => {
        await MicroserviceClass2.setup()
        assert.isTrue(databaseHandlerMock.stubs.setup.called)
        assert.equal(databaseHandlerMock.stubs.setup.callCount, 1)
      })

      test('Microservice returns Null on DB, when database service is disabled', async () => {
        const returnedValue: any = faker.random.objectElement()
        databaseHandlerMock.stubs.setup.returns(returnedValue)

        const microservice = await MicroserviceClass2.setup()
        assert.isNotNull(microservice.DB)
        assert.equal(microservice.DB, returnedValue)
      })
    })
  })
})
