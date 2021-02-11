import * as joi from 'joi'
import {Log} from 'loghandler'
import CacheHandler from './services/cache/cacheHandler'
import DatabaseHandler from './services/database/databaseHandler'
import QueueHandler from './services/queue/queueHandler'
import WebserverHandler from './services/webserver/webserverHandler'
import {ApiStartSettings} from './systemInterfaces/apiStartSettings'
import {Helpers} from './systemInterfaces/helpers'

export interface Dependencies<TSettings extends ApiStartSettings> {
  readonly helpers: Helpers
  readonly joi: typeof joi
  readonly log: Log
  readonly services: {
    readonly database: DatabaseHandler<TSettings>
    readonly cache: CacheHandler<TSettings>
    readonly queue: QueueHandler<TSettings>
    readonly webserver: WebserverHandler
  }
}
