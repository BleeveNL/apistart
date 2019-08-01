import {ModelAttributes, ModelOptions, Model as SequelizeModel} from 'sequelize/types'

export abstract class Model extends SequelizeModel {
  public static structure: ModelAttributes

  public static settings: ModelOptions
}

export interface Models {
  readonly [key: string]: typeof Model
}
