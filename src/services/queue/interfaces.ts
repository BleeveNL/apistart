import {Log} from 'loghandler'
import * as amqp from 'amqplib'
import {EnabledService} from '../../systemInterfaces/services'
import {Dependencies as systemDependencies, DependencyFunction} from '../../systemInterfaces/dependencies'
import {InternalSystem} from '../../systemInterfaces/internalSystem'
import {ApiStartSettings} from '../../systemInterfaces/apiStartSettings'
import {ServiceConfigurator} from '../../systemInterfaces/serviceConfigurator'
import {UserDefinedObject} from '../../systemInterfaces/userDefinedObject'

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type QueueEventListenerHandler<
  TSettings extends ApiStartSettings<any> = ApiStartSettings<any>,
  TDependencies extends UserDefinedObject = UserDefinedObject
> = (sysDeps: systemDependencies<TSettings, TDependencies>, msg: amqp.ConsumeMessage) => Promise<boolean>

export interface QueueSettingsOptions extends amqp.Options.AssertQueue {
  readonly name?: string
}
export interface QueueEventListenerSettings {
  readonly consume: amqp.Options.Consume
  readonly queue: QueueSettingsOptions
}

export interface QueueEventListener<
  TSettings extends ApiStartSettings<any> = ApiStartSettings<any>,
  TDependencies extends UserDefinedObject = UserDefinedObject
> {
  readonly dependencies?: DependencyFunction<TSettings, TDependencies> | TDependencies
  readonly exchange: TSettings['ServiceConfigurator']['queue'] extends QueueService
    ? TSettings['ServiceConfigurator']['queue']['exchanges']
    : string
  readonly handler: QueueEventListenerHandler<TSettings, TDependencies>
  readonly routingKey: string
  readonly settings: QueueEventListenerSettings
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type QueueEventListenerList<
  TSettings extends ApiStartSettings<any> = ApiStartSettings<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TDependencies extends UserDefinedObject = Record<string | number | symbol, any>
> = QueueEventListener<TSettings, TDependencies>[]

export interface QueueClient<TExchangeName extends string = string> {
  readonly publish: (
    exchangeName: TExchangeName,
    routingKey: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: Record<number | string | symbol, any> | any[] | boolean | number | string,
    options?: amqp.Options.Publish,
  ) => void
}

export interface QueueHandlerSetupDisabled {
  client: undefined
  server: () => never
}

export interface QueueHandlerSetupEnabled<TSettings extends ApiStartSettings> {
  client: QueueClient
  server: (
    sysDeps: InternalSystem<TSettings>,
  ) => (listeners: QueueEventListenerList, callback?: (sysDeps: InternalSystem<TSettings>) => void) => Promise<boolean>
}

export type QueueHandlerSetup<
  TSettings extends ApiStartSettings
> = TSettings['ServiceConfigurator']['queue'] extends QueueService
  ? QueueHandlerSetupEnabled<TSettings>
  : QueueHandlerSetupDisabled
