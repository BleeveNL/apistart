import {SystemDependencies} from '../../..'
import {ApiStartSettings} from '../../../systemInterfaces/apiStartSettings'
import {UserDefinedObject} from '../../../systemInterfaces/userDefinedObject'
import * as amqp from 'amqplib'

export type QueueEventListenerHandler<
  TSettings extends ApiStartSettings<any> = ApiStartSettings<any>,
  TDependencies extends UserDefinedObject = UserDefinedObject,
> = (sysDeps: SystemDependencies<TSettings, TDependencies>, msg: amqp.ConsumeMessage) => Promise<boolean>
