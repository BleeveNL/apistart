import {QueueSettingsOptions} from './queueSettingsOptions.interface'
import * as amqp from 'amqplib'

export interface QueueEventListenerSettings {
  readonly consume: amqp.Options.Consume
  readonly queue: QueueSettingsOptions
}
