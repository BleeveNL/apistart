import {WebserverServiceEnabled} from '../services/webserver/interfaces/webserverServiceEnabled'

export interface QueueService {
  readonly enabled: true
  readonly exchanges: string
}

export interface ServiceConfigurator<
  TCache = boolean,
  TDb = boolean,
  TQueue = false | QueueService,
  TWebserver = false | WebserverServiceEnabled,
> {
  readonly cache: TCache
  readonly database: TDb
  readonly queue: TQueue
  readonly webserver: TWebserver
}
