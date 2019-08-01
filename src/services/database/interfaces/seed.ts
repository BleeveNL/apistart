import * as Sequelize from 'sequelize'

// tslint:disable-next-line:no-any
export interface Seed {
  readonly seed: () => Promise<void>
}

export interface SeedClass<TDependencies extends {}> {
  readonly factory: (DB: Sequelize.Sequelize) => Seed
  new (DB: Sequelize.Sequelize, deps: TDependencies): Seed
}
