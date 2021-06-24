import {ConnectionOptions, Configuration, EventSubscriber} from '@mikro-orm/core'
import {EnabledService} from '../../../systemInterfaces/services'
import {Models} from './models.interface'

export interface DatabaseConfig<TEntityList extends Models> extends EnabledService, ConnectionOptions {
  readonly ensureIndexes?: boolean
  readonly models: TEntityList
  readonly subscribers?: EventSubscriber[]
  readonly type: keyof typeof Configuration.PLATFORMS
  readonly forceUtcTimezone?: boolean
  readonly forceUndefined?: boolean
  readonly timezone?: string
  readonly strict?: boolean
  readonly validate?: boolean
  readonly logger?: (message: string) => void
  readonly replicas?: Partial<ConnectionOptions>[]
  readonly useBatchInserts?: boolean
  readonly useBatchUpdates?: boolean
  readonly batchSize?: number
  readonly folder: {
    readonly migrations: string
    readonly seeds: string
  }
}
