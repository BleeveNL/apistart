import {ApiStartSettings} from '../../../systemInterfaces/apiStartSettings'
import {InternalSystem} from '../../../systemInterfaces/internalSystem'
import {QueueEventListenerList} from './queueEventListenerList.interface'

export type QueueHandlerEnabledServerFunction<TSettings extends ApiStartSettings> = (
  listeners: QueueEventListenerList,
  callback?: (sysDeps: InternalSystem<TSettings>) => void,
) => Promise<boolean>
