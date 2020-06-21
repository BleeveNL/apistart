import * as KoaRouter from 'koa-advanced-router'
import {Dependencies, DependencyFunction} from '../../../systemInterfaces/dependencies'
import {ApiStartSettings} from '../../../systemInterfaces/apiStartSettings'
import {UserDefinedObject} from '../../../systemInterfaces/userDefinedObject'

export type ParamFunction<
  TSettings extends ApiStartSettings = ApiStartSettings,
  TDependencies extends UserDefinedObject = UserDefinedObject
> = (deps: Dependencies<TSettings, TDependencies>) => KoaRouter.Param

export interface ParamMiddlewareObject<
  TSettings extends ApiStartSettings = ApiStartSettings,
  TDependencies extends UserDefinedObject = UserDefinedObject
> {
  readonly dependencies: DependencyFunction<TSettings, TDependencies> | TDependencies
  readonly fnc: ParamFunction<TSettings, TDependencies>
}

export type IParam<
  TSettings extends ApiStartSettings = ApiStartSettings,
  TDependencies extends UserDefinedObject = UserDefinedObject
> = ParamFunction<TSettings, TDependencies> | ParamMiddlewareObject<TSettings, TDependencies>
