import {IMiddleware} from './middleware'
import {IRoute} from './route'

export interface Version {
  readonly enabled: boolean
  readonly middleware: IMiddleware[]
  readonly router: IRoute[]
  readonly identifier: string
}
