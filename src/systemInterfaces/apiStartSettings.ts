import {ServiceConfigurator} from './serviceConfigurator'
import {Config} from './config'
import {Models} from '../services/database/interfaces/model'
import {CustomHelpers} from './customHelpers'
import {UserDefinedObject} from './userDefinedObject'

export interface ApiStartSettings<
  TServiceConfigurator extends ServiceConfigurator = ServiceConfigurator,
  TCustomConfig extends UserDefinedObject = UserDefinedObject,
> {
  ServiceConfigurator: TServiceConfigurator
  Config: Config<ApiStartSettings<TServiceConfigurator>> & TCustomConfig
  Helpers: CustomHelpers
  Models: Models
}
