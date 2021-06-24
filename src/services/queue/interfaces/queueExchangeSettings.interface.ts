import * as amqp from 'amqplib'

export interface QueueExchangeSettings<TExchangeNames extends string = string> {
  readonly name: '' | TExchangeNames
  readonly options?: amqp.Options.AssertExchange
  readonly type: 'default' | 'direct' | 'fanout' | 'header' | 'topic'
}
