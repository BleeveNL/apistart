export interface ServiceConfigurator {
  readonly cache: boolean
  readonly db: boolean
  readonly queue: false | QueueService
  readonly webserver: boolean
}

export interface QueueService {
  readonly enabled: true
  readonly exchanges: string
}
