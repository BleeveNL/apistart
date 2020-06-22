import {IMiddleware} from './middleware'
import {IRoute} from './route'
import {VersionOptions} from 'koa-advanced-router'
import {ApiStartSettings} from '../../../systemInterfaces/apiStartSettings'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface Version<TSettings extends ApiStartSettings<any> = ApiStartSettings> {
  readonly enabled: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly middleware: IMiddleware<TSettings, any>[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly router: IRoute<TSettings, any, any>[]
  readonly identifier: string
  readonly options?: VersionOptions
}
