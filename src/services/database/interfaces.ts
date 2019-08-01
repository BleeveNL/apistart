import * as fs from 'fs'
import * as _ from 'lodash'
import {Log} from 'loghandler'
import {Options, Sequelize} from 'sequelize'
import immer from 'immer'
import {Model} from './interfaces/model'
import {EnabledService} from '../../systemInterfaces/services'
import {ServiceConfigurator} from '../../systemInterfaces/serviceConfigurator'

export interface Dependencies {
  readonly _: typeof _
  readonly fs: typeof fs
  readonly Immer: typeof immer
  readonly Log: Log
  readonly Sequelize: typeof Sequelize
  readonly systemModels: (typeof Model)[]
}

export interface DatabaseConfig extends EnabledService, Options {
  readonly folder: {
    readonly migrations: string
    readonly seeds: string
  }
  readonly models: (typeof Model)[]
}

export interface ServiceConfiguratorDBEnabled extends ServiceConfigurator {
  db: true
}
