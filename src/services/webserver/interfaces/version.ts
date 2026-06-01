import {IMiddleware} from './middleware'
import {IRoute} from './route'
import {VersionOptions} from './routerTypes'
import {ApiStartSettings} from '../../../systemInterfaces/apiStartSettings'

export interface Version<TSettings extends ApiStartSettings<any> = ApiStartSettings> {
  readonly enabled: boolean

  readonly middleware: IMiddleware<TSettings, any>[]

  readonly router: IRoute<TSettings, any, any>[]
  readonly identifier: string
  readonly options?: VersionOptions
}
