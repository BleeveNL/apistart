import * as Koa from 'koa'
import {Dependencies} from '../../../systemInterfaces/dependencies'
import {ApiStartSettings} from '../../../systemInterfaces/apiStartSettings'
import {UserDefinedObject} from '../../../systemInterfaces/userDefinedObject'

export type IController<
  TSettings extends ApiStartSettings = ApiStartSettings,
  TDependencies extends UserDefinedObject = UserDefinedObject,
  TCustomState extends Koa.Context = Koa.Context
> = (
  deps: Dependencies<TSettings, TDependencies>,
) => // eslint-disable-next-line @typescript-eslint/no-explicit-any
(ctx: TCustomState, next: () => Promise<any>) => Promise<any>
