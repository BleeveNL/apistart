import * as Sequelize from 'sequelize'
import {UserDefinedObject} from '../../../systemInterfaces/userDefinedObject'

export interface Seed {
  readonly seed: () => Promise<void>
}

export interface SeedClass<TDependencies extends UserDefinedObject> {
  readonly factory: (DB: Sequelize.Sequelize) => Seed
  new (DB: Sequelize.Sequelize, deps: TDependencies): Seed
}
