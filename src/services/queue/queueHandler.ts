import * as Amqp from 'amqplib'
import LogHandler from 'loghandler'
import * as Process from 'process'
import {
  Dependencies,
  ServiceConfiguratorQueueEnabled,
  QueueEventListenerList,
  QueueConfig,
  QueueExchangeSettings,
} from './interfaces'
import {Config} from '../../systemInterfaces/config'
import {InternalSystem} from '../../systemInterfaces/internalSystem'
import {Models} from '../database/interfaces/model'
import {ServiceConfigurator} from '../../systemInterfaces/serviceConfigurator'
import {Dependencies as TDependencies} from '../../systemInterfaces/dependencies'

export class QueueHandler {
  private deps: Dependencies

  private config: Config

  public constructor(deps: Dependencies, config: Config) {
    this.deps = deps
    this.config = config
  }

  public static factory(config: Config) {
    return new this(
      {
        Amqp,
        Log: LogHandler(config.log),
        Process,
      },
      config,
    )
  }

  public async setup() {
    if (this.queueEnabled(this.config)) {
      const settings: QueueConfig = this.config.services.queue
      const connection = await this.setupConnection(settings)

      return {
        client: () => ({
          publish: async (
            exchangeName: string,
            routingKey: string,
            data: {} | [] | boolean | number | string,
            options?: Amqp.Options.Publish,
          ) => {
            this.PublishMessage(this.deps, settings, connection, exchangeName, routingKey, data, options)
              .then()
              .catch((err: Error) => {
                this.deps.Log.err(err)
              })
          },
        }),
        server: <
          TServiceConfigurator extends ServiceConfigurator = ServiceConfigurator,
          TConfig extends Config<TServiceConfigurator> = Config<TServiceConfigurator>,
          TModels extends Models = Models
        >(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          sysDeps: InternalSystem<TServiceConfigurator, TConfig, TModels>,
        ) => async (
          listeners: QueueEventListenerList,
          callback?: (sysDeps: InternalSystem<TServiceConfigurator, TConfig, TModels>) => void,
        ) => {
          if (this.verifyQueueEventListeners(listeners)) {
            try {
              await this.startServer<TConfig, TModels, TServiceConfigurator>(
                this.deps,
                sysDeps,
                settings,
                connection,
                listeners,
              )
              if (callback) {
                callback(sysDeps)
              }
              return true
            } catch (err) {
              this.deps.Log.crit(err)
            }
          }

          return false
        },
      }
    }

    return {
      server: () => {
        return async () => {
          throw new Error('Queue server listener is started while service is disabled in configuration.')
        }
      },
    }
  }

  private queueEnabled(config: Config): config is Config<ServiceConfiguratorQueueEnabled> {
    return config.services.queue.enabled === true
  }

  private getExchangeOptions(exchange: QueueExchangeSettings<string>): Amqp.Options.AssertExchange {
    if (exchange.options) {
      return !('durable' in exchange.options)
        ? {
            ...exchange.options,
            durable: true,
          }
        : exchange.options
    } else {
      return {durable: true}
    }
  }

  private getExchangeType(exchange: QueueExchangeSettings<string>) {
    return exchange.type === 'default' ? '' : exchange.type
  }

  private async setupConnection(settings: QueueConfig) {
    if (settings.exchanges.length > 0) {
      const connection = await this.deps.Amqp.connect(settings)
      const channel = await connection.createChannel()
      for (const exchangeSettings of settings.exchanges) {
        await channel.assertExchange(
          exchangeSettings.name,
          this.getExchangeType(exchangeSettings),
          this.getExchangeOptions(exchangeSettings),
        )
      }
      return channel
    } else {
      throw new Error(
        "Couldn't establish connection with amqp service, because none exchanges are configurated in config file.",
      )
    }
  }

  private async PublishMessage(
    deps: Dependencies,
    settings: QueueConfig,
    channel: Amqp.Channel,
    exchangeName: string,
    routingKey: string,
    data: {},
    options?: Amqp.Options.Publish,
  ) {
    const exchange = settings.exchanges.reduce((acc, cur) =>
      cur.name === exchangeName && acc.name !== exchangeName ? cur : acc,
    )

    if (exchange.name === exchangeName) {
      const exchangeOptions = this.getExchangeOptions(exchange)

      let msgOptions: Amqp.Options.Publish
      if (options) {
        msgOptions = !('persistent' in options)
          ? {
              ...options,
              persistent: true,
            }
          : options
      } else {
        msgOptions = {
          persistent: true,
        }
      }

      await channel.assertExchange(exchange.name, this.getExchangeType(exchange), exchangeOptions)

      channel.publish(exchange.name, routingKey, Buffer.from(JSON.stringify(data), 'utf-8'), msgOptions)
      deps.Log.info(`Added new event with routingkey "${routingKey}" to "${exchange.name}" exchange.`, {
        data,
        exchangeName,
        options,
        routingKey,
      })
    } else {
      throw new Error(
        `Couldn't publish message, because exchange Name ${exchangeName} isn't configured in config file.`,
      )
    }
  }

  private async startServer<
    TConfig extends Config,
    TModels extends Models,
    TServiceConfigurator extends ServiceConfigurator = ServiceConfigurator
  >(
    deps: Dependencies,
    sysDeps: InternalSystem<TServiceConfigurator, TConfig, TModels>,
    settings: QueueConfig,
    connection: Amqp.Channel,
    eventListeners: QueueEventListenerList,
  ) {
    for (const exchangeSettings of settings.exchanges) {
      const listeners = eventListeners.filter(listener => listener.exchange === exchangeSettings.name)
      for (const listener of listeners) {
        const queue = await connection.assertQueue(listener.settings.queue.name || '', listener.settings.queue)
        await connection.bindQueue(queue.queue, exchangeSettings.name, listener.routingKey)

        let dependencies = {}
        if (listener.dependencies) {
          dependencies =
            typeof listener.dependencies === 'function' ? listener.dependencies(sysDeps) : listener.dependencies
        }

        connection.consume(
          queue.queue,
          async msg => {
            try {
              if (msg !== null) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const insertedDependencies: TDependencies<any, TServiceConfigurator, TConfig, TModels> = {
                  ...sysDeps,
                  Dependencies: dependencies,
                }
                const handler = await listener.handler(insertedDependencies, msg)
                if (handler) {
                  connection.ack(msg)
                } else {
                  connection.nack(msg)
                }
              }
            } catch (err) {
              deps.Log.crit(err, {msg})
              const message = msg as Amqp.ConsumeMessage
              connection.nack(message)
            }
          },
          listener.settings.consume,
        )
      }
    }
  }

  private verifyQueueEventListeners(listeners: QueueEventListenerList) {
    const config: Config<ServiceConfiguratorQueueEnabled> = this.config
    const exchangesNames = config.services.queue.exchanges.filter(exchange => exchange.name)

    for (const listener of listeners) {
      if (!exchangesNames.map(exchange => exchange.name).includes(listener.exchange)) {
        throw new Error(
          `Queue server is stopped because it found an eventHandler that uses the "${listener.exchange}" exchange, while this exchange isn't configured.`,
        )
      }
    }

    return true
  }
}

export default QueueHandler
