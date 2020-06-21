import * as joi from '@hapi/joi'
import {Log} from 'loghandler'
import CacheHandler from './services/cache/cacheHandler'
import DatabaseHandler from './services/database/databaseHandler'
import QueueHandler from './services/queue/queueHandler'
import WebserverHandler from './services/webserver/webserverHandler'
import {Helpers} from './systemInterfaces/helpers'

export interface Dependencies {
  readonly helpers: Helpers
  readonly joi: typeof joi
  readonly log: Log
  readonly services: {
    readonly database: DatabaseHandler
    readonly cache: CacheHandler
    readonly queue: QueueHandler
    readonly webserver: WebserverHandler
  }
}
