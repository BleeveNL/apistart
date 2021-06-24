import {ServiceConfigurator} from '../../../systemInterfaces/serviceConfigurator'
import {QueueService} from './queueService.interface'

export interface ServiceConfiguratorQueueEnabled extends ServiceConfigurator {
  queue: QueueService
}
