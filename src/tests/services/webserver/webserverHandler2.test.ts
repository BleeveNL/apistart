/* eslint-disable @typescript-eslint/no-explicit-any */
import {Config} from '../../../systemInterfaces/config'
import {WebserverServiceHVersionHandlingEnabled} from '../../../services/webserver/interfaces/webserverServiceEnabled'
import {WebserverEnabledServiceConfigurator, WebserverHandlerDeps} from '../../../services/webserver/interfaces'
import immer from 'immer'
import configMocked from '../../mocks/config.mock'
import * as MiddlewareMock from '../../mocks/webserver/middleware.mock'
import * as ParamMock from '../../mocks/webserver/param.mock'
import * as ControllerMock from '../../mocks/webserver/controller.mock'
import * as CacheHandlerMock from '../../mocks/cacheHandler.mock'
import * as DatabaseHandlerMock from '../../mocks/databaseHandler.mock'
import * as QueueHandlerMock from '../../mocks/queueHandler.mock'
import * as _ from 'lodash'
import * as faker from 'faker'
import * as ModulesMock from '../../mocks/nodeModules'
import {Methods} from 'koa-advanced-router/lib/layer/layer.interfaces'
import {assert} from 'chai'
import {InternalSystem} from '../../../systemInterfaces/internalSystem'
import WebserverHandler from '../../../services/webserver/webserverHandler'
import {Models} from '../../../services/database/interfaces/model'
import {Version} from '../../../services/webserver/interfaces/version'

let config: Config<WebserverEnabledServiceConfigurator<WebserverServiceHVersionHandlingEnabled>> = _.cloneDeep(
  configMocked.correct.everythingEnabled,
)
let dependenciesMock: WebserverHandlerDeps
let webserverHandler: WebserverHandler<WebserverEnabledServiceConfigurator>
let internalSystem: InternalSystem<WebserverEnabledServiceConfigurator, Config, Models>
let webserver: (callback?: () => void) => {close: (callback?: () => void) => void}

suite('Test Webserver Handler (./services/webserver/webserverHandler.ts)', () => {
  suite('Versioning is handled correctly', () => {
    setup(() => {
      config = immer(config, draftConfig => {
        draftConfig.services.webserver.versions = [
          {
            enabled: true,
            identifier: faker.random.alphaNumeric(6),
            middleware: [MiddlewareMock.Instance],
            router: [
              {
                controller: ControllerMock.Instance,
                dependencies: {},
                method: Methods.get,
                params: {},
                path: `/${faker.random.alphaNumeric(8)}/`,
              },
            ],
          },
          {
            enabled: false,
            identifier: faker.random.alphaNumeric(6),
            middleware: [MiddlewareMock.Instance],
            router: [
              {
                controller: ControllerMock.Instance,
                dependencies: {},
                method: Methods.get,
                params: {},
                path: `/${faker.random.alphaNumeric(8)}/`,
              },
            ],
          },
        ]
      })

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
        Config: config,
        DB: DatabaseHandlerMock.Instance,
        Log: new ModulesMock.logHandler.Instance(),
        Models: {},
        Queue: QueueHandlerMock.Instance,
      } as unknown) as InternalSystem<any, Config, {}>

      webserverHandler = new WebserverHandler(dependenciesMock, _.cloneDeep(configMocked.correct.everythingEnabled))

      webserver = webserverHandler.setup(internalSystem)
    })

    teardown(() => {
      ModulesMock.reset()
      MiddlewareMock.reset()
      ControllerMock.reset()
    })

    test('Make sure versions do not get handled when version is disabled', () => {
      assert.equal(ModulesMock.koaRouter.stubs.constructor.callCount, 2)
      assert.equal(ModulesMock.koaRouter.stubs.route.callCount, 1)
      assert.equal(ControllerMock.stubs.setup.callCount, 1)
      assert.equal(MiddlewareMock.stubs.setup.callCount, 1)
      assert.equal(ModulesMock.koaRouter.stubs.use.callCount, 2)
    })

    test('Make sure versions get correct handled when version is enabled', () => {
      ModulesMock.reset()
      MiddlewareMock.reset()
      ControllerMock.reset()

      config = immer(config, draftConfig => {
        draftConfig.services.webserver.versions[1] = {
          ...config.services.webserver.versions[1],
          enabled: true,
        }
      })

      webserver = webserverHandler.setup({
        ...internalSystem,
        Config: config,
      })

      assert.equal(ModulesMock.koaRouter.stubs.constructor.callCount, 3)
      assert.equal(ModulesMock.koaRouter.stubs.route.callCount, 2)
      assert.equal(ControllerMock.stubs.setup.callCount, 2)
      assert.equal(MiddlewareMock.stubs.setup.callCount, 2)
      assert.equal(ModulesMock.koaRouter.stubs.use.callCount, 4)
    })

    test('Make sure versions middleware is handled corrected', () => {
      ModulesMock.reset()
      MiddlewareMock.reset()
      ControllerMock.reset()

      config = immer(config, draftConfig => {
        draftConfig.services.webserver.versions[1] = {
          ...config.services.webserver.versions[1],
          enabled: true,
          middleware: [],
        }
      })

      webserver = webserverHandler.setup({
        ...internalSystem,
        Config: config,
      })

      assert.equal(ModulesMock.koaRouter.stubs.constructor.callCount, 3)
      assert.equal(ModulesMock.koaRouter.stubs.route.callCount, 2)
      assert.equal(ControllerMock.stubs.setup.callCount, 2)
      assert.equal(MiddlewareMock.stubs.setup.callCount, 1)
      assert.equal(ModulesMock.koaRouter.stubs.use.callCount, 3)
    })

    test('Version Router is correctly Configured', () => {
      assert.equal(ModulesMock.koaRouter.stubs.constructor.callCount, 2)

      assert.deepEqual(ModulesMock.koaRouter.stubs.constructor.args[1][0], {
        allowedMethods: config.services.webserver.settings.allowedMethods,
        cors: config.services.webserver.settings.cors,
        expose: config.services.webserver.settings.expose,
        ignoreCaptures: config.services.webserver.settings.ignoreCaptures,
        sensitive: config.services.webserver.settings.sensitive,
        strict: config.services.webserver.settings.strict,
        version: {
          identifier: config.services.webserver.versions[0].identifier,
          type: config.services.webserver.settings.versionHandler,
        },
      })
    })

    test('Main Router is correctly Configured', () => {
      assert.equal(ModulesMock.koaRouter.stubs.constructor.callCount, 2)
      assert.deepEqual(ModulesMock.koaRouter.stubs.constructor.args[0][0], {
        expose: config.services.webserver.settings.expose,
      })
    })

    suite('Route is correctly Configured', () => {
      test('in default test case', () => {
        const path = config.services.webserver.versions[0].router[0].path as string

        assert.equal(ModulesMock.koaRouter.stubs.route.callCount, 1)
        assert.deepEqual(ModulesMock.koaRouter.stubs.route.args[0][0].methods, [
          config.services.webserver.versions[0].router[0].method,
        ])
        assert.equal(ModulesMock.koaRouter.stubs.route.args[0][0].middleware.length, 1)
        assert.deepEqual(ModulesMock.koaRouter.stubs.route.args[0][0].params, {})
        assert.deepEqual(ModulesMock.koaRouter.stubs.route.args[0][0].path, path.replace(/^\/|\/$/g, ''))

        assert.equal(ControllerMock.stubs.controller.callCount, 0)
        ModulesMock.koaRouter.stubs.route.args[0][0].middleware[0]()
        assert.equal(ControllerMock.stubs.controller.callCount, 1)
        assert.deepEqual(ControllerMock.stubs.setup.args[0][0], {...internalSystem, Dependencies: {}})
      })

      test('Controller gets access to InternalSystem with dependency object', () => {
        ModulesMock.reset()
        MiddlewareMock.reset()
        ControllerMock.reset()
        ParamMock.reset()

        const dependencies = {
          id: faker.random.alphaNumeric(12),
        }

        config = immer(config, draftConfig => {
          const versions: Version[] = []
          for (const version of draftConfig.services.webserver.versions) {
            versions.push({
              ...version,
              router: [
                {
                  ...version.router[0],
                  dependencies: dependencies,
                },
              ],
            })
          }

          draftConfig.services.webserver.versions = versions
        })

        webserverHandler = new WebserverHandler(dependenciesMock, config)
        internalSystem = {
          ...internalSystem,
          Config: config,
        }
        webserver = webserverHandler.setup(internalSystem)

        assert.equal(ControllerMock.stubs.controller.callCount, 0)
        ModulesMock.koaRouter.stubs.route.args[0][0].middleware[0]()
        assert.equal(ControllerMock.stubs.controller.callCount, 1)

        assert.equal(ControllerMock.stubs.setup.callCount, 1)
        assert.deepEqual(ControllerMock.stubs.setup.args[0][0], {...internalSystem, Dependencies: dependencies})
      })

      test('when route Path is an regExp', () => {
        const path = /^jhdgcdhgd$/
        config = immer(config, draftConfig => {
          const versions: Version[] = []
          for (const version of draftConfig.services.webserver.versions) {
            versions.push({
              ...version,
              router: [
                {
                  ...version.router[0],
                  path,
                },
              ],
            })
          }

          draftConfig.services.webserver.versions = versions
        })

        ModulesMock.reset()
        MiddlewareMock.reset()
        ControllerMock.reset()
        webserverHandler = new WebserverHandler(dependenciesMock, config)
        webserver = webserverHandler.setup({
          ...internalSystem,
          Config: config,
        })
        webserver()

        assert.equal(ModulesMock.koaRouter.stubs.route.callCount, 1)
        assert.deepEqual(ModulesMock.koaRouter.stubs.route.args[0][0].methods, [
          config.services.webserver.versions[0].router[0].method,
        ])
        assert.equal(ModulesMock.koaRouter.stubs.route.args[0][0].middleware.length, 1)
        assert.deepEqual(ModulesMock.koaRouter.stubs.route.args[0][0].params, {})
        assert.deepEqual(ModulesMock.koaRouter.stubs.route.args[0][0].path, path)

        assert.equal(ControllerMock.stubs.controller.callCount, 0)
        ModulesMock.koaRouter.stubs.route.args[0][0].middleware[0]()
        assert.equal(ControllerMock.stubs.controller.callCount, 1)
      })

      test('when route allows multiple methods', () => {
        const methods = [Methods.get, Methods.post]
        const path = config.services.webserver.versions[0].router[0].path as string

        config = immer(config, draftConfig => {
          const versions: Version[] = []
          for (const version of draftConfig.services.webserver.versions) {
            versions.push({
              ...version,
              router: [
                {
                  ...version.router[0],
                  method: methods,
                },
              ],
            })
          }

          draftConfig.services.webserver.versions = versions
        })

        ModulesMock.reset()
        MiddlewareMock.reset()
        ControllerMock.reset()
        webserverHandler = new WebserverHandler(dependenciesMock, config)
        webserver = webserverHandler.setup({
          ...internalSystem,
          Config: config,
        })
        webserver()

        assert.equal(ModulesMock.koaRouter.stubs.route.callCount, 1)
        assert.deepEqual(ModulesMock.koaRouter.stubs.route.args[0][0].methods, methods)
        assert.equal(ModulesMock.koaRouter.stubs.route.args[0][0].middleware.length, 1)
        assert.deepEqual(ModulesMock.koaRouter.stubs.route.args[0][0].params, {})
        assert.deepEqual(ModulesMock.koaRouter.stubs.route.args[0][0].path, path.replace(/^\/|\/$/g, ''))

        assert.equal(ControllerMock.stubs.controller.callCount, 0)
        ModulesMock.koaRouter.stubs.route.args[0][0].middleware[0]()
        assert.equal(ControllerMock.stubs.controller.callCount, 1)
      })

      test('when route has middleware', () => {
        const numberOfMiddleware = faker.random.number(8) + 2
        const returnValues = faker.random.alphaNumeric(24)
        MiddlewareMock.stubs.middleware.returns(returnValues)

        const path = config.services.webserver.versions[0].router[0].path as string

        config = immer(config, draftConfig => {
          const versions: Version[] = []
          const middlewareList = []

          for (let i = 0; i < numberOfMiddleware; i++) {
            middlewareList.push(MiddlewareMock.Instance)
          }

          for (const version of draftConfig.services.webserver.versions) {
            versions.push({
              ...version,
              middleware: [],
              router: [
                {
                  ...version.router[0],
                  middleware: middlewareList,
                },
              ],
            })
          }
          draftConfig.services.webserver.versions = versions
          draftConfig.services.webserver.middleware = []
        })

        ModulesMock.reset()
        MiddlewareMock.reset()
        ControllerMock.reset()
        webserverHandler = new WebserverHandler(dependenciesMock, config)
        webserver = webserverHandler.setup({
          ...internalSystem,
          Config: config,
        })
        webserver()

        assert.equal(ModulesMock.koaRouter.stubs.route.callCount, 1)
        assert.deepEqual(ModulesMock.koaRouter.stubs.route.args[0][0].methods, [
          config.services.webserver.versions[0].router[0].method,
        ])
        assert.equal(ModulesMock.koaRouter.stubs.route.args[0][0].middleware.length, numberOfMiddleware + 1) // Controller is added as middleware in router
        assert.deepEqual(ModulesMock.koaRouter.stubs.route.args[0][0].params, {})
        assert.deepEqual(ModulesMock.koaRouter.stubs.route.args[0][0].path, path.replace(/^\/|\/$/g, ''))

        assert.equal(ControllerMock.stubs.controller.callCount, 0)
        assert.equal(MiddlewareMock.stubs.middleware.callCount, 0)

        for (const middleware of ModulesMock.koaRouter.stubs.route.args[0][0].middleware) {
          middleware()
        }

        assert.equal(MiddlewareMock.stubs.middleware.callCount, numberOfMiddleware)
        assert.equal(ControllerMock.stubs.controller.callCount, 1)
      })

      suite('check of Params get handled correctly', () => {
        setup(() => {
          config = immer(config, draftConfig => {
            draftConfig.services.webserver.versions = [
              {
                enabled: true,
                identifier: faker.random.alphaNumeric(6),
                middleware: [MiddlewareMock.Instance],
                router: [
                  {
                    controller: ControllerMock.Instance,
                    dependencies: {},
                    method: Methods.get,
                    middleware: [],
                    params: {},
                    path: `/${faker.random.alphaNumeric(8)}/`,
                  },
                ],
              },
              {
                enabled: false,
                identifier: faker.random.alphaNumeric(6),
                middleware: [MiddlewareMock.Instance],
                router: [
                  {
                    controller: ControllerMock.Instance,
                    dependencies: {},
                    method: Methods.get,
                    middleware: [],
                    params: {},
                    path: `/${faker.random.alphaNumeric(8)}/`,
                  },
                ],
              },
            ]
          })

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
            Config: config,
            DB: DatabaseHandlerMock.Instance,
            Log: new ModulesMock.logHandler.Instance(),
            Models: {},
            Queue: QueueHandlerMock.Instance,
          } as unknown) as InternalSystem<any, Config, {}>

          webserverHandler = new WebserverHandler(dependenciesMock, _.cloneDeep(configMocked.correct.everythingEnabled))
        })

        teardown(() => {
          ModulesMock.reset()
          MiddlewareMock.reset()
          ControllerMock.reset()
          ParamMock.reset()
        })

        test('when route has a param function', () => {
          config = immer(config, draftConfig => {
            const versions: Version[] = []
            for (const version of draftConfig.services.webserver.versions) {
              versions.push({
                ...version,
                router: [
                  {
                    ...version.router[0],
                    params: {
                      udhsfifhdskjhfd: ParamMock.Instance,
                    },
                  },
                ],
              })
            }

            draftConfig.services.webserver.versions = versions
          })

          ModulesMock.reset()
          MiddlewareMock.reset()
          ControllerMock.reset()
          webserverHandler = new WebserverHandler(dependenciesMock, config)
          webserver = webserverHandler.setup({
            ...internalSystem,
            Config: config,
          })
          webserver()

          assert.equal(ParamMock.stubs.setup.callCount, 1)
          assert.equal(ParamMock.stubs.param.callCount, 0)
          ModulesMock.koaRouter.stubs.route.args[0][0].params.udhsfifhdskjhfd()
          assert.equal(ParamMock.stubs.param.callCount, 1)
        })

        test('when route has a param is an object with dependencies', () => {
          const dependencies = {
            id: faker.random.alphaNumeric(12),
          }

          config = immer(config, draftConfig => {
            const versions: Version[] = []
            for (const version of draftConfig.services.webserver.versions) {
              versions.push({
                ...version,
                router: [
                  {
                    ...version.router[0],
                    params: {
                      udhsfifhdskjhfd: {
                        dependencies: dependencies,
                        fnc: ParamMock.Instance,
                      },
                    },
                  },
                ],
              })
            }

            draftConfig.services.webserver.versions = versions
          })

          ModulesMock.reset()
          MiddlewareMock.reset()
          ControllerMock.reset()
          webserverHandler = new WebserverHandler(dependenciesMock, config)
          webserver = webserverHandler.setup({
            ...internalSystem,
            Config: config,
          })
          webserver()

          assert.equal(ParamMock.stubs.setup.callCount, 1)
          assert.equal(ParamMock.stubs.param.callCount, 0)
          ModulesMock.koaRouter.stubs.route.args[0][0].params.udhsfifhdskjhfd()
          assert.equal(ParamMock.stubs.param.callCount, 1)
        })

        test('Param Function gets copy of Internal System', () => {
          const dependencies = {
            id: faker.random.alphaNumeric(12),
          }

          config = immer(config, draftConfig => {
            const versions: Version[] = []
            for (const version of draftConfig.services.webserver.versions) {
              versions.push({
                ...version,
                router: [
                  {
                    ...version.router[0],
                    params: {
                      udhsfifhdskjhfd: {
                        dependencies: dependencies,
                        fnc: ParamMock.Instance,
                      },
                    },
                  },
                ],
              })
            }

            draftConfig.services.webserver.versions = versions
          })

          ModulesMock.reset()
          MiddlewareMock.reset()
          ControllerMock.reset()
          webserverHandler = new WebserverHandler(dependenciesMock, config)
          webserver = webserverHandler.setup({
            ...internalSystem,
            Config: config,
          })
          webserver()

          assert.equal(ParamMock.stubs.setup.callCount, 1)
          assert.deepEqual(ParamMock.stubs.setup.args[0][0], {
            ...internalSystem,
            Config: config,
            Dependencies: dependencies,
          })
        })
      })
    })
  })
})
