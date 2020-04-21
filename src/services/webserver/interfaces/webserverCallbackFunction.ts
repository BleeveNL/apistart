import {ServiceConfigurator} from '../../../systemInterfaces/serviceConfigurator'
import {Config} from '../../../systemInterfaces/config'
import {Models} from '../../database/interfaces/model'
import {InternalSystem} from '../../../systemInterfaces/internalSystem'

export type WebserverCallbackFunction<
  TServiceConfigurator extends ServiceConfigurator,
  TConfig extends Config<TServiceConfigurator>,
  TModels extends Models
> = (system: InternalSystem<TServiceConfigurator, TConfig, TModels>) => void
