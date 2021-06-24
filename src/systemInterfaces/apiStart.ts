import {ApiStartSettings} from './apiStartSettings'
import {InternalSystem} from './internalSystem'
import {WebserverFunction} from '../services/webserver/interfaces'
import {QueueHandlerServerFunction} from '../services/queue/interfaces/queueHandlerServerFunction.interface'

export interface ApiStart<TSettings extends ApiStartSettings> extends InternalSystem<TSettings> {
  EventListener: QueueHandlerServerFunction<TSettings>
  Webserver: WebserverFunction<TSettings>
}
