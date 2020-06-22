import {InternalSystem} from '../../../systemInterfaces/internalSystem'
import {ApiStartSettings} from '../../../systemInterfaces/apiStartSettings'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WebserverCallbackFunction<TSettings extends ApiStartSettings<any> = ApiStartSettings> = (
  system: InternalSystem<TSettings>,
) => void
