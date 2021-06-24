import {ServiceConfigurator} from './serviceConfigurator'
import {Config} from './config'
import {CustomHelpers} from './customHelpers'
import {UserDefinedObject} from './userDefinedObject'
import {Models} from '../services/database/interfaces/models.interface'

export interface ApiStartSettings<
  TServiceConfigurator extends ServiceConfigurator = ServiceConfigurator,
  TCustomConfig extends UserDefinedObject = UserDefinedObject,
> {
  ServiceConfigurator: TServiceConfigurator
  Config: Config<ApiStartSettings<TServiceConfigurator>> & TCustomConfig
  Helpers: CustomHelpers
  Models: Models
}
