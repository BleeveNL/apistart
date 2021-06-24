import * as amqp from 'amqplib'

export interface QueueClient<TExchangeName extends string = string> {
  readonly publish: (
    exchangeName: TExchangeName,
    routingKey: string,

    data: Record<number | string | symbol, any> | any[] | boolean | number | string,
    options?: amqp.Options.Publish,
  ) => void
}
