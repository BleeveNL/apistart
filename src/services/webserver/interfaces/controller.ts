import * as Koa from 'koa'
import {Dependencies} from '../../../systemInterfaces/dependencies'
import {ApiStartSettings} from '../../../systemInterfaces/apiStartSettings'
import {UserDefinedObject} from '../../../systemInterfaces/userDefinedObject'

export type IController<
  TSettings extends ApiStartSettings<any> = ApiStartSettings,
  TDependencies extends UserDefinedObject = UserDefinedObject,
  TCustomState extends Koa.Context = Koa.Context,
> = (deps: Dependencies<TSettings, TDependencies>) => (ctx: TCustomState, next: () => Promise<any>) => Promise<any>
