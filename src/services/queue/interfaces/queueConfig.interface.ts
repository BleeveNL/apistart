import {EnabledService} from '../../../systemInterfaces/services'
import {QueueExchangeSettings} from './queueExchangeSettings.interface'
import * as amqp from 'amqplib'

export interface QueueConfig<ExchangeNames extends string = string> extends EnabledService, amqp.Options.Connect {
  readonly exchanges: QueueExchangeSettings<ExchangeNames>[]
}
