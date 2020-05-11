import * as Koa from 'koa'
import {CustomDependencies, Dependencies} from '../../../systemInterfaces/dependencies'
import {Config} from '../../../systemInterfaces/config'
import {Models} from '../../database/interfaces/model'
import {ServiceConfigurator} from '../../../systemInterfaces/serviceConfigurator'

export type IController<
  TDependencies extends CustomDependencies = {},
  TServiceConfigurator extends ServiceConfigurator = ServiceConfigurator,
  TConfig extends Config<TServiceConfigurator> = Config<TServiceConfigurator>,
  TModels extends Models = Models,
  TContext extends Koa.Context = Koa.Context
> = (
  deps: Dependencies<TDependencies, TServiceConfigurator, TConfig, TModels>,
) => // eslint-disable-next-line @typescript-eslint/no-explicit-any
(ctx: TContext, next: () => Promise<any>) => Promise<any>
