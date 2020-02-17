import {assert} from 'chai'
import * as _ from 'lodash'
import * as faker from 'faker'
import immer from 'immer'
import DefaultExport, {WebserverHandler} from '../../../services/webserver/webserverHandler'
import configMocked from '../../mocks/config.mock'
import * as CacheHandlerMock from '../../mocks/cacheHandler.mock'
import * as DatabaseHandlerMock from '../../mocks/databaseHandler.mock'
import * as sinon from 'sinon'
import * as ModulesMock from '../../mocks/nodeModules'
import * as QueueHandlerMock from '../../mocks/queueHandler.mock'
import {WebserverHandlerDeps} from '../../../services/webserver/interfaces'
import {InternalSystem} from '../../../systemInterfaces/internalSystem'
import {Config} from '../../../systemInterfaces/config'
import {Module} from 'module'
import {EnabledService} from '../../../systemInterfaces/services'
import bodyParser = require('koa-bodyparser')

suite('Test Webserver Handler (./services/webserver/webserverHandler.ts)', () => {
  let correctConfig = _.cloneDeep(configMocked.correct.everythingDisabled)
  let dependenciesMock = ({
    Http: new ModulesMock.http.Instance(),
    Https: new ModulesMock.https.Instance(),
    Immer: immer,
    Koa: ModulesMock.koa.Instance,
    KoaBodyParser: ModulesMock.koaBodyParser.Instance,
    KoaCors: ModulesMock.koaCors.Instance,
    Koarouter: ModulesMock.koaRouter.Instance,
  } as unknown) as WebserverHandlerDeps

  afterEach(() => {
    ModulesMock.reset()
  })

  setup(() => {
    correctConfig = configMocked.correct.everythingDisabled
    dependenciesMock = ({
      Http: new ModulesMock.http.Instance(),
      Https: new ModulesMock.https.Instance(),
      Immer: immer,
      Koa: ModulesMock.koa.Instance,
      KoaBodyParser: ModulesMock.koaBodyParser.fn,
      KoaCors: ModulesMock.koaCors.fn,
      Koarouter: ModulesMock.koaRouter.Instance,
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
      Log: new ModulesMock.logHandler.Instance(),
      Models: {},
      Queue: QueueHandlerMock.Instance,
    } as unknown) as InternalSystem<any, Config, {}>

    setup(() => {
      internalSystem = ({
        Cache: CacheHandlerMock.Instance,
        Config: correctConfig,
        DB: DatabaseHandlerMock.Instance,
        Log: new ModulesMock.logHandler.Instance(),
        Models: {},
        Queue: QueueHandlerMock.Instance,
      } as unknown) as InternalSystem<any, Config, {}>

      webserverHandler = new WebserverHandler(dependenciesMock, correctConfig)
    })

    afterEach(() => {
      CacheHandlerMock.reset()
      DatabaseHandlerMock.reset()
      QueueHandlerMock.reset()
      ModulesMock.reset()
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

      test('Instance of Koa is called once.', () => {
        const webserver = webserverHandler.setup(internalSystem)
        assert.isTrue(ModulesMock.koa.stubs.constructor.calledOnce)
      })

      test('webserver service returns correct object after called', () => {
        const webserver = webserverHandler.setup(internalSystem)
        const webserverStarted = webserver()
        assert.isObject(webserverStarted)
        assert.isTrue('close' in webserverStarted)
        Object.keys(webserverStarted).forEach(key => {
          assert.include(['close'], key, `${key} isn't part of schema of webserver result`)
        })
      })

      suite('Test HTTP Server connection is enabled', () => {
        let config = immer(_.cloneDeep(configMocked.correct.everythingEnabled), config => {
          config.services.webserver.connection.http = {enabled: true, port: faker.random.number()}
        })
        let webserverHandler = new WebserverHandler(dependenciesMock, config)
        let webserver = webserverHandler.setup(internalSystem)

        setup(() => {
          config = immer(_.cloneDeep(configMocked.correct.everythingEnabled), config => {
            config.services.webserver.connection.http = {enabled: true, port: faker.random.number()}
          })
          webserverHandler = new WebserverHandler(dependenciesMock, config)
          webserver = webserverHandler.setup(internalSystem)
        })

        test('HTTP Server is Created an stared with listening to correct port', () => {
          if (config.services.webserver.connection.http.enabled) {
            assert.isTrue(ModulesMock.koa.stubs.callback.callCount === 0)

            const koaCallBackReturnValue = faker.random.alphaNumeric(24)
            ModulesMock.koa.stubs.callback.returns(koaCallBackReturnValue)
            webserver()

            assert.isTrue(ModulesMock.http.stubs.createServer.calledOnce)
            assert.isTrue(ModulesMock.http.stubs.createServer.args[0].length === 1)
            assert.isTrue(ModulesMock.http.stubs.createServer.args[0][0] === koaCallBackReturnValue)
            assert.isTrue(ModulesMock.koa.stubs.callback.calledOnce)
            assert.isTrue(ModulesMock.http.stubs.listen.calledOnce)
            assert.isTrue(ModulesMock.http.stubs.listen.args[0].length === 2)
            assert.isTrue(ModulesMock.http.stubs.listen.args[0][0] === config.services.webserver.connection.http.port)
          } else {
            assert.fail('Somthing weird happened')
          }
        })

        test('Http Server calls given callback function when system started listening', () => {
          if (config.services.webserver.connection.http.enabled) {
            const callbackstub = sinon.stub()

            webserver(callbackstub)

            assert.isTrue(callbackstub.calledOnce)

            assert.isTrue(callbackstub.args[0].length === 1)
            assert.deepEqual(callbackstub.args[0][0], internalSystem)
          } else {
            assert.fail('Somthing weird happened')
          }
        })

        test('Http Server Logs on info level that server is started and on which port', () => {
          if (config.services.webserver.connection.http.enabled) {
            webserver()

            let found = false

            for (const infoLog of ModulesMock.logHandler.stubs.info.args) {
              if (infoLog.length === 2 && infoLog[0] === 'Webserver is started!') {
                assert.deepEqual(infoLog[1], {
                  port: config.services.webserver.connection.http.port
                    ? config.services.webserver.connection.http.port
                    : 80,
                  protocol: 'http',
                  status: 'started',
                })
                found = true
              }
            }

            if (!found) {
              assert.fail("Couldn't find right logged item!")
            }
          } else {
            assert.fail('Somthing weird happened')
          }
        })

        test('HTTP Server is Created an stared with listening to correct port when port is not configured', () => {
          const config = immer(_.cloneDeep(configMocked.correct.everythingEnabled), config => {
            config.services.webserver.connection.http = {enabled: true}
          })
          const webserverHandler = new WebserverHandler(dependenciesMock, config)
          const webserver = webserverHandler.setup(internalSystem)
          assert.isTrue(ModulesMock.koa.stubs.callback.callCount === 0)

          const koaCallBackReturnValue = faker.random.alphaNumeric(24)
          ModulesMock.koa.stubs.callback.returns(koaCallBackReturnValue)
          webserver()

          assert.isTrue(ModulesMock.http.stubs.createServer.calledOnce)
          assert.isTrue(ModulesMock.http.stubs.createServer.args[0].length === 1)
          assert.isTrue(ModulesMock.http.stubs.createServer.args[0][0] === koaCallBackReturnValue)
          assert.isTrue(ModulesMock.koa.stubs.callback.calledOnce)
          assert.isTrue(ModulesMock.http.stubs.listen.calledOnce)
          assert.isTrue(ModulesMock.http.stubs.listen.args[0].length === 2)
          assert.isTrue(ModulesMock.http.stubs.listen.args[0][0] === 80)
        })

        test('Http Server Logs on info level that server is started and on which port when port is not configured', () => {
          const config = immer(_.cloneDeep(configMocked.correct.everythingEnabled), config => {
            config.services.webserver.connection.http = {enabled: true}
          })
          const webserverHandler = new WebserverHandler(dependenciesMock, config)
          const webserver = webserverHandler.setup(internalSystem)
          webserver()

          let found = false

          for (const infoLog of ModulesMock.logHandler.stubs.info.args) {
            if (infoLog.length === 2 && infoLog[0] === 'Webserver is started!') {
              assert.deepEqual(infoLog[1], {
                port: 80,
                protocol: 'http',
                status: 'started',
              })
              found = true
            }
          }

          if (!found) {
            assert.fail("Couldn't find right logged item!")
          }
        })

        test('Http server get succesfully closed after calling returned close command', () => {
          const server = webserver()

          assert.isFalse(ModulesMock.http.stubs.emit.calledOnce)
          assert.isFalse(ModulesMock.https.stubs.emit.calledOnce)
          server.close()
          assert.isTrue(ModulesMock.http.stubs.emit.calledOnce)
          assert.isFalse(ModulesMock.https.stubs.emit.calledOnce)
          assert.isTrue(ModulesMock.http.stubs.emit.args[0].length === 1)
          assert.isTrue(ModulesMock.http.stubs.emit.args[0][0] === 'close')
        })
      })

      suite('Test HTTPS Server connection is enabled', () => {
        let config = immer(_.cloneDeep(configMocked.correct.everythingEnabled), config => {
          config.services.webserver.connection.https = {
            enabled: true,
            port: faker.random.number(),
            cert: {cert: faker.random.alphaNumeric(), key: faker.random.alphaNumeric()},
          }
        })
        let webserverHandler = new WebserverHandler(dependenciesMock, config)
        let webserver = webserverHandler.setup(internalSystem)

        setup(() => {
          config = immer(_.cloneDeep(configMocked.correct.everythingEnabled), config => {
            config.services.webserver.connection.https = {
              cert: {cert: faker.random.alphaNumeric(), key: faker.random.alphaNumeric()},
              enabled: true,
              port: faker.random.number(),
            }
          })
          webserverHandler = new WebserverHandler(dependenciesMock, config)
          webserver = webserverHandler.setup(internalSystem)
        })

        test('Https Server is Created an stared with listening to correct port', () => {
          if (config.services.webserver.connection.https.enabled) {
            assert.isTrue(ModulesMock.koa.stubs.callback.callCount === 0)

            const koaCallBackReturnValue = faker.random.alphaNumeric(24)
            ModulesMock.koa.stubs.callback.returns(koaCallBackReturnValue)
            webserver()

            assert.isTrue(ModulesMock.https.stubs.createServer.calledOnce)
            assert.isTrue(ModulesMock.https.stubs.createServer.args[0].length === 1)
            assert.isTrue(ModulesMock.https.stubs.createServer.args[0][0] === koaCallBackReturnValue)
            assert.isTrue(ModulesMock.koa.stubs.callback.calledOnce)
            assert.isTrue(ModulesMock.https.stubs.listen.calledOnce)
            assert.isTrue(ModulesMock.https.stubs.listen.args[0].length === 2)
            assert.isTrue(ModulesMock.https.stubs.listen.args[0][0] === config.services.webserver.connection.https.port)
          } else {
            assert.fail('Somthing weird happened')
          }
        })

        test('Https Server calls given callback function when system started listening', () => {
          if (config.services.webserver.connection.https.enabled) {
            const callbackstub = sinon.stub()

            webserver(callbackstub)

            assert.isTrue(callbackstub.calledOnce)
            assert.isTrue(callbackstub.args[0].length === 1)
            assert.deepEqual(callbackstub.args[0][0], internalSystem)
          } else {
            assert.fail('Somthing weird happened')
          }
        })

        test('Https Server Logs on info level that server is started and on which port', () => {
          if (config.services.webserver.connection.https.enabled) {
            webserver()

            let found = false

            for (const infoLog of ModulesMock.logHandler.stubs.info.args) {
              if (infoLog.length === 2 && infoLog[0] === 'Webserver is started!') {
                assert.deepEqual(infoLog[1], {
                  port: config.services.webserver.connection.https.port,
                  protocol: 'https',
                  status: 'started',
                })
                found = true
              }
            }

            if (!found) {
              assert.fail("Couldn't find right logged item!")
            }
          } else {
            assert.fail('Somthing weird happened')
          }
        })

        test('Https Server is Created an stared with listening to correct port when port is not configured', () => {
          const config = immer(_.cloneDeep(configMocked.correct.everythingEnabled), config => {
            config.services.webserver.connection.https = {
              cert: {cert: faker.random.alphaNumeric(), key: faker.random.alphaNumeric()},
              enabled: true,
            }
          })
          const webserverHandler = new WebserverHandler(dependenciesMock, config)
          const webserver = webserverHandler.setup(internalSystem)
          assert.isTrue(ModulesMock.koa.stubs.callback.callCount === 0)

          const koaCallBackReturnValue = faker.random.alphaNumeric(24)
          ModulesMock.koa.stubs.callback.returns(koaCallBackReturnValue)
          webserver()

          assert.isTrue(ModulesMock.https.stubs.createServer.calledOnce)
          assert.isTrue(ModulesMock.https.stubs.createServer.args[0].length === 1)
          assert.isTrue(ModulesMock.https.stubs.createServer.args[0][0] === koaCallBackReturnValue)
          assert.isTrue(ModulesMock.koa.stubs.callback.calledOnce)
          assert.isTrue(ModulesMock.https.stubs.listen.calledOnce)
          assert.isTrue(ModulesMock.https.stubs.listen.args[0].length === 2)
          assert.isTrue(ModulesMock.https.stubs.listen.args[0][0] === 443)
        })

        test('Https Server Logs on info level that server is started and on which port when port is not configured', () => {
          const config = immer(_.cloneDeep(configMocked.correct.everythingEnabled), config => {
            config.services.webserver.connection.https = {
              cert: {cert: faker.random.alphaNumeric(), key: faker.random.alphaNumeric()},
              enabled: true,
            }
          })
          const webserverHandler = new WebserverHandler(dependenciesMock, config)
          const webserver = webserverHandler.setup(internalSystem)
          webserver()

          let found = false

          for (const infoLog of ModulesMock.logHandler.stubs.info.args) {
            if (infoLog.length === 2 && infoLog[0] === 'Webserver is started!') {
              assert.deepEqual(infoLog[1], {port: 443, protocol: 'https', status: 'started'})
              found = true
            }
          }

          if (!found) {
            assert.fail("Couldn't find right logged item!")
          }
        })

        test('Https server get successfully closed after calling returned close command', () => {
          const server = webserver()

          assert.isFalse(ModulesMock.https.stubs.emit.calledOnce)
          assert.isFalse(ModulesMock.http.stubs.emit.calledOnce)
          server.close()
          assert.isTrue(ModulesMock.https.stubs.emit.calledOnce)
          assert.isFalse(ModulesMock.http.stubs.emit.calledOnce)
          assert.isTrue(ModulesMock.https.stubs.emit.args[0].length === 1)
          assert.isTrue(ModulesMock.https.stubs.emit.args[0][0] === 'close')
        })
      })

      suite('Webserver (KOA) is correctly configured.', () => {
        let config = immer(_.cloneDeep(configMocked.correct.everythingEnabled), config => {
          config.services.webserver.connection.http = {enabled: true, port: faker.random.number()}
        })
        let webserverHandler = new WebserverHandler(dependenciesMock, config)
        let webserver = webserverHandler.setup(internalSystem)

        setup(() => {
          config = immer(_.cloneDeep(configMocked.correct.everythingEnabled), config => {
            config.services.webserver.connection.http = {enabled: true, port: faker.random.number()}
          })
          webserverHandler = new WebserverHandler(dependenciesMock, config)
          webserver = webserverHandler.setup(internalSystem)
        })

        afterEach(() => {
          ModulesMock.reset()
        })

        test('Koa Environment is correctly set', () => {
          webserverHandler.setup(internalSystem)()
          assert.exists(ModulesMock.koa.stubs._vars.env)
          assert.equal(config.app.env, ModulesMock.koa.stubs._vars.env)
        })

        test('Koa subdomainOffset is correctly set when it is given', () => {
          webserverHandler.setup(internalSystem)()
          assert.exists(ModulesMock.koa.stubs._vars.subdomainOffset)
          assert.equal(config.services.webserver.settings.subdomainOffset, ModulesMock.koa.stubs._vars.subdomainOffset)
        })

        test("Koa subDomainOffset is correctly set when it isn't given", () => {
          const config = immer(_.cloneDeep(configMocked.correct.everythingEnabled), config => {
            config.services.webserver.settings.subdomainOffset = undefined
          })

          const webserverHandler = new WebserverHandler(dependenciesMock, config)
          webserverHandler.setup(internalSystem)()

          assert.exists(ModulesMock.koa.stubs._vars.subdomainOffset)
          assert.equal(ModulesMock.koa.stubs._vars.subdomainOffset, 2)
        })

        test("Koa proxy is correctly set when it isn't given", () => {
          const webserverHandler = new WebserverHandler(dependenciesMock, config)
          webserverHandler.setup(internalSystem)()

          assert.exists(ModulesMock.koa.stubs._vars.proxy)
          assert.isFalse(ModulesMock.koa.stubs._vars.proxy)
        })

        test('Koa proxy is correctly set when it is given', () => {
          const config = immer(_.cloneDeep(configMocked.correct.everythingEnabled), config => {
            config.services.webserver.settings.proxy = true
          })

          const webserverHandler = new WebserverHandler(dependenciesMock, config)
          webserverHandler.setup(internalSystem)()

          assert.exists(ModulesMock.koa.stubs._vars.proxy)
          assert.isTrue(ModulesMock.koa.stubs._vars.proxy)
        })

        test('Koa silent is correctly set when it is given', () => {
          const config = immer(_.cloneDeep(configMocked.correct.everythingEnabled), config => {
            config.services.webserver.settings.silent = faker.random.boolean()
          })

          const webserverHandler = new WebserverHandler(dependenciesMock, config)
          webserverHandler.setup(internalSystem)()

          assert.exists(ModulesMock.koa.stubs._vars.silent)
          assert.equal(config.services.webserver.settings.silent, ModulesMock.koa.stubs._vars.silent)
        })

        test('Koa silent is correctly set when it is not given given, but env is production', () => {
          const config = immer(_.cloneDeep(configMocked.correct.everythingEnabled), config => {
            config.app.env = 'production'
            config.services.webserver.settings.silent = undefined
          })

          const webserverHandler = new WebserverHandler(dependenciesMock, config)
          webserverHandler.setup(internalSystem)()

          assert.exists(ModulesMock.koa.stubs._vars.silent)
          assert.isTrue(ModulesMock.koa.stubs._vars.silent)
        })

        test('Koa ErrorHandler is implemented and reports an Error to LogHandler', () => {
          assert.isTrue(ModulesMock.koa.stubs.on.called)

          const calls = ModulesMock.koa.stubs.on.args
          calls.forEach(call => {
            assert.equal(call.length, 2)
            if (call[0] === 'error') {
              assert.isFunction(call[1])

              const errorCount = ModulesMock.logHandler.stubs.err.callCount
              const testError = new Error(faker.random.words(5))
              const testObject = {test: faker.random.alphaNumeric()}

              call[1](testError, testObject)
              assert.equal(ModulesMock.logHandler.stubs.err.callCount, errorCount + 1)
              assert.deepEqual(testError, ModulesMock.logHandler.stubs.err.args[errorCount][0])
              assert.deepEqual({ctx: testObject}, ModulesMock.logHandler.stubs.err.args[errorCount][1])
            }
          })
        })

        test("Koa Cors isn't configured when it isn't setup", () => {
          assert.equal(ModulesMock.koaCors.stubs.fn.callCount, 0)
        })

        test('Koa Cors is configured when it is setup', () => {
          ModulesMock.reset()
          const corsSettings = {
            allowMethods: faker.random.alphaNumeric(12),
            enabled: true,
          }

          const config = immer(_.cloneDeep(configMocked.correct.everythingEnabled), config => {
            config.services.webserver.security = {
              cors: corsSettings,
            }
          })

          const returnedData = faker.random.alphaNumeric(8)
          ModulesMock.koaCors.stubs.fn.returns(returnedData)

          const webserverHandler = new WebserverHandler(dependenciesMock, config)
          webserverHandler.setup(internalSystem)()

          assert.equal(ModulesMock.koaCors.stubs.fn.callCount, 1)
          assert.equal(ModulesMock.koaCors.stubs.fn.args[0].length, 1)
          assert.deepEqual(ModulesMock.koaCors.stubs.fn.args[0][0], corsSettings)

          assert.equal(ModulesMock.koa.stubs.use.callCount, 1)
          assert.equal(ModulesMock.koa.stubs.use.args[0].length, 1)
          assert.equal(ModulesMock.koa.stubs.use.args[0][0], returnedData)
        })

        test("Koa BodyParser isn't configured when it isn't setup", () => {
          assert.equal(ModulesMock.koaBodyParser.stubs.fn.callCount, 0)
        })

        test('Koa BodyParser is configured when it is setup', () => {
          ModulesMock.reset()
          const bodyParserSettings: bodyParser.Options & EnabledService = {
            enabled: true,
            encode: faker.random.alphaNumeric(12),
          }

          const config = immer(_.cloneDeep(configMocked.correct.everythingEnabled), config => {
            config.services.webserver.settings.bodyParser = bodyParserSettings
          })

          const returnedData = faker.random.alphaNumeric(8)
          ModulesMock.koaBodyParser.stubs.fn.returns(returnedData)

          const webserverHandler = new WebserverHandler(dependenciesMock, config)
          webserverHandler.setup(internalSystem)()

          assert.equal(ModulesMock.koaBodyParser.stubs.fn.callCount, 1)
          assert.equal(ModulesMock.koaBodyParser.stubs.fn.args[0].length, 1)
          assert.deepEqual(ModulesMock.koaBodyParser.stubs.fn.args[0][0], bodyParserSettings)

          assert.equal(ModulesMock.koa.stubs.use.callCount, 1)
          assert.equal(ModulesMock.koa.stubs.use.args[0].length, 1)
          assert.equal(ModulesMock.koa.stubs.use.args[0][0], returnedData)
        })
      })
    })
  })
})
