import {Log} from 'loghandler'
import * as amqp from 'amqplib'
import {EnabledService} from '../../systemInterfaces/services'
import {ServiceConfigurator} from '../../systemInterfaces/serviceConfigurator'
import {Config} from '../../systemInterfaces/config'
import {Models} from '../database/interfaces/model'
import {Dependencies as systemDependencies, CustomDependencies} from '../../systemInterfaces/dependencies'

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

export type QueueEventListenerHandler<
  TServiceConfigurator extends ServiceConfigurator,
  TDependencies extends CustomDependencies,
  TConfig extends Config,
  TModels extends Models
> = (
  sysDeps: systemDependencies<TDependencies, TServiceConfigurator, TConfig, TModels>,
  msg: amqp.ConsumeMessage,
) => Promise<boolean>

export interface QueueEventListenerSettings {
  readonly consume: amqp.Options.Consume
  readonly queue: QueueSettingsOptions
}
export interface QueueSettingsOptions extends amqp.Options.AssertQueue {
  readonly name?: string
}

export interface QueueEventListener<
  TServiceConfigurator extends ServiceConfigurator,
  TDependencies extends CustomDependencies,
  TConfig extends Config,
  TModels extends Models
> {
  readonly dependencies?: systemDependencies<TDependencies, TServiceConfigurator, TConfig, TModels> | TDependencies
  readonly exchange: TServiceConfigurator['queue'] extends QueueService
    ? TServiceConfigurator['queue']['exchanges']
    : string
  readonly handler: QueueEventListenerHandler<TServiceConfigurator, TDependencies, TConfig, TModels>
  readonly routingKey: string
  readonly settings: QueueEventListenerSettings
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type QueueEventListenerList = QueueEventListener<any, any, any, any>[]

export interface QueueClient<TExchangeName extends string = string> {
  readonly publish: (
    exchangeName: TExchangeName,
    routingKey: string,
    // tslint:disable-next-line: no-any
    data: {},
    options?: amqp.Options.Publish,
  ) => void
}
