import {ServiceConfigurator} from './serviceConfigurator'
import {Config} from './config'
import {Models} from '../services/database/interfaces/model'
import {CustomHelpers} from './customHelpers'

export interface ApiStartSettings<
  TServiceConfigurator extends ServiceConfigurator = ServiceConfigurator,
  TConfig extends Config<TServiceConfigurator> = Config<TServiceConfigurator>,
  THelpers extends CustomHelpers = CustomHelpers,
  TModels extends Models = Models
> {
  ServiceConfigurator: TServiceConfigurator
  Config: TConfig
  Helpers: THelpers
  Models: TModels
}
