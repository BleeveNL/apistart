import {InternalSystem} from './internalSystem'
import {ApiStartSettings} from './apiStartSettings'
import {UserDefinedObject} from './userDefinedObject'

export interface Dependencies<
  TSettings extends ApiStartSettings,
  TDependencies extends UserDefinedObject = UserDefinedObject
> extends InternalSystem<TSettings> {
  readonly Dependencies: TDependencies
}

export type DependencyFunction<
  TSettings extends ApiStartSettings,
  TDependencies extends UserDefinedObject = UserDefinedObject
> = (deps: Dependencies<TSettings, TDependencies>) => TDependencies
