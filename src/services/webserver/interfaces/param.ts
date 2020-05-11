import * as KoaRouter from 'koa-advanced-router'
import {CustomDependencies, Dependencies, DependencyFunction} from '../../../systemInterfaces/dependencies'
import {Config} from '../../../systemInterfaces/config'
import {Models} from '../../database/interfaces/model'
import {ServiceConfigurator} from '../../../systemInterfaces/serviceConfigurator'

export type ParamFunction<
  TDependencies extends CustomDependencies = {},
  TServiceConfigurator extends ServiceConfigurator = ServiceConfigurator,
  TConfig extends Config<TServiceConfigurator> = Config<TServiceConfigurator>,
  TModels extends Models = Models
> = (deps: Dependencies<TDependencies, TServiceConfigurator, TConfig, TModels>) => KoaRouter.Param

export interface ParamMiddlewareObject<
  TDependencies extends CustomDependencies = {},
  TServiceConfigurator extends ServiceConfigurator = ServiceConfigurator,
  TConfig extends Config<TServiceConfigurator> = Config<TServiceConfigurator>,
  TModels extends Models = Models
> {
  readonly dependencies: DependencyFunction<TDependencies, TServiceConfigurator, TConfig, TModels> | TDependencies
  readonly fnc: ParamFunction<TDependencies, TServiceConfigurator, TConfig, TModels>
}

export type IParam<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TDependencies extends CustomDependencies = any,
  TServiceConfigurator extends ServiceConfigurator = ServiceConfigurator,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TConfig extends Config<TServiceConfigurator> = Config<TServiceConfigurator>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TModels extends Models = Models
> =
  | ParamFunction<TDependencies, TServiceConfigurator, TConfig, TModels>
  | ParamMiddlewareObject<TDependencies, TServiceConfigurator, TConfig, TModels>
