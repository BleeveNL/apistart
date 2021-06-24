import {ServiceConfigurator} from '../../../systemInterfaces/serviceConfigurator'

export interface ServiceConfiguratorCacheEnabled extends ServiceConfigurator {
  cache: true
}

export default ServiceConfiguratorCacheEnabled
