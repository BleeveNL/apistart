import Router from '@koa/router'
import {DefaultState, DefaultContext} from 'koa'
import {Dependencies, DependencyFunction} from '../../../systemInterfaces/dependencies'
import {ApiStartSettings} from '../../../systemInterfaces/apiStartSettings'
import {UserDefinedObject} from '../../../systemInterfaces/userDefinedObject'

export type ParamFunction<
  TSettings extends ApiStartSettings<any> = ApiStartSettings,
  TDependencies extends UserDefinedObject = UserDefinedObject,
  TCustomState extends DefaultState = DefaultState,
> = (deps: Dependencies<TSettings, TDependencies>) => Router.IParamMiddleware

export interface ParamMiddlewareObject<
  TSettings extends ApiStartSettings<any> = ApiStartSettings,
  TDependencies extends UserDefinedObject = UserDefinedObject,
> {
  readonly dependencies: DependencyFunction<TSettings, TDependencies> | TDependencies
  readonly fnc: ParamFunction<TSettings, TDependencies>
}

export type IParam<
  TSettings extends ApiStartSettings<any> = ApiStartSettings,
  TDependencies extends UserDefinedObject = UserDefinedObject,
> = ParamFunction<TSettings, TDependencies> | ParamMiddlewareObject<TSettings, TDependencies>
