import {ModelAttributes, ModelOptions, Model as SequelizeModel, ModelCtor} from 'sequelize/types'

export abstract class ModelAbstract extends SequelizeModel {
  public static structure: ModelAttributes

  public static settings: ModelOptions
}

export type Model = ModelCtor<ModelAbstract> & typeof ModelAbstract

export interface Models {
  readonly [key: string]: Model
}
