import {assert} from 'chai'
import * as _ from 'lodash'
import immer from 'immer'
import DefaultExport, {WebserverHandler} from '../../../services/webserver/webserverHandler'
import configMocked from '../../mocks/config.mock'
import * as CacheHandlerMock from '../../mocks/cacheHandler.mock'
import * as DatabaseHandlerMock from '../../mocks/databaseHandler.mock'
import * as LogHandlerMock from '../../mocks/nodeModules/logHandler.mock'
import * as ModulesMock from '../../mocks/nodeModules'
import * as QueueHandlerMock from '../../mocks/queueHandler.mock'
import {WebserverHandlerDeps} from '../../../services/webserver/interfaces'
import {InternalSystem} from '../../../systemInterfaces/internalSystem'
import {Config} from '../../../systemInterfaces/config'

suite('Test Webserver Handler (./services/webserver/webserverHandler.ts)', () => {
  let correctConfig = _.cloneDeep(configMocked.correct.everythingDisabled)
  let dependenciesMock = ({
    Http: _.cloneDeep(ModulesMock.http.Instance),
    Https: _.cloneDeep(ModulesMock.https.Instance),
    Immer: immer,
    Koa: _.cloneDeep(ModulesMock.koa.Instance),
    KoaBodyParser: _.cloneDeep(ModulesMock.koaBodyParser.Instance),
    KoaCors: _.cloneDeep(ModulesMock.koaCors.Instance),
    Koarouter: _.cloneDeep(ModulesMock.koaRouter.Instance),
  } as unknown) as WebserverHandlerDeps

  afterEach(() => {
    ModulesMock.reset()
  })

  setup(() => {
    correctConfig = _.cloneDeep(configMocked.correct.everythingDisabled)
    dependenciesMock = ({
      Http: _.cloneDeep(ModulesMock.http.Instance),
      Https: _.cloneDeep(ModulesMock.https.Instance),
      Immer: immer,
      Koa: _.cloneDeep(ModulesMock.koa.Instance),
      KoaBodyParser: _.cloneDeep(ModulesMock.koaBodyParser.Instance),
      KoaCors: _.cloneDeep(ModulesMock.koaCors.Instance),
      Koarouter: _.cloneDeep(ModulesMock.koaRouter.Instance),
    } as unknown) as WebserverHandlerDeps
  })

  test('Returns as default a instanceOf the queueHandler Class', () => {
    assert.instanceOf(new DefaultExport({} as any, correctConfig), WebserverHandler)
  })

  test('Object has an static Factory function', () => {
    assert.isFunction(WebserverHandler.factory)
  })

  test('factory gets 1 parameter', () => {
    assert.equal(WebserverHandler.factory.length, 1)
  })

  test('factory() returns instance of WebserverHandler', () => {
    assert.instanceOf(WebserverHandler.factory(correctConfig), WebserverHandler)
  })

  suite('setup() works as expected!', () => {
    let webserverHandler = WebserverHandler.factory(correctConfig)
    let internalSystem = ({
      Cache: CacheHandlerMock.Instance,
      Config: correctConfig,
      DB: DatabaseHandlerMock.Instance,
      Log: ModulesMock.logHandler.Instance,
      Models: {},
      Queue: QueueHandlerMock.Instance,
    } as unknown) as InternalSystem<any, Config, {}>

    setup(() => {
      internalSystem = ({
        Cache: CacheHandlerMock.Instance,
        Config: correctConfig,
        DB: DatabaseHandlerMock.Instance,
        Log: ModulesMock.logHandler.Instance,
        Models: {},
        Queue: QueueHandlerMock.Instance,
      } as unknown) as InternalSystem<any, Config, {}>

      webserverHandler = new WebserverHandler(dependenciesMock, correctConfig)
    })

    afterEach(() => {
      CacheHandlerMock.reset()
      DatabaseHandlerMock.reset()
      LogHandlerMock.reset()
      QueueHandlerMock.reset()
    })

    test('setup() required 1 attribute', () => {
      assert.equal(webserverHandler.setup.length, 1)
    })

    suite('when webserver service is disabled', () => {
      test('returns function after called', () => {
        const webserver = webserverHandler.setup(internalSystem)
        assert.typeOf(webserver, 'function')
      })

      test('returns function that throws Exception when started', () => {
        const webserver = webserverHandler.setup(internalSystem)
        assert.throws(webserver, 'Webserver is started while service is disabled!')
      })
    })

    suite('when webserver service is enabled', () => {
      let config = _.cloneDeep(configMocked.correct.everythingEnabled)
      let webserverHandler = new WebserverHandler(dependenciesMock, config)

      setup(() => {
        config = _.cloneDeep(configMocked.correct.everythingEnabled)
        webserverHandler = new WebserverHandler(dependenciesMock, config)
      })

      test('returns function after called', () => {
        const webserver = webserverHandler.setup(internalSystem)
        assert.typeOf(webserver, 'function')
      })

      test('returns function that returns true after called', () => {
        const webserver = webserverHandler.setup(internalSystem)
        assert.isTrue(webserver())
      })
    })
  })
})
