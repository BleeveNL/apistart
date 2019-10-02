import { Models } from "../services/database/interfaces/model";
import { Config } from "./config";
import { ServiceConfigurator } from "./serviceConfigurator";
import { InternalSystem } from "./internalSystem";

export interface Dependencies<
TDependencies extends CustomDependencies,
TServiceConfigurator extends ServiceConfigurator,
TConfig extends Config,
TModels extends Models
> extends InternalSystem<TConfig, TModels, TServiceConfigurator> {
readonly Dependencies: TDependencies,
}

export interface CustomDependencies {
    readonly [key: string]: any, // tslint:disable-line:no-any
  }
  