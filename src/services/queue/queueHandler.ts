import * as Amqp from 'amqplib'
import LogHandler from 'loghandler'
import * as Process from 'process'
import {
  Dependencies,
  ServiceConfiguratorQueueEnabled,
  QueueEventListenerList,
  QueueConfig,
  QueueExchangeSettings,
  QueueHandlerSetup,
} from './interfaces'
import {Config} from '../../systemInterfaces/config'
import {InternalSystem} from '../../systemInterfaces/internalSystem'
import {Dependencies as TDependencies, Dependencies as SystemDependencies} from '../../systemInterfaces/dependencies'
import {ApiStartSettings} from '../../systemInterfaces/apiStartSettings'

export class QueueHandler<TSettings extends ApiStartSettings> {
  private deps: Dependencies

  private config: Config<TSettings>

  public constructor(deps: Dependencies, config: Config<TSettings>) {
    this.deps = deps
    this.config = config
  }

  public static factory<TSettings extends ApiStartSettings>(config: Config<TSettings>): QueueHandler<TSettings> {
    return new this<TSettings>(
      {
        Amqp,
        Log: LogHandler(config.log),
        Process,
      },
      config,
    )
  }

  public async setup<TSettings extends ApiStartSettings>(): Promise<QueueHandlerSetup<TSettings>> {
    if (this.queueEnabled(this.config)) {
      const settings: QueueConfig = this.config.services.queue
      const connection = await this.setupConnection(settings)

      return {
        client: {
          publish: async (
            exchangeName: string,
            routingKey: string,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            data: Record<number | string | symbol, any> | any[] | boolean | number | string,
            options?: Amqp.Options.Publish,
          ) => {
            this.PublishMessage(this.deps, settings, connection, exchangeName, routingKey, data, options)
              .then()
              .catch((err: Error) => {
                this.deps.Log.err(err)
              })
          },
        },
        server:
          <TSettings extends ApiStartSettings>(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            sysDeps: InternalSystem<TSettings>,
          ) =>
          async (listeners: QueueEventListenerList, callback?: (sysDeps: InternalSystem<TSettings>) => void) => {
            if (this.verifyQueueEventListeners(listeners)) {
              try {
                await this.startServer<TSettings>(this.deps, sysDeps, settings, connection, listeners)
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
      } as unknown as QueueHandlerSetup<TSettings>
    }

    return {
      server: () => {
        return () => {
          throw new Error('Queue server listener is started while service is disabled in configuration.')
        }
      },
    } as QueueHandlerSetup<TSettings>
  }

  private queueEnabled(config: Config): config is Config<ApiStartSettings<ServiceConfiguratorQueueEnabled>> {
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
        "Couldn't establish connection with amqp service, because none exchanges are configured in config file.",
      )
    }
  }

  private async PublishMessage(
    deps: Dependencies,
    settings: QueueConfig,
    channel: Amqp.Channel,
    exchangeName: string,
    routingKey: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: Record<number | string | symbol, any> | any[] | boolean | number | string,
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
      deps.Log.info(`Added new event with routing key "${routingKey}" to "${exchange.name}" exchange.`, {
        data,
        exchangeName,
        options,
        routingKey,
      })
    } else {
      this.deps.Log.err(
        new Error(`Couldn't publish message, because exchange Name ${exchangeName} isn't configured in config file.`),
      )
    }
  }

  private async startServer<TSettings extends ApiStartSettings>(
    deps: Dependencies,
    sysDeps: InternalSystem<TSettings>,
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
            typeof listener.dependencies === 'function'
              ? listener.dependencies(sysDeps as SystemDependencies<TSettings>)
              : listener.dependencies
        }

        connection.consume(
          queue.queue,
          async msg => {
            try {
              if (msg !== null) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const insertedDependencies: TDependencies<TSettings> = {
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
    const config = this.config as Config<ApiStartSettings<ServiceConfiguratorQueueEnabled>>
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
