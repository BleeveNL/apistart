import {Models} from '../services/database/interfaces/model'
import {Config} from './config'
import {ServiceConfigurator} from './serviceConfigurator'
import {InternalSystem} from './internalSystem'

export interface Dependencies<
  TDependencies extends CustomDependencies,
  TServiceConfigurator extends ServiceConfigurator,
  TConfig extends Config,
  TModels extends Models
> extends InternalSystem<TServiceConfigurator, TConfig, TModels> {
  readonly Dependencies: TDependencies
}

export interface CustomDependencies {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly [key: string]: any
}
