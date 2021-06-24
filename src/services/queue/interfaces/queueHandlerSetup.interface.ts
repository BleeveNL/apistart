import {ApiStartSettings} from '../../../systemInterfaces/apiStartSettings'
import {QueueHandlerSetupDisabled} from './queueHandlerSetupDisabled.interface'
import {QueueHandlerSetupEnabled} from './queueHandlerSetupEnabled.interface'

export type QueueHandlerSetup<TSettings extends ApiStartSettings> =
  TSettings['ServiceConfigurator']['queue'] extends false
    ? QueueHandlerSetupDisabled
    : QueueHandlerSetupEnabled<TSettings>
