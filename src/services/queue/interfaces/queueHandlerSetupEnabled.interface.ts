import {ApiStartSettings} from '../../../systemInterfaces/apiStartSettings'
import {InternalSystem} from '../../../systemInterfaces/internalSystem'
import {QueueClient} from './queueClient.interface'
import {QueueHandlerEnabledServerFunction} from './queueHandlerEnabledServerFunction.interface'

export interface QueueHandlerSetupEnabled<TSettings extends ApiStartSettings> {
  client: QueueClient
  server: (sysDeps: InternalSystem<TSettings>) => QueueHandlerEnabledServerFunction<TSettings>
}
