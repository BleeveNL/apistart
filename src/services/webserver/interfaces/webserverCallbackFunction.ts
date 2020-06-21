import {InternalSystem} from '../../../systemInterfaces/internalSystem'
import {ApiStartSettings} from '../../../systemInterfaces/apiStartSettings'

export type WebserverCallbackFunction<TSettings extends ApiStartSettings = ApiStartSettings> = (
  system: InternalSystem<TSettings>,
) => void
