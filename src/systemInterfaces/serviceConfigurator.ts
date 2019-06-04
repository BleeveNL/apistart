export interface ServiceConfigurator {
  readonly cache: boolean
  readonly db: boolean
  readonly queue: false | QueueService
}

export interface QueueService {
  readonly enabled: true
  readonly exchanges: string
}
