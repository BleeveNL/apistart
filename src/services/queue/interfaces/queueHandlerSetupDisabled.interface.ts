import {QueueHandlerDisabledServerFunction} from './queueHandlerDisabledServerFunction.interface'

export interface QueueHandlerSetupDisabled {
  client: undefined
  server: () => QueueHandlerDisabledServerFunction
}
