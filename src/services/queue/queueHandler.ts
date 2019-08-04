import * as Amqp from 'amqplib'
import LogHandler from 'loghandler'
import * as Process from 'process'
import {Dependencies, ServiceConfiguratorQueueEnabled} from './interfaces'
import {Config} from '../../systemInterfaces/config'

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
      return {
        client: () => {},
        server: <
          TConfig extends Config,
          TModels extends Models,
          TServiceConfigurator extends ServiceConfigurator = ServiceConfigurator
        >(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          sysDeps: InternalSystem<any, any, any>,
        ) => {
          sysDeps
        },
      }
    }
    return {
      server: () => {
        throw new Error('Queue server listener is started while service is disabled in configuration.')
      },
    }
  }

  private queueEnabled(config: Config): config is Config<ServiceConfiguratorQueueEnabled> {
    return config.services.queue.enabled
  }
}

export default QueueHandler
