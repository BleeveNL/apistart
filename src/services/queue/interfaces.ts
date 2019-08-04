import {Log} from 'loghandler'
import * as amqp from 'amqplib'
import {EnabledService} from '../../systemInterfaces/services'
import {ServiceConfigurator} from '../../systemInterfaces/serviceConfigurator'

export interface Dependencies {
  readonly Amqp: typeof amqp
  readonly Log: Log
  readonly Process: typeof process
}

export interface QueueService {
  readonly enabled: true
  readonly exchanges: string
}

export interface QueueExchangeSettings<TExchangeNames extends string = string> {
  readonly name: '' | TExchangeNames
  readonly options?: amqp.Options.AssertExchange
  readonly type: 'default' | 'direct' | 'fanout' | 'header' | 'topic'
}

export interface QueueConfig<ExchangeNames extends string = string> extends EnabledService, amqp.Options.Connect {
  readonly exchanges: QueueExchangeSettings<ExchangeNames>[]
}

export interface ServiceConfiguratorQueueEnabled extends ServiceConfigurator {
  queue: QueueService
}
