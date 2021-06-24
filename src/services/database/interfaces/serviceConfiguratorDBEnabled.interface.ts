import {ServiceConfigurator} from '../../../systemInterfaces/serviceConfigurator'

export interface ServiceConfiguratorDBEnabled extends ServiceConfigurator {
  database: true
}
