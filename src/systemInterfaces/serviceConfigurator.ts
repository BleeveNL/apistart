import {WebserverServiceEnabled} from '../services/webserver/interfaces/webserverServiceEnabled'

export interface QueueService {
  readonly enabled: true
  readonly exchanges: string
}

export interface ServiceConfigurator<
  TCache = boolean,
  TQueue = false | QueueService,
  TWebserver = false | WebserverServiceEnabled,
> {
  readonly cache: TCache
  readonly queue: TQueue
  readonly webserver: TWebserver
}
