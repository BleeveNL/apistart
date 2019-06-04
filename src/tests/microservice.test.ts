/* eslint-disable @typescript-eslint/no-explicit-any */
import * as chai from 'chai'
import * as _ from 'lodash'
import * as faker from 'faker'
import DefaultExport, {Microservice} from '../microservice'
import * as mockedLogHandler from './mocks/nodeModules/logHandler'
import * as joi from '@hapi/joi'
import {Log} from 'loghandler'
import mockedConfig from './mocks/config.mock'
import * as CacheHandlerMock from './mocks/cacheHandler.mock'
import CacheHandler from '../services/cache/cacheHandler'

const assert = chai.assert

suite('Test plugin (microservice.ts).', () => {
  let MicroserviceClass: Microservice = new Microservice(
    {
      joi,
      log: (new mockedLogHandler.Instance() as unknown) as Log,
      services: {
        cache: new CacheHandlerMock.Instance() as CacheHandler,
      },
    },
    _.cloneDeep(mockedConfig.correct),
  )

  beforeEach(() => {
    mockedLogHandler.reset()
    CacheHandlerMock.reset()
  })

  afterEach(() => {})

  test('Returns as default a instanceOf the Microservice Class', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    assert.instanceOf(
      new DefaultExport(
        {
          joi,
          log: (new mockedLogHandler.Instance() as unknown) as Log,
          services: {
            cache: new CacheHandlerMock.Instance() as CacheHandler,
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

    test("factory() throws error when config isn't valid according to schema!", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      assert.throws(() => Microservice.factory(mockedConfig.error))
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
      let MicroserviceClass2: Microservice = new Microservice(
        {
          joi,
          log: (new mockedLogHandler.Instance() as unknown) as Log,
          services: {
            cache: new CacheHandlerMock.Instance() as CacheHandler,
          },
        },
        {
          ...mockedConfig.correct,
          storage: {
            ...mockedConfig.correct.storage,
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

        console.log(microservice.Cache)

        assert.isNotNull(microservice.Cache)
        assert.equal(microservice.Cache, returnedValue)
      })
    })
  })
})
