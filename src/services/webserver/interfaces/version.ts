import {IMiddleware} from './middleware'
import {IRoute} from './route'
import {VersionOptions} from 'koa-advanced-router'

export interface Version {
  readonly enabled: boolean
  readonly middleware: IMiddleware[]
  readonly router: IRoute[]
  readonly identifier: string
  readonly options?: VersionOptions
}
