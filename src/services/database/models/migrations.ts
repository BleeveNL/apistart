import {STRING, INTEGER, Model as SequelizeModel} from 'sequelize'
import {ModelAbstract} from '../interfaces/model'

export default class Migrations extends SequelizeModel implements ModelAbstract {
  public file!: string

  public round!: number

  public id!: number

  public createdAt!: number

  public updatedAt!: number

  public static readonly structure = {
    file: {type: STRING},
    id: {
      autoIncrement: true,
      primaryKey: true,
      type: INTEGER,
    },
    round: {type: INTEGER},
  }

  public static readonly settings = {
    indexes: [
      {
        fields: ['file'],
      },
    ],
    paranoid: false,
    timestamps: true,
  }
}
