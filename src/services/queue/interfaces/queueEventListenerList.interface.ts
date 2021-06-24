import {ApiStartSettings} from '../../../systemInterfaces/apiStartSettings'
import {UserDefinedObject} from '../../../systemInterfaces/userDefinedObject'
import {QueueEventListener} from './queueEventListener.interface'

export type QueueEventListenerList<
  TSettings extends ApiStartSettings<any> = ApiStartSettings<any>,
  TDependencies extends UserDefinedObject = Record<string | number | symbol, any>,
> = QueueEventListener<TSettings, TDependencies>[]
