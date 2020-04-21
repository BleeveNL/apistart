import * as Koa from 'koa'
import {CustomDependencies, Dependencies, DependencyFunction} from './dependencies'
import {Config} from '../../../systemInterfaces/config'
import {Models} from '../../database/interfaces/model'
import {ServiceConfigurator} from '../../../systemInterfaces/serviceConfigurator'

export type MiddlewareFunction<
  TDependencies extends CustomDependencies = {},
  TServiceConfigurator extends ServiceConfigurator = ServiceConfigurator,
  TConfig extends Config<TServiceConfigurator> = Config<TServiceConfigurator>,
  TModels extends Models = Models
> = (deps: Dependencies<TDependencies, TServiceConfigurator, TConfig, TModels>) => Koa.Middleware

export interface MiddlewareObject<
  TDependencies extends CustomDependencies = {},
  TServiceConfigurator extends ServiceConfigurator = ServiceConfigurator,
  TConfig extends Config<TServiceConfigurator> = Config<TServiceConfigurator>,
  TModels extends Models = Models
> {
  readonly dependencies: DependencyFunction<TDependencies, TServiceConfigurator, TConfig, TModels> | TDependencies
  readonly fnc: MiddlewareFunction<TDependencies, TServiceConfigurator, TConfig, TModels>
}

export type IMiddleware<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TDependencies extends CustomDependencies = any,
  TServiceConfigurator extends ServiceConfigurator = ServiceConfigurator,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TConfig extends Config<TServiceConfigurator> = Config<TServiceConfigurator>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TModels extends Models = Models
> =
  | MiddlewareFunction<TDependencies, TServiceConfigurator, TConfig, TModels>
  | MiddlewareObject<TDependencies, TServiceConfigurator, TConfig, TModels>
