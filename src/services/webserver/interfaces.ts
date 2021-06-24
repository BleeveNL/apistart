import * as http from 'http'
import * as https from 'https'
import immer from 'immer'
import Koa from 'koa'
import KoaBodyParser from 'koa-bodyparser'
import Router from 'koa-advanced-router'
import {ServiceConfigurator} from '../../systemInterfaces/serviceConfigurator'
import {ApiStartSettings} from '../../systemInterfaces/apiStartSettings'
import {InternalSystem} from '../../systemInterfaces/internalSystem'
import {RequestContext} from '@mikro-orm/core'

export interface WebserverHandlerDeps {
  readonly Http: typeof http
  readonly Https: typeof https
  readonly Immer: typeof immer
  readonly Koa: typeof Koa
  readonly KoaBodyParser: typeof KoaBodyParser
  readonly KoaRouter: typeof Router
  readonly DBMiddleware: typeof RequestContext
}

export interface WebserverEnabledServiceConfigurator<
  Thttp extends boolean = boolean,
  Thttps extends boolean = boolean,
  TversionHandling extends boolean = boolean,
> extends ServiceConfigurator {
  webserver: {
    readonly http: Thttp
    readonly https: Thttps
    readonly versionHandling: TversionHandling
  }
}

export interface WebserverStartResponse {
  close: (callback?: () => void) => void
}

export interface WebServerObject {
  http?: http.Server
  https?: http.Server
}

export type WebserverFunction<TSettings extends ApiStartSettings> = (
  callback?: (internalSystem: InternalSystem<TSettings>) => void,
) => TSettings['ServiceConfigurator']['webserver'] extends false ? never : WebserverStartResponse
