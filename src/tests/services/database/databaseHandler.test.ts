/* eslint-disable @typescript-eslint/no-explicit-any */
import {assert} from 'chai'
import immer from 'immer'
import * as faker from 'faker'
import {Log} from 'loghandler'
import * as fs from 'fs'
import * as loghandlerMock from '../../mocks/nodeModules/logHandler.mock'
import DefaultExport, {DatabaseHandler} from '../../../services/database/databaseHandler'
import configMocked from '../../mocks/config.mock'
import * as sequelizeMock from '../../mocks/nodeModules/sequelize.mock'
import {Sequelize} from 'sequelize/types'
import * as ModelMocked from './mocks/model.mock'
import {Model, Models} from '../../../services/database/interfaces/model'
import {Config} from '../../../systemInterfaces/config'

suite('Test DatabaseHandler (./services/database/databaseHandler.ts)', () => {
  let correctConfig: Config<any> = JSON.parse(JSON.stringify(configMocked.correct.everythingDisabled))

  setup(() => {
    correctConfig = JSON.parse(JSON.stringify(configMocked.correct.everythingDisabled))
  })

  teardown(() => {
    sequelizeMock.reset()
    loghandlerMock.reset()
  })

  test('Returns as default a instanceOf the databaseHandler Class', () => {
    assert.instanceOf(new DefaultExport({} as any, correctConfig), DatabaseHandler)
  })

  test('Object has an static Factory function', () => {
    assert.isFunction(DatabaseHandler.factory)
  })

  test('factory gets 1 parameter', () => {
    assert.equal(DatabaseHandler.factory.length, 1)
  })

  test('factory() returns instance of databaseHandler', () => {
    assert.instanceOf(DatabaseHandler.factory(correctConfig), DatabaseHandler)
  })

  suite('test setup()', () => {
    let databaseHandler = new DatabaseHandler(
      {
        Immer: immer,
        Log: new loghandlerMock.Instance() as unknown as Log,
        Sequelize: sequelizeMock.Instance as unknown as typeof Sequelize,
        fs,
        systemModels: {},
      },
      correctConfig,
    )

    setup(() => {
      databaseHandler = new DatabaseHandler(
        {
          Immer: immer,
          Log: new loghandlerMock.Instance() as unknown as Log,
          Sequelize: sequelizeMock.Instance as unknown as typeof Sequelize,
          fs,
          systemModels: {},
        },
        correctConfig,
      )
    })

    teardown(() => {
      sequelizeMock.reset()
      loghandlerMock.reset()
    })

    test('setup() throws error when database is disabled by configuration', async () => {
      try {
        await databaseHandler.setup()
        assert.isNotOk("shouldn't come here")
      } catch (err) {
        assert.strictEqual(
          err.message,
          'Given configuration forbids to run DatabaseHandler. Cache is disabled in configuration object.',
        )
      }
    })

    test('setup() makes correct connection with sequelize.', async () => {
      databaseHandler = new DatabaseHandler(
        {
          Immer: immer,
          Log: new loghandlerMock.Instance() as unknown as Log,
          Sequelize: sequelizeMock.Instance as unknown as typeof Sequelize,
          fs,
          systemModels: {},
        },
        configMocked.correct.everythingEnabled,
      )

      await databaseHandler.setup()

      assert.isTrue(sequelizeMock.stubs.constructor.calledOnce)
      const constructorInput = sequelizeMock.stubs.constructor.args[0][0]
      assert.equal(configMocked.correct.everythingEnabled.services.database.database, constructorInput.database)
      assert.equal(configMocked.correct.everythingEnabled.services.database.dialect, constructorInput.dialect)
      assert.equal(configMocked.correct.everythingEnabled.services.database.username, constructorInput.username)
      assert.equal(configMocked.correct.everythingEnabled.services.database.password, constructorInput.password)
      assert.equal(configMocked.correct.everythingEnabled.services.database.port, constructorInput.port)
      assert.isTrue(sequelizeMock.stubs.authenticate.calledOnce)
      assert.equal(loghandlerMock.stubs.info.args[0][0], 'Database connection is made')
    })

    test('setup() throws Error when DB authentication fails', async () => {
      const error = new Error(faker.lorem.sentence())
      sequelizeMock.stubs.authenticate.throws(error)
      databaseHandler = new DatabaseHandler(
        {
          Immer: immer,
          Log: new loghandlerMock.Instance() as unknown as Log,
          Sequelize: sequelizeMock.Instance as unknown as typeof Sequelize,
          fs,
          systemModels: {},
        },
        configMocked.correct.everythingEnabled,
      )

      try {
        await databaseHandler.setup()
        assert.isNotOk("shouldn't come here")
      } catch (err) {
        assert.strictEqual(err.message, error.message)
      }
    })

    test('connect() has logging by default enabled and installed', async () => {
      const databaseHandler = new DatabaseHandler(
        {
          Immer: immer,
          Log: new loghandlerMock.Instance() as unknown as Log,
          Sequelize: sequelizeMock.Instance as unknown as typeof Sequelize,
          fs,
          systemModels: {},
        },
        configMocked.correct.everythingEnabled,
      )

      await databaseHandler.setup()

      const args = sequelizeMock.stubs.constructor.args[0][0]
      assert.isFunction(args.logging)

      const data = {
        msg: faker.lorem.sentence(),
        speed: faker.datatype.number(),
      }

      args.logging(data.msg, data.speed)

      assert.isTrue(loghandlerMock.stubs.debug.calledOnce)
      const receivedArgs = loghandlerMock.stubs.debug.args[0]

      assert.deepEqual(receivedArgs, [data.msg, {speed: data.speed}, []])
    })
  })

  suite('DB Models get loaded correctly', () => {
    let databaseHandler

    test('Given system models get correctly initialized + synced', async () => {
      const randomNumber = Math.round(1 + 10 * Math.random())
      let systemModels: Models = {}
      const mock = ModelMocked

      for (let i = 0; i < randomNumber; i++) {
        systemModels = immer(systemModels, draft => {
          const modelName = faker.random.alphaNumeric(8)
          draft[modelName] = mock.Instance as any as Model
        })
      }

      databaseHandler = new DatabaseHandler(
        {
          Immer: immer,
          Log: new loghandlerMock.Instance() as unknown as Log,
          Sequelize: sequelizeMock.Instance as unknown as typeof Sequelize,
          fs,
          systemModels,
        },
        configMocked.correct.everythingEnabled,
      )

      ModelMocked.reset()
      await databaseHandler.setup()

      assert.equal(mock.stubs.init.callCount, randomNumber)
      assert.equal(mock.stubs.sync.callCount, randomNumber)
      let i = 0
      for (const modelName in systemModels) {
        const model = systemModels[modelName]
        const initArgs = mock.stubs.init.args[i]
        const syncArgs = mock.stubs.sync.args[i]

        assert.deepEqual(initArgs[0], model.structure)
        assert.include(initArgs[1], model.settings)
        assert.containsAllKeys(initArgs[1], ['sequelize'])
        assert.instanceOf(initArgs[1].sequelize, sequelizeMock.Instance)
        assert.equal(syncArgs.length, 1)
        i++
      }
    })

    test('system logs an error when something goes wrong with initializing + syncing system models', async () => {
      databaseHandler = new DatabaseHandler(
        {
          Immer: immer,
          Log: new loghandlerMock.Instance() as unknown as Log,
          Sequelize: sequelizeMock.Instance as unknown as typeof Sequelize,
          fs,
          systemModels: {test: ModelMocked.Instance as any as Model},
        },
        configMocked.correct.everythingEnabled,
      )

      const error = new Error(faker.random.words(8))
      ModelMocked.stubs.init.throws(error)

      await databaseHandler.setup()
      assert.isTrue(loghandlerMock.stubs.err.calledOnce)
      assert.deepEqual(loghandlerMock.stubs.err.args, [['Error during syncing system DB Models', error]])
    })

    teardown(() => {
      sequelizeMock.reset()
      loghandlerMock.reset()
      ModelMocked.reset()
    })
  })

  suite('getModels() works correctly', () => {
    let databaseHandler

    teardown(() => {
      sequelizeMock.reset()
      loghandlerMock.reset()
      ModelMocked.reset()
    })

    test('Given user defined models get correctly initialized + synced', async () => {
      const randomNumber = Math.round(1 + 10 * Math.random())
      let models: Models = {}

      const mock = ModelMocked
      const DB = faker.random.alphaNumeric(64)

      for (let i = 0; i < randomNumber; i++) {
        models = immer(models, draft => {
          const modelName = faker.random.alphaNumeric(8)
          draft[modelName] = mock.Instance as any as Model
        })
      }

      const config = immer(configMocked.correct.everythingEnabled, draft => {
        draft.services.database.models = models
      })

      databaseHandler = new DatabaseHandler(
        {
          Immer: immer,
          Log: new loghandlerMock.Instance() as unknown as Log,
          Sequelize: sequelizeMock.Instance as unknown as typeof Sequelize,
          fs,
          systemModels: {},
        },
        config,
      )

      ModelMocked.reset()

      await databaseHandler.getModels(DB as any as Sequelize)
      let i = 0
      for (const modelName in models) {
        const model = models[modelName]
        const initArgs = mock.stubs.init.args[i]

        assert.deepEqual(initArgs[0], model.structure)
        assert.include(initArgs[1], model.settings)
        assert.containsAllKeys(initArgs[1], ['sequelize'])
        assert.equal(initArgs[1].sequelize, DB)
        i++
      }
    })

    test('getModels() throws error when database is disabled by configuration', async () => {
      databaseHandler = new DatabaseHandler(
        {
          Immer: immer,
          Log: new loghandlerMock.Instance() as unknown as Log,
          Sequelize: sequelizeMock.Instance as unknown as typeof Sequelize,
          fs,
          systemModels: {},
        },
        configMocked.correct.everythingDisabled,
      )

      try {
        await databaseHandler.getModels(faker.random.alphaNumeric(64) as any as Sequelize)
        assert.isNotOk("shouldn't come here")
      } catch (err) {
        assert.strictEqual(
          err.message,
          `Database "getModels()" shouldn't be called, because service is turned off by configuration!`,
        )
      }
    })
  })
})
