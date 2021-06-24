import * as amqp from 'amqplib'

export interface QueueSettingsOptions extends amqp.Options.AssertQueue {
  readonly name?: string
}
