/* eslint-disable @typescript-eslint/no-explicit-any */
import {assert} from 'chai'
import * as faker from 'faker'
import * as _ from 'lodash'
import {Log} from 'loghandler'
import * as process from 'process'
import * as amqp from 'amqplib'
import immer from 'immer'
import configMocked from '../../mocks/config.mock'
import DefaultExport, {QueueHandler} from '../../../services/queue/queueHandler'
import * as AmqpLibMock from '../../mocks/nodeModules/amqp.mock'
import * as eventHandlerMock from './mocks/eventHandler.mock'
import * as loghandlerMock from '../../mocks/nodeModules/logHandler.mock'
import * as joi from '@hapi/joi'
import queueDisabledSchema from './validationSchemas/queueDisabled.schema'
import queueEnabledSchema from './validationSchemas/queueEnabled.schema'
import { Config } from '../../../systemInterfaces/config'
import queueEnabledClientSchema from './validationSchemas/queueEnabledClient.schema'
import { QueueClient } from '../../../services/queue/interfaces'
import { InternalSystem } from '../../../systemInterfaces/internalSystem'
import { Models } from '../../../services/database/interfaces/model'
import { ServiceConfigurator } from '../../../systemInterfaces/serviceConfigurator'



suite('Test QueueHandler (./services/queue/queueHandler.ts)', () => {
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

      suite('test of connection with rabbitMQ is made correctly', () => {
      
        test('system throws error when no exchanges are setted up.', async () => {
          const config = immer(_.cloneDeep(correctConfig), (draft: any) => {
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
  
          try{
            await queueHandler.setup()
            assert.fail("Shouldn't come here")
          }catch(err){
            const expectedError = new Error("Couldn't establish connection with amqp service, because none exchanges are configurated in config file.")
            assert.strictEqual(expectedError.message, err.message)
          }
        })
  
        test("Connect function of AMQPlib is only called once and correct", async () => {
          let config: Config<{queue: {enabled: true, exchanges: any}, cache: false, db: false}> = immer(_.cloneDeep(correctConfig), (draft: any) => {
            draft.services.queue.enabled = true
            draft.services.queue.exchanges = []
          })
          
          const MaximalEcxhanges = Math.round(Math.random()*5) + 2
          for(let i = 0; i < MaximalEcxhanges; i++){
            const exchangeItem = {
              name: faker.random.alphaNumeric(8),
              options : {
                durable: Boolean(Math.round(Math.random())),
                internal: Boolean(Math.round(Math.random())),
                autoDelete: Boolean(Math.round(Math.random())),
                alternateExchange: faker.random.alphaNumeric(12),
                arguments: faker.random.arrayElement(),
              },
              type: 'default'
            }
  
  
            config =  immer(config, (draft: any) => {
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
          let config: Config<{queue: {enabled: true, exchanges: any}, cache: false, db: false}> = immer(_.cloneDeep(correctConfig), (draft: any) => {
            draft.services.queue.enabled = true
            draft.services.queue.exchanges = []
          })
          
          const MaximalEcxhanges = Math.round(Math.random()*5) + 2
          for(let i = 0; i < MaximalEcxhanges; i++){
            const exchangeItem = {
              name: faker.random.alphaNumeric(8),
              options : {
                durable: Boolean(Math.round(Math.random())),
                internal: Boolean(Math.round(Math.random())),
                autoDelete: Boolean(Math.round(Math.random())),
                alternateExchange: faker.random.alphaNumeric(12),
                arguments: faker.random.arrayElement(),
              },
              type: 'default'
            }
  
  
            config =  immer(config, (draft: any) => {
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
          let config: Config<{queue: {enabled: true, exchanges: any}, cache: false, db: false}> = immer(_.cloneDeep(correctConfig), (draft: any) => {
            draft.services.queue.enabled = true
            draft.services.queue.exchanges = []
          })
          
          const MaximalEcxhanges = Math.round(Math.random()*5) + 2
          const selectType = Math.round(Math.random())
          for(let i = 0; i < MaximalEcxhanges; i++){
            const exchangeItem = {
              name: faker.random.alphaNumeric(8),
              options : {
                durable: Boolean(Math.round(Math.random())),
                internal: Boolean(Math.round(Math.random())),
                autoDelete: Boolean(Math.round(Math.random())),
                alternateExchange: faker.random.alphaNumeric(12),
                arguments: faker.random.arrayElement(),
              },
              type: faker.random.alphaNumeric(8)
            }
  
  
            config =  immer(config, (draft: any) => {
              draft.services.queue.exchanges.push(exchangeItem)
            })
          }
  
          config =  immer(config, (draft: any) => {
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
            
          for(let i=0; i < AmqpLibMock.stubs.assertExchange.args.length; i++){
            const args = AmqpLibMock.stubs.assertExchange.args[i]
            const exchange = config.services.queue.exchanges[i]
  
  
            assert.equal(args.length, 3)
            assert.equal(args[0], exchange.name),
            assert.equal(args[1], exchange.type === 'default' ? '': exchange.type)
            assert.deepEqual(args[2], exchange.options)
          }
  
        })
  
        test('Make sure that durability setting is true when no preference is given', async () => {
          let config: Config<{queue: {enabled: true, exchanges: any}, cache: false, db: false}> = immer(_.cloneDeep(correctConfig), (draft: any) => {
            draft.services.queue.enabled = true
            draft.services.queue.exchanges = [
              {
                name: faker.random.alphaNumeric(8)
              },
              {
                name: faker.random.alphaNumeric(8),
                options: {
                  durable: false,
                }
              },
              {
                name: faker.random.alphaNumeric(8),
                options: {
                  durable: true,
                }
              },
              {
                name: faker.random.alphaNumeric(8),
                options: {
                  internal: Boolean(Math.round(Math.random())),
                }
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
        const queue = await queueHandler.setup()

        joi.assert(queue, queueEnabledSchema)
      })

      suite('test client functionality', () => {

        test('client is a function that doesn\'t allow any arguments', async () => {
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
          let config: Config<{queue: {enabled: true, exchanges: any}, cache: false, db: false}>
          let queueHandler: QueueHandler
          let client: QueueClient<any>


          setup(async () => {
            config = immer(_.cloneDeep(correctConfig), (draft: any) => {
              draft.services.queue.enabled = true
              draft.services.queue.exchanges = [
                {
                  name: faker.random.alphaNumeric(8)
                },
                {
                  name: faker.random.alphaNumeric(8)
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
            const connection = await queueHandler.setup()
            if(connection.client !== undefined){
              client = connection.client() 
            }else{
              assert.fail('Setup() failed because client() wasn\'t  part of returned object of setup() of QueueHandler.')
            }
          })

          test('publish() reports an error when given exchange isn\'t configured in config', async () => {
            const exchangeName = faker.random.alphaNumeric(16)

            await client.publish(
              exchangeName,
              faker.random.alphaNumeric(8),
              {}
            )

            assert.equal(loghandlerMock.stubs.err.calledOnce, true)
            assert.equal(loghandlerMock.stubs.err.args[0][0].name, 'Error')
            assert.equal(loghandlerMock.stubs.err.args[0][0].message,  `Couldn't publish message, because exchange Name ${exchangeName} isn't configured in config file.`)
          })

          test('Message is correctly published to Exchange', async () => {
            const exchange = config.services.queue.exchanges[0]
            const msg = {
              routingKey: faker.random.alphaNumeric(8),
              data: faker.random.alphaNumeric(8),
              options: {persistent: true, test: faker.random.alphaNumeric(8)}
            }


            await client.publish(
              exchange.name,
              msg.routingKey,
              msg.data,
              msg.options
            )

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

          test("Message is by default set as persistent", async () => {
            const exchange = config.services.queue.exchanges[0]
            const msgs = [{
              routingKey: faker.random.alphaNumeric(8),
              data: faker.random.alphaNumeric(8),
              options: {persistent: false, test: faker.random.alphaNumeric(8)},
              persist: false
            },
            {
              routingKey: faker.random.alphaNumeric(8),
              data: faker.random.alphaNumeric(8),
              options: {test: faker.random.alphaNumeric(8)},
              persist: true
            },
            {
              routingKey: faker.random.alphaNumeric(8),
              data: faker.random.alphaNumeric(8),
              options: undefined,
              persist: true
            }]

            for(const msg of msgs){
              await client.publish(
                exchange.name,
                msg.routingKey,
                msg.data,
                msg.options
              )
            }

            assert.equal(AmqpLibMock.stubs.publish.callCount, 3)

            for(let i = 0; i < AmqpLibMock.stubs.publish.getCalls().length; i++){
              const call = AmqpLibMock.stubs.publish.getCalls()[i]
              const options = call.args[3]

              assert.isTrue( ('persistent' in options && options.persistent === msgs[i].persist) )
            }
           

          })

          test('Message is correctly published to Exchange when message is send to a second exchange', async () => {
            const exchange = config.services.queue.exchanges[1]
            const msg = {
              routingKey: faker.random.alphaNumeric(8),
              data: faker.random.alphaNumeric(8),
              options: {persistent: true, test: faker.random.alphaNumeric(8)}
            }


            await client.publish(
              exchange.name,
              msg.routingKey,
              msg.data,
              msg.options
            )

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
        test('Server is a function that required one arguments', async () => {
          const queue: any = await queueHandler.setup()

          assert.isFunction(queue.server)
          assert.equal(queue.server.length, 1)
        })
        
        test('Server function returns a function that allows 2 argument', async () => {
          const queue = await queueHandler.setup()
          const Deps = {} as unknown as InternalSystem<Config, Models, ServiceConfigurator>

          const server = queue.server(Deps)
          assert.isFunction(server)
          assert.equal(server.length, 2)

        })
         
        test('Server got killed with an error as EventListener uses an unknown exchange', () => {
          const queue = await queueHandler.setup()
          const Deps = {} as unknown as InternalSystem<Config, Models, ServiceConfigurator>

          const server = queue.server(Deps)

        })
        
      })

      

    })

    
  })
})
