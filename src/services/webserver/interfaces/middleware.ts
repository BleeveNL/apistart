import * as Koa from 'koa'
import {Dependencies, DependencyFunction} from '../../../systemInterfaces/dependencies'
import {ApiStartSettings} from '../../../systemInterfaces/apiStartSettings'
import {UserDefinedObject} from '../../../systemInterfaces/userDefinedObject'

export type MiddlewareFunction<
  TSettings extends ApiStartSettings = ApiStartSettings,
  TDependencies extends UserDefinedObject = UserDefinedObject
> = (deps: Dependencies<TSettings, TDependencies>) => Koa.Middleware

export interface MiddlewareObject<
  TSettings extends ApiStartSettings = ApiStartSettings,
  TDependencies extends UserDefinedObject = UserDefinedObject
> {
  readonly dependencies: TDependencies | DependencyFunction<TSettings, TDependencies>
  readonly fnc: MiddlewareFunction<TSettings, TDependencies>
}

export type IMiddleware<
  TSettings extends ApiStartSettings = ApiStartSettings,
  TDependencies extends UserDefinedObject = UserDefinedObject
> = MiddlewareFunction<TSettings, TDependencies> | MiddlewareObject<TSettings, TDependencies>
