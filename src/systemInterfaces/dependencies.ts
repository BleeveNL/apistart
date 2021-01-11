import {InternalSystem} from './internalSystem'
import {ApiStartSettings} from './apiStartSettings'
import {UserDefinedObject} from './userDefinedObject'

export interface Dependencies<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TSettings extends ApiStartSettings<any>,
  TDependencies extends UserDefinedObject = UserDefinedObject
> extends InternalSystem<TSettings> {
  readonly Dependencies: TDependencies
}

export type DependencyFunction<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TSettings extends ApiStartSettings<any>,
  TDependencies extends UserDefinedObject = UserDefinedObject
> = (deps: Dependencies<TSettings>) => TDependencies
