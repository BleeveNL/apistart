/* eslint-disable @typescript-eslint/no-explicit-any */
import {Config} from '../../../systemInterfaces/config'
import {WebserverEnabledServiceConfigurator, WebserverHandlerDeps} from '../../../services/webserver/interfaces'
import immer from 'immer'
import configMocked from '../../mocks/config.mock'
import * as MiddlewareMock from '../../mocks/webserver/middleware.mock'
import * as ParamMock from '../../mocks/webserver/param.mock'
import * as ControllerMock from '../../mocks/webserver/controller.mock'
import * as CacheHandlerMock from '../../mocks/cacheHandler.mock'
import * as DatabaseHandlerMock from '../../mocks/databaseHandler.mock'
import * as QueueHandlerMock from '../../mocks/queueHandler.mock'

import * as faker from 'faker'
import * as ModulesMock from '../../mocks/nodeModules'
import {Methods} from 'koa-advanced-router'
import {assert} from 'chai'
import {InternalSystem} from '../../../systemInterfaces/internalSystem'
import WebserverHandler from '../../../services/webserver/webserverHandler'
import {ApiStartSettings} from '../../../systemInterfaces/apiStartSettings'

let config: Config<ApiStartSettings<WebserverEnabledServiceConfigurator<true, true, false>>> = JSON.parse(
  JSON.stringify(configMocked.correct.everythingEnabledWithoutVersioning),
)
let dependenciesMock: WebserverHandlerDeps
let webserverHandler: WebserverHandler<ApiStartSettings<WebserverEnabledServiceConfigurator<true, true, false>>>
let internalSystem: InternalSystem<ApiStartSettings<WebserverEnabledServiceConfigurator<true, true, false>>>
let webserver: (callback?: () => void) => {close: (callback?: () => void) => void}

suite('Test Webserver Handler (./services/webserver/webserverHandler.ts)', () => {
  suite('Routeing is handled correctly', () => {
    setup(() => {
      config = immer(config, draftConfig => {
        draftConfig.services.webserver.settings.versionHandler = false

        draftConfig.services.webserver.router = [
          {
            controller: ControllerMock.Instance,
            method: Methods.get,
            params: {},
            path: `/${faker.random.alphaNumeric(8)}/`,
          },
        ]
      })

      dependenciesMock = {
        Http: new ModulesMock.http.Instance(),
        Https: new ModulesMock.https.Instance(),
        Immer: immer,
        Koa: ModulesMock.koa.Instance,
        KoaBodyParser: new ModulesMock.koaBodyParser.Instance().fn,
        KoaCors: new ModulesMock.koaCors.Instance().fn,
        KoaRouter: ModulesMock.koaRouter.Instance,
      } as unknown as WebserverHandlerDeps

      internalSystem = {
        Cache: CacheHandlerMock.Instance,
        Config: config,
        DB: DatabaseHandlerMock.Instance,
        Log: new ModulesMock.logHandler.Instance(),
        Models: {},
        Queue: QueueHandlerMock.Instance,
      } as unknown as InternalSystem<ApiStartSettings<WebserverEnabledServiceConfigurator<true, true, false>>>

      webserverHandler = new WebserverHandler(dependenciesMock)

      webserver = webserverHandler.setup(internalSystem)
    })

    teardown(() => {
      ModulesMock.reset()
      MiddlewareMock.reset()
      ControllerMock.reset()
      ParamMock.reset()
    })

    test('in default test case', () => {
      const path = config.services.webserver.router[0].path as string

      assert.equal(ModulesMock.koaRouter.stubs.route.callCount, 1)
      assert.deepEqual(ModulesMock.koaRouter.stubs.route.args[0][0].methods, [
        config.services.webserver.router[0].method,
      ])
      assert.equal(ModulesMock.koaRouter.stubs.route.args[0][0].middleware.length, 1)
      assert.deepEqual(ModulesMock.koaRouter.stubs.route.args[0][0].params, {})
      assert.deepEqual(ModulesMock.koaRouter.stubs.route.args[0][0].path, path)

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
        draftConfig.services.webserver.settings.versionHandler = false

        draftConfig.services.webserver.router = [
          {
            ...draftConfig.services.webserver.router[0],
            dependencies: dependencies,
          },
        ]
      })

      webserverHandler = new WebserverHandler(dependenciesMock)
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
        draftConfig.services.webserver.router = [
          {
            ...draftConfig.services.webserver.router[0],
            path: path,
          },
        ]
      })

      ModulesMock.reset()
      MiddlewareMock.reset()
      ControllerMock.reset()
      webserverHandler = new WebserverHandler(dependenciesMock)
      webserver = webserverHandler.setup({
        ...internalSystem,
        Config: config,
      })
      webserver()

      assert.equal(ModulesMock.koaRouter.stubs.route.callCount, 1)
      assert.deepEqual(ModulesMock.koaRouter.stubs.route.args[0][0].methods, [
        config.services.webserver.router[0].method,
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

      config = immer(config, draftConfig => {
        draftConfig.services.webserver.router = [
          {
            ...draftConfig.services.webserver.router[0],
            method: methods,
          },
        ]
      })

      ModulesMock.reset()
      MiddlewareMock.reset()
      ControllerMock.reset()
      webserverHandler = new WebserverHandler(dependenciesMock)
      webserver = webserverHandler.setup({
        ...internalSystem,
        Config: config,
      })
      webserver()

      assert.deepEqual(ModulesMock.koaRouter.stubs.route.args[0][0].methods, methods)
    })

    test('when route has middleware', () => {
      const numberOfMiddleware = faker.datatype.number(8) + 2
      const returnValues = faker.random.alphaNumeric(24)
      MiddlewareMock.stubs.middleware.returns(returnValues)

      config = immer(config, draftConfig => {
        const middlewareList = []

        for (let i = 0; i < numberOfMiddleware; i++) {
          middlewareList.push(MiddlewareMock.Instance)
        }

        draftConfig.services.webserver.router = [
          {
            ...draftConfig.services.webserver.router[0],
            middleware: middlewareList,
          },
        ]
      })

      ModulesMock.reset()
      MiddlewareMock.reset()
      ControllerMock.reset()
      webserverHandler = new WebserverHandler(dependenciesMock)
      webserver = webserverHandler.setup({
        ...internalSystem,
        Config: config,
      })
      webserver()

      assert.equal(ModulesMock.koaRouter.stubs.route.args[0][0].middleware.length, numberOfMiddleware + 1) // Controller is added as middleware in router

      assert.equal(ControllerMock.stubs.controller.callCount, 0)
      assert.equal(MiddlewareMock.stubs.middleware.callCount, 0)

      for (const middleware of ModulesMock.koaRouter.stubs.route.args[0][0].middleware) {
        middleware()
      }

      assert.equal(MiddlewareMock.stubs.middleware.callCount, numberOfMiddleware)
      assert.equal(ControllerMock.stubs.controller.callCount, 1)
    })

    suite('check of Params get handled correctly', () => {
      test('when route has a param function', () => {
        const params = {hajhfdkjhdkfh: ParamMock.Instance}

        config = immer(config, draftConfig => {
          draftConfig.services.webserver.router = [
            {
              ...draftConfig.services.webserver.router[0],
              params,
            },
          ]
        })

        ModulesMock.reset()
        MiddlewareMock.reset()
        ControllerMock.reset()
        webserverHandler = new WebserverHandler(dependenciesMock)
        webserver = webserverHandler.setup({
          ...internalSystem,
          Config: config,
        })
        webserver()

        assert.equal(ParamMock.stubs.setup.callCount, 1)
        assert.equal(ParamMock.stubs.param.callCount, 0)
        ModulesMock.koaRouter.stubs.route.args[0][0].params.hajhfdkjhdkfh()
        assert.equal(ParamMock.stubs.param.callCount, 1)
      })

      test('when route has a param is an object with dependencies', () => {
        const params = {
          hajhfdkjhdkfh: {
            dependencies: {
              key: faker.random.alphaNumeric(12),
            },
            fnc: ParamMock.Instance,
          },
        }

        config = immer(config, draftConfig => {
          draftConfig.services.webserver.router = [
            {
              ...draftConfig.services.webserver.router[0],
              params,
            },
          ]
        })

        ModulesMock.reset()
        MiddlewareMock.reset()
        ControllerMock.reset()
        webserverHandler = new WebserverHandler(dependenciesMock)
        webserver = webserverHandler.setup({
          ...internalSystem,
          Config: config,
        })
        webserver()

        assert.equal(ParamMock.stubs.setup.callCount, 1)
        assert.equal(ParamMock.stubs.param.callCount, 0)
        ModulesMock.koaRouter.stubs.route.args[0][0].params.hajhfdkjhdkfh()
        assert.equal(ParamMock.stubs.param.callCount, 1)
      })

      test('Param Function gets copy of Internal System', () => {
        const params = {
          hajhfdkjhdkfh: {
            dependencies: {
              key: faker.random.alphaNumeric(12),
            },
            fnc: ParamMock.Instance,
          },
        }

        config = immer(config, draftConfig => {
          draftConfig.services.webserver.router = [
            {
              ...draftConfig.services.webserver.router[0],
              params,
            },
          ]
        })

        ModulesMock.reset()
        MiddlewareMock.reset()
        ControllerMock.reset()
        webserverHandler = new WebserverHandler(dependenciesMock)
        webserver = webserverHandler.setup({
          ...internalSystem,
          Config: config,
        })
        webserver()

        assert.equal(ParamMock.stubs.setup.callCount, 1)
        assert.deepEqual(ParamMock.stubs.setup.args[0][0], {
          ...internalSystem,
          Config: config,
          Dependencies: params.hajhfdkjhdkfh.dependencies,
        })
      })
    })
  })
})
