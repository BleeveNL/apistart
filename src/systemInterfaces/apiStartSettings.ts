import {ServiceConfigurator} from './serviceConfigurator'
import {Config} from './config'
import {Models} from '../services/database/interfaces/model'
import {CustomHelpers} from './customHelpers'

export interface ApiStartSettings<TServiceConfigurator extends ServiceConfigurator = ServiceConfigurator> {
  ServiceConfigurator: TServiceConfigurator
  Config: Config<TServiceConfigurator>
  Helpers: CustomHelpers
  Models: Models
}
