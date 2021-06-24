import {ApiStartSettings} from '../../../systemInterfaces/apiStartSettings'
import {DependencyFunction} from '../../../systemInterfaces/dependencies'
import {UserDefinedObject} from '../../../systemInterfaces/userDefinedObject'
import {QueueEventListenerHandler} from './queueEventListenerHandler.interface'
import {QueueEventListenerSettings} from './queueEventListenerSettings.interface'
import {QueueService} from './queueService.interface'

export interface QueueEventListener<
  TSettings extends ApiStartSettings<any> = ApiStartSettings<any>,
  TDependencies extends UserDefinedObject = UserDefinedObject,
> {
  readonly dependencies?: DependencyFunction<TSettings, TDependencies> | TDependencies
  readonly exchange: TSettings['ServiceConfigurator']['queue'] extends QueueService
    ? TSettings['ServiceConfigurator']['queue']['exchanges']
    : string
  readonly handler: QueueEventListenerHandler<TSettings, TDependencies>
  readonly routingKey: string
  readonly settings: QueueEventListenerSettings
}
