/* eslint-disable @typescript-eslint/no-explicit-any */
import {assert} from 'chai'
import * as faker from 'faker'
import immer from 'immer'
import DefaultExport, {WebserverHandler} from '../../../services/webserver/webserverHandler'
import configMocked from '../../mocks/config.mock'
import * as CacheHandlerMock from '../../mocks/cacheHandler.mock'
import * as DatabaseHandlerMock from '../../mocks/databaseHandler.mock'
import * as sinon from 'sinon'
import * as ModulesMock from '../../mocks/nodeModules'
import * as QueueHandlerMock from '../../mocks/queueHandler.mock'
import * as MiddlewareMock from '../../mocks/webserver/middleware.mock'
import {InternalSystem} from '../../../systemInterfaces/internalSystem'
import {Config} from '../../../systemInterfaces/config'
import {EnabledService} from '../../../systemInterfaces/services'
import {WebserverHandlerDeps, WebserverEnabledServiceConfigurator} from '../../../services/webserver/interfaces'
import {
  WebserverServiceHttpEnabled,
  WebserverServiceHttpsEnabled,
} from '../../../services/webserver/interfaces/webserverServiceEnabled'
import {ServiceConfigurator} from '../../../systemInterfaces/serviceConfigurator'
import {Models} from '../../../services/database/interfaces/model'
import {MiddlewareObject} from '../../../services/webserver/interfaces/middleware'
import bodyParser = require('koa-bodyparser')

let dependenciesMock: WebserverHandlerDeps
let config: Config<WebserverEnabledServiceConfigurator>
let webserverHandler: DefaultExport<WebserverEnabledServiceConfigurator>
let internalSystem: InternalSystem<WebserverEnabledServiceConfigurator, Config, Models>
let webserver: (callback?: () => void) => {close: (callback?: () => void) => void}

suite('Test Webserver Handler (./services/webserver/webserverHandler.ts)', () => {
  test('Returns as default a instanceOf the queueHandler Class', () => {
    assert.instanceOf(
      new DefaultExport(
        {} as WebserverHandlerDeps,
        JSON.parse(JSON.stringify(configMocked.correct.everythingDisabled)),
      ),
      WebserverHandler,
    )
  })

  test('Object has an static Factory function', () => {
    assert.isFunction(WebserverHandler.factory)
  })

  test('factory gets 1 parameter', () => {
    assert.equal(WebserverHandler.factory.length, 1)
  })

  test('factory() returns instance of WebserverHandler', () => {
    assert.instanceOf(
      WebserverHandler.factory(JSON.parse(JSON.stringify(configMocked.correct.everythingDisabled))),
      WebserverHandler,
    )
  })

  suite('setup() works as expected!', () => {
    setup(() => {
      config = JSON.parse(JSON.stringify(configMocked.correct.everythingDisabled))
      internalSystem = ({
        Cache: CacheHandlerMock.Instance,
        Config: configMocked.correct.everythingDisabled,
        DB: DatabaseHandlerMock.Instance,
        Log: new ModulesMock.logHandler.Instance(),
        Models: {},
        Queue: QueueHandlerMock.Instance,
      } as unknown) as InternalSystem<any, Config, {}>

      webserverHandler = new WebserverHandler(dependenciesMock, config)
    })

    teardown(() => {
      CacheHandlerMock.reset()
      DatabaseHandlerMock.reset()
      QueueHandlerMock.reset()
      ModulesMock.reset()
      MiddlewareMock.reset()
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
      setup(() => {
        config = JSON.parse(JSON.stringify(configMocked.correct.everythingEnabled))
        dependenciesMock = ({
          Http: new ModulesMock.http.Instance(),
          Https: new ModulesMock.https.Instance(),
          Immer: immer,
          Koa: ModulesMock.koa.Instance,
          KoaBodyParser: new ModulesMock.koaBodyParser.Instance().fn,
          KoaCors: new ModulesMock.koaCors.Instance().fn,
          KoaRouter: ModulesMock.koaRouter.Instance,
        } as unknown) as WebserverHandlerDeps

        internalSystem = ({
          Cache: CacheHandlerMock.Instance,
          Config: configMocked.correct.everythingEnabled,
          DB: DatabaseHandlerMock.Instance,
          Log: new ModulesMock.logHandler.Instance(),
          Models: {},
          Queue: QueueHandlerMock.Instance,
        } as unknown) as InternalSystem<any, Config, {}>

        webserverHandler = new WebserverHandler(
          dependenciesMock,
          JSON.parse(JSON.stringify(configMocked.correct.everythingEnabled)),
        )
      })

      teardown(() => {
        CacheHandlerMock.reset()
        DatabaseHandlerMock.reset()
        QueueHandlerMock.reset()
        ModulesMock.reset()
      })

      test('returns function after called', () => {
        const webserver = webserverHandler.setup(internalSystem)
        assert.typeOf(webserver, 'function')
      })

      test('Instance of Koa is called once.', () => {
        webserverHandler.setup(internalSystem)
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

      suite('Test Http Server connection is enabled', () => {
        setup(() => {
          config = immer(
            internalSystem.Config as Config<WebserverEnabledServiceConfigurator<WebserverServiceHttpEnabled>>,
            Config => {
              Config.services.webserver.connection.https = {enabled: false}
            },
          )
          internalSystem = {
            ...internalSystem,
            Config: config,
          }
          webserver = webserverHandler.setup(internalSystem)
        })

        teardown(() => {
          CacheHandlerMock.reset()
          DatabaseHandlerMock.reset()
          QueueHandlerMock.reset()
          ModulesMock.reset()
        })

        test('Http Server is Created an stared with listening to correct port', () => {
          const settings = (config as unknown) as Config<
            WebserverEnabledServiceConfigurator<WebserverServiceHttpEnabled>
          >
          if (settings.services.webserver.connection.http.enabled) {
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
            assert.isTrue(ModulesMock.http.stubs.listen.args[0][0] === settings.services.webserver.connection.http.port)
          } else {
            assert.fail('Something weird happened')
          }
        })

        test('Http Server calls given callback function when system started listening', () => {
          const settings = (config as unknown) as Config<
            WebserverEnabledServiceConfigurator<WebserverServiceHttpEnabled>
          >
          if (settings.services.webserver.connection.http.enabled) {
            const callbackstub = sinon.stub()

            webserver(callbackstub)

            assert.isTrue(callbackstub.calledOnce)

            assert.isTrue(callbackstub.args[0].length === 1)
            assert.deepEqual(callbackstub.args[0][0], internalSystem)
          } else {
            assert.fail('Something weird happened')
          }
        })

        test('Http Server Logs on info level that server is started and on which port', () => {
          if (config.services.webserver.connection.http.enabled) {
            const settings = (config as unknown) as Config<
              WebserverEnabledServiceConfigurator<WebserverServiceHttpEnabled>
            >
            webserver()

            let found = false

            for (const infoLog of ModulesMock.logHandler.stubs.info.args) {
              if (infoLog.length === 2 && infoLog[0] === 'Webserver is started!') {
                assert.deepEqual(infoLog[1], {
                  port: settings.services.webserver.connection.http.port
                    ? settings.services.webserver.connection.http.port
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
            assert.fail('Something weird happened')
          }
        })

        test('Http Server is Created an stared with listening to correct port when port is not configured', () => {
          config = immer(
            internalSystem.Config as Config<WebserverEnabledServiceConfigurator<WebserverServiceHttpEnabled>>,
            Config => {
              Config.services.webserver.connection.https = {enabled: false}
              Config.services.webserver.connection.http = {enabled: true}
            },
          )
          internalSystem = {
            ...internalSystem,
            Config: config,
          }
          webserver = webserverHandler.setup(internalSystem as any)

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
          config = immer(
            internalSystem.Config as Config<WebserverEnabledServiceConfigurator<WebserverServiceHttpEnabled>>,
            Config => {
              Config.services.webserver.connection.https = {enabled: false}
              Config.services.webserver.connection.http = {enabled: true}
            },
          )
          internalSystem = {
            ...internalSystem,
            Config: config,
          }
          webserver = webserverHandler.setup(internalSystem as any)
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

      suite('Test Https Server connection is enabled', () => {
        setup(() => {
          config = immer(
            internalSystem.Config as Config<WebserverEnabledServiceConfigurator<WebserverServiceHttpsEnabled>>,
            Config => {
              Config.services.webserver.connection.http = {enabled: false}
            },
          )
          internalSystem = {
            ...internalSystem,
            Config: config,
          }
          webserver = webserverHandler.setup(internalSystem as any)
        })

        teardown(() => {
          CacheHandlerMock.reset()
          DatabaseHandlerMock.reset()
          QueueHandlerMock.reset()
          ModulesMock.reset()
        })

        test.only('Https Server is Created an stared with listening to correct port', () => {
          const settings = (config as unknown) as Config<
            WebserverEnabledServiceConfigurator<WebserverServiceHttpsEnabled>
          >
          if (settings.services.webserver.connection.https.enabled) {
            assert.isTrue(ModulesMock.koa.stubs.callback.callCount === 0)

            const koaCallBackReturnValue = faker.random.alphaNumeric(24)
            ModulesMock.koa.stubs.callback.returns(koaCallBackReturnValue)
            webserver()

            assert.isTrue(ModulesMock.https.stubs.createServer.calledOnce)
            assert.isTrue(ModulesMock.https.stubs.createServer.args[0].length === 2)
            assert.deepEqual(
              ModulesMock.https.stubs.createServer.args[0][0],
              settings.services.webserver.connection.https.cert,
            )
            assert.isTrue(ModulesMock.https.stubs.createServer.args[0][1] === koaCallBackReturnValue)
            assert.isTrue(ModulesMock.koa.stubs.callback.calledOnce)
            assert.isTrue(ModulesMock.https.stubs.listen.calledOnce)
            assert.isTrue(ModulesMock.https.stubs.listen.args[0].length === 2)
            assert.isTrue(
              ModulesMock.https.stubs.listen.args[0][0] === settings.services.webserver.connection.https.port,
            )
          } else {
            assert.fail('Something weird happened')
          }
        })

        test('Https Server calls given callback function when system started listening', () => {
          const settings = (config as unknown) as Config<
            WebserverEnabledServiceConfigurator<WebserverServiceHttpEnabled>
          >
          if (settings.services.webserver.connection.https.enabled) {
            const callbackstub = sinon.stub()

            webserver(callbackstub)

            assert.isTrue(callbackstub.calledOnce)

            assert.isTrue(callbackstub.args[0].length === 1)
            assert.deepEqual(callbackstub.args[0][0], internalSystem)
          } else {
            assert.fail('Something weird happened')
          }
        })

        test('Https Server Logs on info level that server is started and on which port', () => {
          const settings = (config as unknown) as Config<
            WebserverEnabledServiceConfigurator<WebserverServiceHttpsEnabled>
          >
          if (settings.services.webserver.connection.https.enabled) {
            webserver()

            let found = false

            for (const infoLog of ModulesMock.logHandler.stubs.info.args) {
              if (infoLog.length === 2 && infoLog[0] === 'Webserver is started!') {
                assert.deepEqual(infoLog[1], {
                  port: settings.services.webserver.connection.https.port
                    ? settings.services.webserver.connection.https.port
                    : 80,
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
            assert.fail('Something weird happened')
          }
        })

        test('Https Server is Created an stared with listening to correct port when port is not configured', () => {
          config = immer(
            internalSystem.Config as Config<WebserverEnabledServiceConfigurator<WebserverServiceHttpsEnabled>>,
            Config => {
              Config.services.webserver.connection.http = {enabled: false}
              Config.services.webserver.connection.https = {
                cert: {
                  cert: faker.random.alphaNumeric(48),
                  key: faker.random.alphaNumeric(48),
                },
                enabled: true,
              }
            },
          )
          internalSystem = {
            ...internalSystem,
            Config: config,
          }
          webserver = webserverHandler.setup(internalSystem as any)

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

        test('Http Server Logs on info level that server is started and on which port when port is not configured', () => {
          config = immer(
            internalSystem.Config as Config<WebserverEnabledServiceConfigurator<WebserverServiceHttpsEnabled>>,
            Config => {
              Config.services.webserver.connection.http = {enabled: false}
              Config.services.webserver.connection.https = {
                cert: {
                  cert: faker.random.alphaNumeric(48),
                  key: faker.random.alphaNumeric(48),
                },
                enabled: true,
              }
            },
          )
          internalSystem = {
            ...internalSystem,
            Config: config,
          }
          webserver = webserverHandler.setup(internalSystem as any)
          webserver()

          let found = false

          for (const infoLog of ModulesMock.logHandler.stubs.info.args) {
            if (infoLog.length === 2 && infoLog[0] === 'Webserver is started!') {
              assert.deepEqual(infoLog[1], {
                port: 443,
                protocol: 'https',
                status: 'started',
              })
              found = true
            }
          }

          if (!found) {
            assert.fail("Couldn't find right logged item!")
          }
        })

        test('Https server get succesfully closed after calling returned close command', () => {
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
        setup(() => {
          config = immer(
            JSON.parse(
              JSON.stringify(configMocked.correct.everythingEnabled),
            ) as typeof configMocked['correct']['everythingEnabled'],
            config => {
              config.services.webserver.connection.http = {enabled: true, port: faker.random.number()}
            },
          )
          webserverHandler = new WebserverHandler(dependenciesMock, config)
          webserverHandler.setup(internalSystem)
        })

        teardown(() => {
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
          const config = immer(
            JSON.parse(
              JSON.stringify(configMocked.correct.everythingEnabled),
            ) as typeof configMocked['correct']['everythingEnabled'],
            config => {
              config.services.webserver.settings.subdomainOffset = undefined
            },
          )

          const webserverHandler = new WebserverHandler(dependenciesMock, config)
          webserverHandler.setup({
            ...internalSystem,
            Config: config,
          } as any)()

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
          const config = immer(
            JSON.parse(
              JSON.stringify(configMocked.correct.everythingEnabled),
            ) as typeof configMocked['correct']['everythingEnabled'],
            config => {
              config.services.webserver.settings.proxy = true
            },
          )

          const webserverHandler = new WebserverHandler(dependenciesMock, config)
          webserverHandler.setup({
            ...internalSystem,
            Config: config,
          } as any)()

          assert.exists(ModulesMock.koa.stubs._vars.proxy)
          assert.isTrue(ModulesMock.koa.stubs._vars.proxy)
        })

        test('Koa silent is correctly set when it is given', () => {
          const config = immer(
            JSON.parse(
              JSON.stringify(configMocked.correct.everythingEnabled),
            ) as typeof configMocked['correct']['everythingEnabled'],
            config => {
              config.services.webserver.settings.silent = faker.random.boolean()
            },
          )

          const webserverHandler = new WebserverHandler(dependenciesMock, config)
          webserverHandler.setup({
            ...internalSystem,
            Config: config,
          } as any)()

          assert.exists(ModulesMock.koa.stubs._vars.silent)
          assert.equal(config.services.webserver.settings.silent, ModulesMock.koa.stubs._vars.silent)
        })

        test('Koa silent is correctly set when it is not given given, but env is production', () => {
          const config = immer(
            JSON.parse(
              JSON.stringify(configMocked.correct.everythingEnabled),
            ) as typeof configMocked['correct']['everythingEnabled'],
            config => {
              config.app.env = 'production'
              config.services.webserver.settings.silent = undefined
            },
          )

          const webserverHandler = new WebserverHandler(dependenciesMock, config)
          webserverHandler.setup({
            ...internalSystem,
            Config: config,
          } as any)()

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
              assert.deepEqual(testObject, ModulesMock.logHandler.stubs.err.args[errorCount][1])
            }
          })
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

          const config = immer(
            JSON.parse(
              JSON.stringify(configMocked.correct.everythingEnabled),
            ) as typeof configMocked['correct']['everythingEnabled'],
            config => {
              config.services.webserver.settings.bodyParser = bodyParserSettings
            },
          )

          const returnedData = faker.random.alphaNumeric(8)
          ModulesMock.koaBodyParser.stubs.fn.returns(returnedData)

          const webserverHandler = new WebserverHandler(dependenciesMock, config)
          webserverHandler.setup({
            ...internalSystem,
            Config: config,
          } as any)()

          assert.equal(ModulesMock.koaBodyParser.stubs.fn.callCount, 1)
          assert.equal(ModulesMock.koaBodyParser.stubs.fn.args[0].length, 1)
          assert.deepEqual(ModulesMock.koaBodyParser.stubs.fn.args[0][0], bodyParserSettings)

          assert.equal(ModulesMock.koa.stubs.use.callCount, 2)
          assert.equal(ModulesMock.koa.stubs.use.args[0].length, 1)
          assert.equal(ModulesMock.koa.stubs.use.args[0][0], returnedData)
        })

        // eslint-disable-next-line @typescript-eslint/no-empty-function
        suite('System Middleware is loaded correctly', () => {
          const numberOfMiddleware = faker.random.number(8) + 2
          const returnValues = faker.random.alphaNumeric(24)

          teardown(() => {
            ModulesMock.reset()
            MiddlewareMock.reset()
          })

          suite('when middleware is added as a function', () => {
            setup(() => {
              config = immer(
                JSON.parse(
                  JSON.stringify(configMocked.correct.everythingEnabled),
                ) as typeof configMocked['correct']['everythingEnabled'],
                config => {
                  const middlewareList = []
                  for (let i = 0; i < numberOfMiddleware; i++) {
                    middlewareList.push(MiddlewareMock.Instance)
                  }

                  config.services.webserver.middleware = middlewareList
                },
              )

              MiddlewareMock.stubs.middleware.returns(returnValues)
              webserverHandler = new WebserverHandler(dependenciesMock, config)
              webserverHandler.setup({
                ...internalSystem,
                Config: config,
              } as InternalSystem<ServiceConfigurator, Config, Models>)
            })

            teardown(() => {
              ModulesMock.reset()
              MiddlewareMock.reset()
            })

            test('Middleware is correctly loaded when it is added as a function', () => {
              assert.equal(MiddlewareMock.stubs.setup.callCount, numberOfMiddleware)
              assert.equal(MiddlewareMock.stubs.setup.args[0].length, 1)
              assert.deepEqual(MiddlewareMock.stubs.setup.args[0][0], {
                ...internalSystem,
                Config: config,
                Dependencies: {},
              })
              assert.equal(MiddlewareMock.stubs.middleware.callCount, 0)

              let match = 0
              for (const args of ModulesMock.koa.stubs.use.args) {
                if (args.length === 1 && typeof args[0] === 'function') {
                  const result = args[0]()
                  match += result === returnValues ? 1 : 0
                }
              }

              assert.equal(numberOfMiddleware, match)
            })
          })

          suite('when middleware is added as a object', () => {
            let dependencyObj: {}
            const dependencyfnc = () => ({
              uuid1: 'f1fe7480-6776-437d-b844-c387f449a9b7',
              uuid2: 'fe191870-6432-11ea-bc55-0242ac130003',
              uuid3: 'fe191a82-6432-11ea-bc55-0242ac130003',
              uuid4: 'fe191b7c-6432-11ea-bc55-0242ac130003',
            })

            setup(() => {
              dependencyObj = {
                id: faker.random.uuid,
                test: faker.random.alphaNumeric(24),
                test2: faker.random.words(5),
              }

              config = immer(
                JSON.parse(
                  JSON.stringify(configMocked.correct.everythingEnabled),
                ) as typeof configMocked['correct']['everythingEnabled'],
                config => {
                  const middlewareList = []
                  for (let i = 0; i < numberOfMiddleware; i++) {
                    const middleware: MiddlewareObject<typeof dependencyObj> = {
                      dependencies: dependencyObj,
                      fnc: MiddlewareMock.Instance,
                    }

                    middlewareList.push(middleware)
                  }

                  config.services.webserver.middleware = middlewareList
                },
              )

              MiddlewareMock.stubs.middleware.returns(returnValues)
              webserverHandler = new WebserverHandler(dependenciesMock, config)
              webserverHandler.setup({
                ...internalSystem,
                Config: config,
              } as InternalSystem<ServiceConfigurator, Config, Models>)
            })

            teardown(() => {
              ModulesMock.reset()
              MiddlewareMock.reset()
            })

            test('Middleware is correctly loaded when it is added as a object with dependencies as an object', () => {
              assert.equal(MiddlewareMock.stubs.setup.callCount, numberOfMiddleware)
              assert.equal(MiddlewareMock.stubs.setup.args[0].length, 1)
              assert.deepEqual(MiddlewareMock.stubs.setup.args[0][0], {
                ...internalSystem,
                Config: config,
                Dependencies: dependencyObj,
              })
              assert.equal(MiddlewareMock.stubs.middleware.callCount, 0)

              let match = 0
              for (const args of ModulesMock.koa.stubs.use.args) {
                if (args.length === 1 && typeof args[0] === 'function') {
                  const result = args[0]()
                  match += result === returnValues ? 1 : 0
                }
              }

              assert.equal(numberOfMiddleware, match)
            })

            test('Middleware is correctly loaded when it is added as a object with dependencies as an function', () => {
              ModulesMock.reset()
              MiddlewareMock.reset()

              config = immer(
                JSON.parse(
                  JSON.stringify(configMocked.correct.everythingEnabled),
                ) as typeof configMocked['correct']['everythingEnabled'],
                config => {
                  const middlewareList = []
                  for (let i = 0; i < numberOfMiddleware; i++) {
                    const middleware: MiddlewareObject<typeof dependencyObj> = {
                      dependencies: dependencyfnc,
                      fnc: MiddlewareMock.Instance,
                    }

                    middlewareList.push(middleware)
                  }

                  config.services.webserver.middleware = middlewareList
                },
              )

              MiddlewareMock.stubs.middleware.returns(returnValues)
              webserverHandler = new WebserverHandler(dependenciesMock, config)
              webserverHandler.setup({
                ...internalSystem,
                Config: config,
              } as InternalSystem<ServiceConfigurator, Config, Models>)

              assert.equal(MiddlewareMock.stubs.setup.callCount, numberOfMiddleware)
              assert.equal(MiddlewareMock.stubs.setup.args[0].length, 1)
              assert.deepEqual(MiddlewareMock.stubs.setup.args[0][0], {
                ...internalSystem,
                Config: config,
                Dependencies: dependencyfnc(),
              })
              assert.equal(MiddlewareMock.stubs.middleware.callCount, 0)

              let match = 0
              for (const args of ModulesMock.koa.stubs.use.args) {
                if (args.length === 1 && typeof args[0] === 'function') {
                  const result = args[0]()
                  match += result === returnValues ? 1 : 0
                }
              }

              assert.equal(numberOfMiddleware, match)
            })

            test('Middleware Dependency function gets InternalSystem as argument', () => {
              ModulesMock.reset()
              MiddlewareMock.reset()

              const middlewareDepedencyStub = sinon.stub().returns(dependencyObj)

              config = immer(
                JSON.parse(
                  JSON.stringify(configMocked.correct.everythingEnabled),
                ) as typeof configMocked['correct']['everythingEnabled'],
                config => {
                  config.services.webserver.middleware = [
                    {
                      dependencies: middlewareDepedencyStub,
                      fnc: MiddlewareMock.Instance,
                    },
                  ]
                },
              )

              MiddlewareMock.stubs.middleware.returns(returnValues)
              webserverHandler = new WebserverHandler(dependenciesMock, config)
              webserverHandler.setup({
                ...internalSystem,
                Config: config,
              } as InternalSystem<ServiceConfigurator, Config, Models>)

              assert.equal(middlewareDepedencyStub.callCount, 1)
              assert.equal(middlewareDepedencyStub.args[0].length, 1)
              assert.deepEqual(middlewareDepedencyStub.args[0][0], {
                ...internalSystem,
                Config: config,
                Dependencies: {},
              })
            })
          })
        })
      })
    })
  })
})
