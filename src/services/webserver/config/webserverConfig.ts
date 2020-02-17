import {EnabledService, DisabledService} from '../../../systemInterfaces/services'
import * as koaBodyParser from 'koa-bodyparser'
import * as koaCors from '@koa/cors'

export interface HttpSettings extends EnabledService {
  readonly port?: number
}

export interface HttpsSettings extends HttpSettings {
  readonly cert: {
    readonly cert: Buffer | string
    readonly key: Buffer | string
  }
}

export interface CorsSettingsEnabled extends koaCors.Options, EnabledService {}

export interface WebserverConfig extends EnabledService {
  security?: {
    cors?: CorsSettingsEnabled | DisabledService
  }
  settings: {
    bodyParser?: koaBodyParser.Options & EnabledService
    proxy?: boolean
    silent?: boolean
    subdomainOffset?: number
    versionHandler: false | 'url' | 'header'
  }
  connection: {
    http: DisabledService | HttpSettings
    https: DisabledService | HttpsSettings
  }
}
