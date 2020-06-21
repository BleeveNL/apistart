import SystemHelpers from '../helpers/interface'
import {CustomHelpers} from './customHelpers'

export type Helpers<TCustomHelpers extends CustomHelpers = CustomHelpers> = SystemHelpers & TCustomHelpers
