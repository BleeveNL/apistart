import * as Koa from 'koa'
import {CustomDependencies, DependencyFunction} from '../../../systemInterfaces/dependencies'
import {Config} from '../../../systemInterfaces/config'
import {Models} from '../../database/interfaces/model'
import {IController} from './controller'
import {IMiddleware} from './middleware'
import {IParam} from './param'
import {ServiceConfigurator} from '../../../systemInterfaces/serviceConfigurator'
import {Methods, RouterOptions} from 'koa-advanced-router'

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export interface IRoute<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TDependencies extends CustomDependencies = {},
  TServiceConfigurator extends ServiceConfigurator = ServiceConfigurator,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TConfig extends Config<TServiceConfigurator> = Config<TServiceConfigurator>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TModels extends Models = Models,
  TContext extends Koa.Context = Koa.Context
> {
  readonly controller: IController<TDependencies, TServiceConfigurator, TConfig, TModels, TContext>
  readonly dependencies?: DependencyFunction<TDependencies, TServiceConfigurator, TConfig, TModels> | TDependencies
  readonly method: Methods | Methods[]

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly middleware?: IMiddleware<any, TServiceConfigurator, TConfig, TModels>[]
  readonly params?: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    readonly [key: string]: IParam<any, TServiceConfigurator, TConfig, TModels>
  }
  readonly path: RegExp | string
  readonly options?: RouterOptions
}
