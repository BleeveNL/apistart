/* eslint-disable @typescript-eslint/no-explicit-any */
import {assert} from 'chai'
import * as _ from 'lodash'
import {Log} from 'loghandler'
import * as process from 'process'
import * as amqp from 'amqplib'
import configMocked from '../../mocks/config.mock'
import DefaultExport, {QueueHandler} from '../../../services/queue/queueHandler'
import * as AmqpLibMock from '../../mocks/nodeModules/amqp.mock'
import * as loghandlerMock from '../../mocks/nodeModules/logHandler.mock'
import * as joi from '@hapi/joi'
import queueDisabledSchema from './validationSchemas/queueDisabled.schema'
import queueEnabledSchema from './validationSchemas/queueEnabled.schema'

suite('Test DatabaseHandler (./services/queue/queueHandler.ts)', () => {
  let correctConfig = _.cloneDeep(configMocked.correct)

  setup(() => {
    correctConfig = _.cloneDeep(configMocked.correct)
  })

  test('Returns as default a instanceOf the queueHandler Class', () => {
    assert.instanceOf(new DefaultExport({} as any, correctConfig), QueueHandler)
  })

  test('Object has an static Factory function', () => {
    assert.isFunction(QueueHandler.factory)
  })

  test('factory gets 1 parameter', () => {
    assert.equal(QueueHandler.factory.length, 1)
  })

  test('factory() returns instance of QueueHandler', () => {
    assert.instanceOf(QueueHandler.factory(correctConfig), QueueHandler)
  })

  suite('setup() works as expected', () => {
    let queueHandler = new QueueHandler(
      {
        Amqp: (new AmqpLibMock.Instance() as unknown) as typeof amqp,
        Log: (new loghandlerMock.Instance() as unknown) as Log,
        Process: process,
      },
      correctConfig,
    )

    setup(() => {
      queueHandler = new QueueHandler(
        {
          Amqp: (new AmqpLibMock.Instance() as unknown) as typeof amqp,
          Log: (new loghandlerMock.Instance() as unknown) as Log,
          Process: process,
        },
        correctConfig,
      )
    })

    teardown(() => {
      loghandlerMock.reset()
      AmqpLibMock.reset()
    })

    suite('test behavior when service is disabled', () => {
      test('setup() returns only a server functionality', async () => {
        const queue = await queueHandler.setup()

        joi.assert(queue, queueDisabledSchema)
      })

      test('by setup() returned server() throws correct error.', async () => {
        const queue = await queueHandler.setup()
        assert.throws(queue.server, 'Queue server listener is started while service is disabled in configuration.')
      })
    })

    suite('test behavior when service is enabled', () => {
      setup(() => {
        queueHandler = new QueueHandler(
          {
            Amqp: (new AmqpLibMock.Instance() as unknown) as typeof amqp,
            Log: (new loghandlerMock.Instance() as unknown) as Log,
            Process: process,
          },
          _.cloneDeep(configMocked.queueEnabled),
        )
      })

      test('setup() returns client & server functionality', async () => {
        const queue = await queueHandler.setup()

        joi.assert(queue, queueEnabledSchema)
      })
    })
  })
})
