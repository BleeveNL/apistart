/* eslint-disable @typescript-eslint/no-explicit-any, sort-keys */
import {assert} from 'chai'
import * as faker from 'faker'
import {Log} from 'loghandler'
import * as process from 'process'
import * as amqp from 'amqplib'
import immer from 'immer'
import configMocked from '../../mocks/config.mock'
import DefaultExport, {QueueHandler} from '../../../services/queue/queueHandler'
import * as AmqpLibMock from '../../mocks/nodeModules/amqp.mock'
import * as loghandlerMock from '../../mocks/nodeModules/logHandler.mock'
import * as joi from 'joi'
import queueDisabledSchema from './validationSchemas/queueDisabled.schema'
import queueEnabledSchema from './validationSchemas/queueEnabled.schema'
import {Config} from '../../../systemInterfaces/config'
import queueEnabledClientSchema from './validationSchemas/queueEnabledClient.schema'
import {QueueClient, QueueHandlerSetupEnabled, QueueHandlerSetupDisabled} from '../../../services/queue/interfaces'
import {InternalSystem} from '../../../systemInterfaces/internalSystem'
import * as EventHandlerMock from './mocks/eventHandler.mock'
import * as sinon from 'sinon'
import {ApiStartSettings} from '../../../systemInterfaces/apiStartSettings'

suite('Test QueueHandler (./services/queue/queueHandler.ts)', () => {
  let correctConfig: Config<any> = JSON.parse(JSON.stringify(configMocked.correct.everythingDisabled))

  setup(() => {
    correctConfig = JSON.parse(JSON.stringify(configMocked.correct.everythingDisabled))
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

    suite('test behavior when service is disabled', async () => {
      test('setup() returns only a function with a server functionality in it', async () => {
        const queue = ((await queueHandler.setup()) as unknown) as QueueHandlerSetupDisabled
        joi.assert(queue, queueDisabledSchema)
        assert.isFunction(queue.server)
        const loaded = await queue.server()
        assert.isFunction(loaded)
      })

      test('server() throws correct error.', async () => {
        const queue = ((await queueHandler.setup()) as unknown) as QueueHandlerSetupDisabled
        const loaded = (await queue.server()) as any

        try {
          await loaded()
          assert.fail("Shouldn't come here!")
        } catch (err) {
          assert.equal(err.message, 'Queue server listener is started while service is disabled in configuration.')
        }
      })

      test('client is undefined when service is disabled', async () => {
        const queue = ((await queueHandler.setup()) as unknown) as QueueHandlerSetupDisabled

        assert.equal(typeof queue.client, 'undefined')
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
          JSON.parse(JSON.stringify(configMocked.correct.everythingEnabled)),
        )
      })

      suite('test of connection with rabbitMQ is made correctly', () => {
        test('system throws error when no exchanges are configured.', async () => {
          const config = immer(JSON.parse(JSON.stringify(correctConfig)) as Config<any>, (draft: any) => {
            draft.services.queue.enabled = true
            draft.services.queue.exchanges = []
          })

          queueHandler = new QueueHandler(
            {
              Amqp: (new AmqpLibMock.Instance() as unknown) as typeof amqp,
              Log: (new loghandlerMock.Instance() as unknown) as Log,
              Process: process,
            },
            config,
          )

          try {
            await queueHandler.setup()
            assert.fail("Shouldn't come here")
          } catch (err) {
            const expectedError = new Error(
              "Couldn't establish connection with amqp service, because none exchanges are configured in config file.",
            )
            assert.strictEqual(expectedError.message, err.message)
          }
        })

        test('Connect function of AMQPlib is only called once and correct', async () => {
          let config: Config<{
            queue: {enabled: true; exchanges: any}
            cache: false
            database: false
            webserver: false
          }> = immer(JSON.parse(JSON.stringify(correctConfig)) as Config<any>, (draft: any) => {
            draft.services.queue.enabled = true
            draft.services.queue.exchanges = []
          })

          const MaximalExchanges = Math.round(Math.random() * 5) + 2
          for (let i = 0; i < MaximalExchanges; i++) {
            const exchangeItem = {
              name: faker.random.alphaNumeric(8),
              options: {
                durable: Boolean(Math.round(Math.random())),
                internal: Boolean(Math.round(Math.random())),
                autoDelete: Boolean(Math.round(Math.random())),
                alternateExchange: faker.random.alphaNumeric(12),
                arguments: faker.random.arrayElement(),
              },
              type: 'default',
            }

            config = immer(config, (draft: any) => {
              draft.services.queue.exchanges.push(exchangeItem)
            })
          }

          queueHandler = new QueueHandler(
            {
              Amqp: (new AmqpLibMock.Instance() as unknown) as typeof amqp,
              Log: (new loghandlerMock.Instance() as unknown) as Log,
              Process: process,
            },
            config,
          )

          await queueHandler.setup()
          assert.equal(AmqpLibMock.stubs.connect.calledOnce, true)
          assert.equal(AmqpLibMock.stubs.connect.getCall(0).args.length, 1)
          assert.deepEqual(AmqpLibMock.stubs.connect.getCall(0).args, [config.services.queue])
        })

        test('CreateChannel function of AMQPlib is only called once and correct', async () => {
          let config: Config<{
            queue: {enabled: true; exchanges: any}
            cache: false
            database: false
            webserver: false
          }> = immer(JSON.parse(JSON.stringify(correctConfig)) as Config<any>, (draft: any) => {
            draft.services.queue.enabled = true
            draft.services.queue.exchanges = []
          })

          const MaximalExchanges = Math.round(Math.random() * 5) + 2
          for (let i = 0; i < MaximalExchanges; i++) {
            const exchangeItem = {
              name: faker.random.alphaNumeric(8),
              options: {
                durable: Boolean(Math.round(Math.random())),
                internal: Boolean(Math.round(Math.random())),
                autoDelete: Boolean(Math.round(Math.random())),
                alternateExchange: faker.random.alphaNumeric(12),
                arguments: faker.random.arrayElement(),
              },
              type: 'default',
            }

            config = immer(config, (draft: any) => {
              draft.services.queue.exchanges.push(exchangeItem)
            })
          }

          queueHandler = new QueueHandler(
            {
              Amqp: (new AmqpLibMock.Instance() as unknown) as typeof amqp,
              Log: (new loghandlerMock.Instance() as unknown) as Log,
              Process: process,
            },
            config,
          )

          await queueHandler.setup()
          assert.equal(AmqpLibMock.stubs.createChannel.calledOnce, true)
          assert.equal(AmqpLibMock.stubs.createChannel.getCall(0).args.length, 0)
        })

        test('make sure that system assert exchanges correctly, to validate of settings are matching with server.', async () => {
          let config: Config<{
            queue: {enabled: true; exchanges: any}
            cache: false
            database: false
            webserver: false
          }> = immer(JSON.parse(JSON.stringify(correctConfig)) as Config<any>, (draft: any) => {
            draft.services.queue.enabled = true
            draft.services.queue.exchanges = []
          })

          const MaximalExchanges = Math.round(Math.random() * 5) + 2
          for (let i = 0; i < MaximalExchanges; i++) {
            const exchangeItem = {
              name: faker.random.alphaNumeric(8),
              options: {
                durable: Boolean(Math.round(Math.random())),
                internal: Boolean(Math.round(Math.random())),
                autoDelete: Boolean(Math.round(Math.random())),
                alternateExchange: faker.random.alphaNumeric(12),
                arguments: faker.random.arrayElement(),
              },
              type: faker.random.alphaNumeric(8),
            }

            config = immer(config, (draft: any) => {
              draft.services.queue.exchanges.push(exchangeItem)
            })
          }

          config = immer(config, (draft: any) => {
            draft.services.queue.exchanges[0].type = 'default'
          })

          queueHandler = new QueueHandler(
            {
              Amqp: (new AmqpLibMock.Instance() as unknown) as typeof amqp,
              Log: (new loghandlerMock.Instance() as unknown) as Log,
              Process: process,
            },
            config,
          )

          await queueHandler.setup()
          assert.equal(AmqpLibMock.stubs.assertExchange.callCount, config.services.queue.exchanges.length)

          for (let i = 0; i < AmqpLibMock.stubs.assertExchange.args.length; i++) {
            const args = AmqpLibMock.stubs.assertExchange.args[i]
            const exchange = config.services.queue.exchanges[i]

            assert.equal(args.length, 3)
            assert.equal(args[0], exchange.name)
            assert.equal(args[1], exchange.type === 'default' ? '' : exchange.type)
            assert.deepEqual(args[2], exchange.options)
          }
        })

        test('Make sure that durability setting is true when no preference is given', async () => {
          const config: Config<{
            queue: {enabled: true; exchanges: any}
            cache: false
            database: false
            webserver: false
          }> = immer(JSON.parse(JSON.stringify(correctConfig)) as Config<any>, (draft: any) => {
            draft.services.queue.enabled = true
            draft.services.queue.exchanges = [
              {
                name: faker.random.alphaNumeric(8),
              },
              {
                name: faker.random.alphaNumeric(8),
                options: {
                  durable: false,
                },
              },
              {
                name: faker.random.alphaNumeric(8),
                options: {
                  durable: true,
                },
              },
              {
                name: faker.random.alphaNumeric(8),
                options: {
                  internal: Boolean(Math.round(Math.random())),
                },
              },
            ]
          })

          queueHandler = new QueueHandler(
            {
              Amqp: (new AmqpLibMock.Instance() as unknown) as typeof amqp,
              Log: (new loghandlerMock.Instance() as unknown) as Log,
              Process: process,
            },
            config,
          )

          await queueHandler.setup()
          assert.equal(AmqpLibMock.stubs.assertExchange.args[0][2].durable, true)
          assert.equal(AmqpLibMock.stubs.assertExchange.args[1][2].durable, false)
          assert.equal(AmqpLibMock.stubs.assertExchange.args[2][2].durable, true)
          assert.equal(AmqpLibMock.stubs.assertExchange.args[3][2].durable, true)
        })
      })

      test('setup() returns client & server functionality', async () => {
        const queue = ((await queueHandler.setup()) as unknown) as QueueHandlerSetupEnabled<ApiStartSettings>

        joi.assert(queue, queueEnabledSchema)
      })

      suite('test client functionality', () => {
        test("client is a function that doesn't allow any arguments", async () => {
          const queue: any = await queueHandler.setup()

          assert.isFunction(queue.client)
          assert.equal(queue.client.length, 0)
        })

        test('client() returns object according to schema', async () => {
          const queue: any = await queueHandler.setup()
          const client = queue.client()

          joi.assert(client, queueEnabledClientSchema)
        })

        suite('publish a message works as expected', () => {
          let config: Config<{queue: {enabled: true; exchanges: any}; cache: false; database: false; webserver: false}>
          let queueHandler: QueueHandler
          let client: QueueClient<any>

          setup(async () => {
            config = immer(JSON.parse(JSON.stringify(correctConfig)) as Config<any>, (draft: any) => {
              draft.services.queue.enabled = true
              draft.services.queue.exchanges = [
                {
                  name: faker.random.alphaNumeric(8),
                },
                {
                  name: faker.random.alphaNumeric(8),
                },
              ]
            })

            queueHandler = new QueueHandler(
              {
                Amqp: (new AmqpLibMock.Instance() as unknown) as typeof amqp,
                Log: (new loghandlerMock.Instance() as unknown) as Log,
                Process: process,
              },
              config,
            )
            const connection = (await queueHandler.setup()) as any
            if (connection.client !== undefined) {
              client = connection.client()
            } else {
              assert.fail("Setup() failed because client() wasn't  part of returned object of setup() of QueueHandler.")
            }
          })

          test("publish() reports an error when given exchange isn't configured in config", async () => {
            const exchangeName = faker.random.alphaNumeric(16)

            await client.publish(exchangeName, faker.random.alphaNumeric(8), {})
            assert.equal(loghandlerMock.stubs.err.calledOnce, true)
            assert.equal(loghandlerMock.stubs.err.args[0][0].name, 'Error')
            assert.equal(
              loghandlerMock.stubs.err.args[0][0].message,
              `Couldn't publish message, because exchange Name ${exchangeName} isn't configured in config file.`,
            )
          })

          test('Message is correctly published to Exchange', async () => {
            const exchange = config.services.queue.exchanges[0]
            const msg = {
              routingKey: faker.random.alphaNumeric(8),
              data: faker.random.alphaNumeric(8),
              options: {persistent: true, test: faker.random.alphaNumeric(8)},
            }

            await client.publish(exchange.name, msg.routingKey, msg.data, msg.options)

            assert.equal(AmqpLibMock.stubs.assertExchange.getCalls().length, 3)
            assert.equal(AmqpLibMock.stubs.publish.callCount, 1)

            const call = AmqpLibMock.stubs.publish.getCall(0)
            assert.equal(call.args.length, 4)
            assert.equal(call.args[0], exchange.name)
            assert.equal(call.args[1], msg.routingKey)
            assert.deepEqual(call.args[3], msg.options)

            const verifyBuffer = Buffer.from(JSON.stringify(msg.data), 'utf-8')
            assert.isTrue(Buffer.isBuffer(call.args[2]))
            assert.equal(call.args[2].toString(), verifyBuffer.toString())
          })

          test('Message is by default set as persistent', async () => {
            const exchange = config.services.queue.exchanges[0]
            const msgs = [
              {
                routingKey: faker.random.alphaNumeric(8),
                data: faker.random.alphaNumeric(8),
                options: {persistent: false, test: faker.random.alphaNumeric(8)},
                persist: false,
              },
              {
                routingKey: faker.random.alphaNumeric(8),
                data: faker.random.alphaNumeric(8),
                options: {test: faker.random.alphaNumeric(8)},
                persist: true,
              },
              {
                routingKey: faker.random.alphaNumeric(8),
                data: faker.random.alphaNumeric(8),
                options: undefined,
                persist: true,
              },
            ]

            for (const msg of msgs) {
              await client.publish(exchange.name, msg.routingKey, msg.data, msg.options)
            }

            assert.equal(AmqpLibMock.stubs.publish.callCount, 3)

            for (let i = 0; i < AmqpLibMock.stubs.publish.getCalls().length; i++) {
              const call = AmqpLibMock.stubs.publish.getCalls()[i]
              const options = call.args[3]

              assert.isTrue('persistent' in options && options.persistent === msgs[i].persist)
            }
          })

          test('Message is correctly published to Exchange when message is send to a second exchange', async () => {
            const exchange = config.services.queue.exchanges[1]
            const msg = {
              routingKey: faker.random.alphaNumeric(8),
              data: faker.random.alphaNumeric(8),
              options: {persistent: true, test: faker.random.alphaNumeric(8)},
            }

            await client.publish(exchange.name, msg.routingKey, msg.data, msg.options)

            assert.equal(AmqpLibMock.stubs.assertExchange.getCalls().length, 3)
            assert.equal(AmqpLibMock.stubs.publish.callCount, 1)

            const call = AmqpLibMock.stubs.publish.getCall(0)
            assert.equal(call.args.length, 4)
            assert.equal(call.args[0], exchange.name)
            assert.equal(call.args[1], msg.routingKey)
            assert.deepEqual(call.args[3], msg.options)

            const verifyBuffer = Buffer.from(JSON.stringify(msg.data), 'utf-8')
            assert.isTrue(Buffer.isBuffer(call.args[2]))
            assert.equal(call.args[2].toString(), verifyBuffer.toString())
          })
        })
      })

      suite('test server functionality', () => {
        let config: Config<{queue: {enabled: true; exchanges: any}; cache: false; database: false; webserver: false}>

        setup(async () => {
          config = immer(JSON.parse(JSON.stringify(correctConfig)) as Config<any>, (draft: any) => {
            draft.services.queue.enabled = true
            draft.services.queue.exchanges = [
              {
                name: faker.random.alphaNumeric(8),
              },
              {
                name: faker.random.alphaNumeric(8),
              },
            ]
          })

          queueHandler = new QueueHandler(
            {
              Amqp: (new AmqpLibMock.Instance() as unknown) as typeof amqp,
              Log: (new loghandlerMock.Instance() as unknown) as Log,
              Process: process,
            },
            config,
          )
        })

        teardown(async () => {
          EventHandlerMock.reset()
        })

        test('Server is a function that required one arguments', async () => {
          const queue: any = await queueHandler.setup()

          assert.isFunction(queue.server)
          assert.equal(queue.server.length, 1)
        })

        test('Server function returns a function that allows 2 argument', async () => {
          const queue = ((await queueHandler.setup()) as unknown) as QueueHandlerSetupEnabled<ApiStartSettings>
          const Deps = ({} as unknown) as InternalSystem<ApiStartSettings>

          const server = queue.server(Deps)
          assert.isFunction(server)
          assert.equal(server.length, 2)
        })

        test('Server throws an error as EventListener uses an unknown exchange', async () => {
          const queue = ((await queueHandler.setup()) as unknown) as QueueHandlerSetupEnabled<ApiStartSettings>
          const Deps = ({} as unknown) as InternalSystem<ApiStartSettings>
          const eventHandlerMock = EventHandlerMock

          const eventHandler = eventHandlerMock.Instance as any
          const exchangeName = faker.random.alphaNumeric(8)
          eventHandler.exchange = exchangeName

          const server = queue.server(Deps)
          try {
            await server([eventHandler])
            assert.fail(`Shouldn't be here!`)
          } catch (err) {
            assert.equal(
              err.message,
              `Queue server is stopped because it found an eventHandler that uses the "${exchangeName}" exchange, while this exchange isn't configured.`,
            )
          }
        })

        test('Server Calls Callback function when server is correctly booted', async () => {
          const queue = ((await queueHandler.setup()) as unknown) as QueueHandlerSetupEnabled<ApiStartSettings>
          const Deps = ({} as unknown) as InternalSystem<ApiStartSettings>

          const eventHandlerMock1 = EventHandlerMock
          const eventHandler = eventHandlerMock1.Instance as any
          eventHandler.exchange = config.services.queue.exchanges[0].name

          const callback = sinon.stub()
          const server = await queue.server(Deps)
          await server([eventHandler], callback)

          assert.equal(callback.callCount, 1)
        })

        test('Callback functions has only System Dependencies as argument', async () => {
          const queue = ((await queueHandler.setup()) as unknown) as QueueHandlerSetupEnabled<ApiStartSettings>
          const Deps = ({} as unknown) as InternalSystem<ApiStartSettings>

          const eventHandlerMock1 = EventHandlerMock
          const eventHandler = eventHandlerMock1.Instance as any
          eventHandler.exchange = config.services.queue.exchanges[0].name

          const callback = sinon.stub()
          const server = await queue.server(Deps)
          await server([eventHandler], callback)

          assert.equal(callback.callCount, 1)
          const args = callback.args[0]

          assert.equal(args.length, 1)
          assert.deepEqual(args[0], Deps)
        })

        test('Server makes correct Connection with AMQP server for each EventListener', async () => {
          const queue = ((await queueHandler.setup()) as unknown) as QueueHandlerSetupEnabled<ApiStartSettings>
          const Deps = ({} as unknown) as InternalSystem<ApiStartSettings>

          const eventHandlerMock1 = EventHandlerMock
          const eventHandler1 = eventHandlerMock1.Instance as any
          eventHandler1.exchange = config.services.queue.exchanges[0].name
          eventHandler1.settings.consume = {
            test: faker.random.alphaNumeric(14),
          }

          const eventHandlerMock2 = EventHandlerMock
          const eventHandler2 = eventHandlerMock2.Instance as any
          eventHandler2.exchange = config.services.queue.exchanges[1].name
          eventHandler2.settings.consume = {
            test: faker.random.alphaNumeric(14),
          }

          const assertQueueReturnValue = {
            queue: faker.random.alphaNumeric(14),
          }
          AmqpLibMock.stubs.assertQueue.returns(assertQueueReturnValue)

          const server = queue.server(Deps)
          const call = await server([eventHandler1, eventHandler2])
          assert.isTrue(call)

          assert.equal(AmqpLibMock.stubs.assertQueue.callCount, 2)
          assert.deepEqual(AmqpLibMock.stubs.assertQueue.args[0], [
            eventHandler1.settings.queue.name,
            eventHandler1.settings.queue,
          ])
          assert.deepEqual(AmqpLibMock.stubs.assertQueue.args[1], [
            eventHandler2.settings.queue.name,
            eventHandler2.settings.queue,
          ])

          assert.equal(AmqpLibMock.stubs.bindQueue.callCount, 2)
          assert.deepEqual(AmqpLibMock.stubs.bindQueue.args[0], [
            assertQueueReturnValue.queue,
            eventHandler1.exchange,
            eventHandler1.routingKey,
          ])
          assert.deepEqual(AmqpLibMock.stubs.bindQueue.args[1], [
            assertQueueReturnValue.queue,
            eventHandler2.exchange,
            eventHandler2.routingKey,
          ])

          assert.equal(AmqpLibMock.stubs.consume.callCount, 2)
          assert.deepEqual(AmqpLibMock.stubs.consume.args[0][0], assertQueueReturnValue.queue)
          assert.deepEqual(typeof AmqpLibMock.stubs.consume.args[0][1], 'function')
          assert.deepEqual(AmqpLibMock.stubs.consume.args[0][1].length, 1)
          assert.deepEqual(AmqpLibMock.stubs.consume.args[0][2], eventHandlerMock1.Instance.settings.consume)

          assert.deepEqual(AmqpLibMock.stubs.consume.args[1][0], assertQueueReturnValue.queue)
          assert.deepEqual(typeof AmqpLibMock.stubs.consume.args[1][1], 'function')
          assert.deepEqual(AmqpLibMock.stubs.consume.args[1][1].length, 1)
          assert.deepEqual(AmqpLibMock.stubs.consume.args[1][2], eventHandlerMock2.Instance.settings.consume)
        })

        test('server acknowledge message when EventHandler returns true', async () => {
          const queue = ((await queueHandler.setup()) as unknown) as QueueHandlerSetupEnabled<ApiStartSettings>
          const Deps = ({} as unknown) as InternalSystem<ApiStartSettings>

          const eventHandlerMock1 = EventHandlerMock
          const eventHandler1 = eventHandlerMock1.Instance as any
          eventHandler1.exchange = config.services.queue.exchanges[0].name
          eventHandlerMock1.stubs.handler.returns(true)

          const server = queue.server(Deps)
          await server([eventHandler1])

          assert.equal(eventHandlerMock1.stubs.handler.callCount, 0)
          assert.equal(AmqpLibMock.stubs.ack.callCount, 0)
          assert.equal(AmqpLibMock.stubs.nack.callCount, 0)

          const handler = AmqpLibMock.stubs.consume.args[0][1]
          const msg = faker.random.alphaNumeric(21)
          await handler(msg)

          assert.equal(eventHandlerMock1.stubs.handler.callCount, 1)
          assert.equal(AmqpLibMock.stubs.ack.callCount, 1)
          assert.equal(AmqpLibMock.stubs.nack.callCount, 0)
        })

        test('server does not acknowledge message when EventHandler returns false', async () => {
          const queue = ((await queueHandler.setup()) as unknown) as QueueHandlerSetupEnabled<ApiStartSettings>
          const Deps = ({} as unknown) as InternalSystem<ApiStartSettings>

          const eventHandlerMock1 = EventHandlerMock
          const eventHandler1 = eventHandlerMock1.Instance as any
          eventHandler1.exchange = config.services.queue.exchanges[0].name
          eventHandlerMock1.stubs.handler.returns(false)

          const server = queue.server(Deps)
          await server([eventHandler1])

          assert.equal(eventHandlerMock1.stubs.handler.callCount, 0)
          assert.equal(AmqpLibMock.stubs.ack.callCount, 0)
          assert.equal(AmqpLibMock.stubs.nack.callCount, 0)

          const handler = AmqpLibMock.stubs.consume.args[0][1]
          const msg = faker.random.alphaNumeric(21)
          await handler(msg)

          assert.equal(eventHandlerMock1.stubs.handler.callCount, 1)
          assert.equal(AmqpLibMock.stubs.ack.callCount, 0)
          assert.equal(AmqpLibMock.stubs.nack.callCount, 1)
        })

        test('server calls EventHandler correctly', async () => {
          const queue = ((await queueHandler.setup()) as unknown) as QueueHandlerSetupEnabled<ApiStartSettings>
          const Deps = ({
            sysDeps: faker.random.alphaNumeric(16),
          } as unknown) as InternalSystem<ApiStartSettings>

          const dependencies = {
            handlerDeps: faker.random.alphaNumeric(16),
          }

          const eventHandlerMock1 = EventHandlerMock
          const eventHandler1 = eventHandlerMock1.Instance as any
          eventHandler1.exchange = config.services.queue.exchanges[0].name
          eventHandlerMock1.stubs.handler.returns(false)
          eventHandlerMock1.stubs.dependencies.returns(dependencies)

          const server = queue.server(Deps)
          await server([eventHandler1])

          const handler = AmqpLibMock.stubs.consume.args[0][1]

          const msg = faker.random.alphaNumeric(21)
          await handler(msg)

          assert.equal(eventHandlerMock1.stubs.handler.callCount, 1)
          assert.equal(eventHandlerMock1.stubs.handler.args[0][0].length, 2)
          assert.deepEqual(eventHandlerMock1.stubs.handler.args[0][0][0], {
            ...Deps,
            Dependencies: dependencies,
          })
          assert.deepEqual(eventHandlerMock1.stubs.handler.args[0][0][1], msg)
        })

        test('server does not acknowledge message when EventHandler throws Error (if msg is not null)', async () => {
          const queue = ((await queueHandler.setup()) as unknown) as QueueHandlerSetupEnabled<ApiStartSettings>
          const Deps = ({} as unknown) as InternalSystem<ApiStartSettings>

          const eventHandlerMock1 = EventHandlerMock
          const eventHandler1 = eventHandlerMock1.Instance as any
          eventHandler1.exchange = config.services.queue.exchanges[0].name

          const server = queue.server(Deps)
          await server([eventHandler1])

          assert.equal(eventHandlerMock1.stubs.handler.callCount, 0)
          assert.equal(AmqpLibMock.stubs.ack.callCount, 0)
          assert.equal(AmqpLibMock.stubs.nack.callCount, 0)

          const handler = AmqpLibMock.stubs.consume.args[0][1]
          const msg = faker.random.alphaNumeric(21)
          await handler(msg)

          assert.equal(eventHandlerMock1.stubs.handler.callCount, 1)
          assert.equal(AmqpLibMock.stubs.ack.callCount, 0)
          assert.equal(AmqpLibMock.stubs.nack.callCount, 1)
        })

        test('server does Log Error as Critical when EventHandler throws Error', async () => {
          const queue = ((await queueHandler.setup()) as unknown) as QueueHandlerSetupEnabled<ApiStartSettings>
          const Deps = ({
            Log: loghandlerMock.Instance,
          } as unknown) as InternalSystem<ApiStartSettings>

          const eventHandlerMock1 = EventHandlerMock
          const eventHandler1 = eventHandlerMock1.Instance as any
          eventHandler1.exchange = config.services.queue.exchanges[0].name
          const error = new Error(faker.random.words(10))
          eventHandlerMock1.stubs.handler.throws(error)

          const server = queue.server(Deps)
          await server([eventHandler1])

          assert.equal(loghandlerMock.stubs.alert.callCount, 0)
          assert.equal(loghandlerMock.stubs.crit.callCount, 0)
          assert.equal(loghandlerMock.stubs.debug.callCount, 0)
          assert.equal(loghandlerMock.stubs.emerg.callCount, 0)
          assert.equal(loghandlerMock.stubs.err.callCount, 0)
          assert.equal(loghandlerMock.stubs.info.callCount, 0)
          assert.equal(loghandlerMock.stubs.notice.callCount, 0)
          assert.equal(loghandlerMock.stubs.warn.callCount, 0)

          const handler = AmqpLibMock.stubs.consume.args[0][1]
          const msg = faker.random.alphaNumeric(21)
          await handler(msg)

          assert.equal(loghandlerMock.stubs.alert.callCount, 0)
          assert.equal(loghandlerMock.stubs.crit.callCount, 1)
          assert.deepEqual(loghandlerMock.stubs.crit.args[0], [error, {msg}])
          assert.equal(loghandlerMock.stubs.debug.callCount, 0)
          assert.equal(loghandlerMock.stubs.emerg.callCount, 0)
          assert.equal(loghandlerMock.stubs.err.callCount, 0)
          assert.equal(loghandlerMock.stubs.info.callCount, 0)
          assert.equal(loghandlerMock.stubs.notice.callCount, 0)
          assert.equal(loghandlerMock.stubs.warn.callCount, 0)
        })

        test('EventHandler can have a dependency object that gets available in handler', async () => {
          const queue = ((await queueHandler.setup()) as unknown) as QueueHandlerSetupEnabled<ApiStartSettings>
          const Deps = ({
            test: faker.random.alphaNumeric(31),
          } as unknown) as InternalSystem<ApiStartSettings>

          const eventHandlerMock1 = EventHandlerMock
          const eventHandler1 = eventHandlerMock1.Instance as any
          eventHandler1.exchange = config.services.queue.exchanges[0].name
          eventHandler1.dependencies = {
            test2: faker.random.alphaNumeric(31),
          }

          assert.equal(eventHandlerMock1.stubs.dependencies.callCount, 0)

          const server = queue.server(Deps)
          await server([eventHandler1])

          const handler = AmqpLibMock.stubs.consume.args[0][1]

          const msg = faker.random.alphaNumeric(21)
          await handler(msg)

          assert.equal(eventHandlerMock1.stubs.dependencies.callCount, 0)
          assert.equal(eventHandlerMock1.stubs.handler.callCount, 1)
          assert.equal(eventHandlerMock1.stubs.handler.args[0][0].length, 2)
          assert.deepEqual(eventHandlerMock1.stubs.handler.args[0][0][0], {
            ...Deps,
            Dependencies: eventHandler1.dependencies,
          })
          assert.deepEqual(eventHandlerMock1.stubs.handler.args[0][0][1], msg)
        })

        test('Eventhandler can have undefined queue name', async () => {
          const queue = ((await queueHandler.setup()) as unknown) as QueueHandlerSetupEnabled<ApiStartSettings>
          const Deps = ({
            test: faker.random.alphaNumeric(31),
          } as unknown) as InternalSystem<ApiStartSettings>

          const eventHandlerMock1 = EventHandlerMock
          const eventHandler1 = eventHandlerMock1.Instance as any
          eventHandler1.exchange = config.services.queue.exchanges[0].name
          delete eventHandler1.settings.queue.name

          const eventHandlerMock2 = EventHandlerMock
          const eventHandler2 = eventHandlerMock2.Instance as any
          eventHandler2.exchange = config.services.queue.exchanges[0].name
          eventHandler2.settings.queue.name = faker.random.alphaNumeric(8)

          const server = queue.server(Deps)
          await server([eventHandler1, eventHandler2])

          assert.equal(AmqpLibMock.stubs.assertQueue.args[0][0], eventHandler1.settings.queue.name)
          assert.equal(AmqpLibMock.stubs.assertQueue.args[1][0], eventHandler2.settings.queue.name)
        })

        test('Server returns with True when Queue Server works correctly', async () => {
          const queue = ((await queueHandler.setup()) as unknown) as QueueHandlerSetupEnabled<ApiStartSettings>
          const Deps = ({} as unknown) as InternalSystem<ApiStartSettings>

          const eventHandlerMock1 = EventHandlerMock
          const eventHandler = eventHandlerMock1.Instance as any
          eventHandler.exchange = config.services.queue.exchanges[0].name

          const server = await queue.server(Deps)
          assert.isTrue(await server([eventHandler]))
        })

        test('Server returns with False and Logs Critical Error when Queue Server does not work correctly', async () => {
          const queue = ((await queueHandler.setup()) as unknown) as QueueHandlerSetupEnabled<ApiStartSettings>
          const Deps = ({} as unknown) as InternalSystem<ApiStartSettings>

          const eventHandlerMock1 = EventHandlerMock
          const eventHandler = eventHandlerMock1.Instance as any
          eventHandler.exchange = config.services.queue.exchanges[0].name

          const error = new Error(faker.lorem.sentence())
          AmqpLibMock.stubs.assertQueue.throws(error)

          assert.equal(loghandlerMock.stubs.alert.callCount, 0)
          assert.equal(loghandlerMock.stubs.crit.callCount, 0)
          assert.equal(loghandlerMock.stubs.debug.callCount, 0)
          assert.equal(loghandlerMock.stubs.emerg.callCount, 0)
          assert.equal(loghandlerMock.stubs.err.callCount, 0)
          assert.equal(loghandlerMock.stubs.info.callCount, 0)
          assert.equal(loghandlerMock.stubs.notice.callCount, 0)
          assert.equal(loghandlerMock.stubs.warn.callCount, 0)

          const server = await queue.server(Deps)
          assert.isFalse(await server([eventHandler]))

          assert.equal(loghandlerMock.stubs.alert.callCount, 0)
          assert.equal(loghandlerMock.stubs.crit.callCount, 1)
          assert.deepEqual(loghandlerMock.stubs.crit.args[0], [error])
          assert.equal(loghandlerMock.stubs.debug.callCount, 0)
          assert.equal(loghandlerMock.stubs.emerg.callCount, 0)
          assert.equal(loghandlerMock.stubs.err.callCount, 0)
          assert.equal(loghandlerMock.stubs.info.callCount, 0)
          assert.equal(loghandlerMock.stubs.notice.callCount, 0)
          assert.equal(loghandlerMock.stubs.warn.callCount, 0)
        })
      })
    })
  })
})
