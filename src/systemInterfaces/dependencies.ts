import {Models} from '../services/database/interfaces/model'
import {Config} from './config'
import {InternalSystem} from './internalSystem'
import {ServiceConfigurator} from './serviceConfigurator'

export interface Dependencies<
  TDependencies extends CustomDependencies,
  TServiceConfigurator extends ServiceConfigurator,
  TConfig extends Config<TServiceConfigurator>,
  TModels extends Models
> extends InternalSystem<TServiceConfigurator, TConfig, TModels> {
  readonly Dependencies: TDependencies
}

export interface CustomDependencies {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly [key: string]: any
}

export type DependencyFunction<
  TDependencies extends CustomDependencies = {},
  TServiceConfigurator extends ServiceConfigurator = ServiceConfigurator,
  TConfig extends Config<TServiceConfigurator> = Config<TServiceConfigurator>,
  TModels extends Models = Models
> = (deps: Dependencies<{}, TServiceConfigurator, TConfig, TModels>) => TDependencies
