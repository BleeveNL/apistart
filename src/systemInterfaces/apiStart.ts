import {ApiStartSettings} from './apiStartSettings'
import {InternalSystem} from './internalSystem'
import {QueueHandlerSetup} from '../services/queue/interfaces'
import {WebserverFunction} from '../services/webserver/interfaces'

export interface ApiStart<TSettings extends ApiStartSettings> extends InternalSystem<TSettings> {
  EventListener: Promise<QueueHandlerSetup<TSettings>['server']>
  Webserver: WebserverFunction<TSettings>
}
