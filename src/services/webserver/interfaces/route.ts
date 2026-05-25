import * as Koa from 'koa'
import {DependencyFunction} from '../../../systemInterfaces/dependencies'
import {IController} from './controller'
import {IMiddleware} from './middleware'
import {IParam} from './param'
import {Methods, RouterOptions} from 'koa-advanced-router'
import {ApiStartSettings} from '../../../systemInterfaces/apiStartSettings'
import {UserDefinedObject} from '../../../systemInterfaces/userDefinedObject'

export interface IRoute<
  TSettings extends ApiStartSettings<any> = ApiStartSettings,
  TDependencies extends UserDefinedObject = UserDefinedObject,
  TCustomState extends Koa.Context = Koa.Context,
> {
  readonly controller: IController<TSettings, TDependencies, TCustomState>
  readonly dependencies?: DependencyFunction<TSettings, TDependencies> | TDependencies
  readonly method: Methods | Methods[]

  readonly middleware?: IMiddleware<TSettings, any>[]
  readonly params?: {
    readonly [key: string]: IParam<TSettings, any>
  }
  readonly path: RegExp | string
  readonly options?: RouterOptions
}
