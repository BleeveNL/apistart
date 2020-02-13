import * as http from 'http'
import * as https from 'https'
import immer from 'immer'
import * as Koa from 'koa'
import * as KoaBodyParser from 'koa-bodyparser'
import * as KoaRouter from 'koa-router'
import * as koaCors from '@koa/cors'
import {ServiceConfigurator} from '../../systemInterfaces/serviceConfigurator'

export interface WebserverHandlerDeps {
  readonly Http: typeof http
  readonly Https: typeof https
  readonly Immer: typeof immer
  readonly Koa: typeof Koa
  readonly KoaBodyParser: typeof KoaBodyParser
  readonly KoaCors: typeof koaCors
  readonly KoaRouter: typeof KoaRouter
}

export interface ServiceConfiguratorWebserverEnabled extends ServiceConfigurator {
  webserver: true
}
