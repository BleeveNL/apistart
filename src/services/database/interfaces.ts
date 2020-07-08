import * as fs from 'fs'
import {Log} from 'loghandler'
import {
  Options,
  Sequelize,
  ARRAY,
  BIGINT,
  BLOB,
  BOOLEAN,
  CIDR,
  CITEXT,
  DATE,
  DATEONLY,
  DECIMAL,
  DOUBLE,
  ENUM,
  FLOAT,
  GEOMETRY,
  INET,
  INTEGER,
  JSON,
  JSONB,
  MACADDR,
  RANGE,
  REAL,
  STRING,
  TEXT,
  UUID,
} from 'sequelize'
import immer from 'immer'
import {Models} from './interfaces/model'
import {EnabledService} from '../../systemInterfaces/services'
import {ServiceConfigurator} from '../../systemInterfaces/serviceConfigurator'

export interface Dependencies {
  readonly fs: typeof fs
  readonly Immer: typeof immer
  readonly Log: Log
  readonly Sequelize: typeof Sequelize
  readonly systemModels: Models
}

export interface DatabaseConfig extends EnabledService, Options {
  readonly folder: {
    readonly migrations: string
    readonly seeds: string
  }
  readonly models: Models
}

export interface ServiceConfiguratorDBEnabled extends ServiceConfigurator {
  database: true
}

export const DBDataTypes = {
  ARRAY,
  BIGINT,
  BLOB,
  BOOLEAN,
  CIDR,
  CITEXT,
  DATE,
  DATEONLY,
  DECIMAL,
  DOUBLE,
  ENUM,
  FLOAT,
  GEOMETRY,
  INET,
  INTEGER,
  JSON,
  JSONB,
  MACADDR,
  RANGE,
  REAL,
  STRING,
  TEXT,
  UUID,
}
