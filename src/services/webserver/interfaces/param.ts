import * as KoaRouter from 'koa-advanced-router'
import {Dependencies, DependencyFunction} from '../../../systemInterfaces/dependencies'
import {ApiStartSettings} from '../../../systemInterfaces/apiStartSettings'
import {UserDefinedObject} from '../../../systemInterfaces/userDefinedObject'

export type ParamFunction<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TSettings extends ApiStartSettings<any> = ApiStartSettings,
  TDependencies extends UserDefinedObject = UserDefinedObject
> = (deps: Dependencies<TSettings, TDependencies>) => KoaRouter.Param

export interface ParamMiddlewareObject<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TSettings extends ApiStartSettings<any> = ApiStartSettings,
  TDependencies extends UserDefinedObject = UserDefinedObject
> {
  readonly dependencies: DependencyFunction<TSettings, TDependencies> | TDependencies
  readonly fnc: ParamFunction<TSettings, TDependencies>
}

export type IParam<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TSettings extends ApiStartSettings<any> = ApiStartSettings,
  TDependencies extends UserDefinedObject = UserDefinedObject
> = ParamFunction<TSettings, TDependencies> | ParamMiddlewareObject<TSettings, TDependencies>
