import {ApiStartSettings} from '../../../systemInterfaces/apiStartSettings'
import {QueueHandlerDisabledServerFunction} from './queueHandlerDisabledServerFunction.interface'
import {QueueHandlerEnabledServerFunction} from './queueHandlerEnabledServerFunction.interface'

export type QueueHandlerServerFunction<TSettings extends ApiStartSettings> =
  TSettings['ServiceConfigurator']['queue'] extends false
    ? QueueHandlerDisabledServerFunction
    : QueueHandlerEnabledServerFunction<TSettings>
