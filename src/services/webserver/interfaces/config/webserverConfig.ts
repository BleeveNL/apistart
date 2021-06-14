import {EnabledService, DisabledService} from '../../../../systemInterfaces/services'
import * as koaBodyParser from 'koa-bodyparser'
import {IMiddleware} from '../middleware'
import {IRoute} from '../route'
import {Version} from '../version'
import {WebserverServiceEnabled} from '../webserverServiceEnabled'
import {RouterOptions, VersionMatchingFunction} from 'koa-advanced-router'
import {ApiStartSettings} from '../../../../systemInterfaces/apiStartSettings'

export interface HttpSettings extends EnabledService {
  readonly port?: number
}

export interface HttpsSettings extends HttpSettings {
  readonly cert: {
    readonly cert: Buffer | string
    readonly key: Buffer | string
  }
}

export interface WebserverConfigDefault<
  TSettings extends ApiStartSettings,
  TWebserverService extends WebserverServiceEnabled,
> extends EnabledService {
  readonly settings: {
    readonly allowedMethods?: boolean
    readonly bodyParser?: koaBodyParser.Options & EnabledService
    readonly cors?: RouterOptions['cors']
    readonly expose?: boolean
    readonly prefix?: string
    readonly proxy?: boolean
    readonly silent?: boolean
    readonly subdomainOffset?: number
    readonly sensitive?: boolean
    readonly versionHandler: TWebserverService['versionHandling'] extends true
      ? 'url' | 'header' | VersionMatchingFunction
      : false
  }
  readonly connection: {
    readonly http: TWebserverService['http'] extends true ? HttpSettings : DisabledService
    readonly https: TWebserverService['https'] extends true ? HttpsSettings : DisabledService
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly middleware: IMiddleware<TSettings, any>[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly router: IRoute<TSettings, any, any>[]
}

export interface WebserverConfigDefaultWithVersioning<
  TSettings extends ApiStartSettings,
  TWebserverService extends WebserverServiceEnabled,
> extends WebserverConfigDefault<TSettings, TWebserverService> {
  readonly versions: Version<TSettings>[]
}

export type WebserverConfig<
  TSettings extends ApiStartSettings,
  TWebserverService extends WebserverServiceEnabled,
> = TWebserverService['versionHandling'] extends true
  ? WebserverConfigDefaultWithVersioning<TSettings, TWebserverService>
  : WebserverConfigDefault<TSettings, TWebserverService>
