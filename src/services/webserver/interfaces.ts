import * as http from 'http'
import * as https from 'https'
import immer from 'immer'
import * as Koa from 'koa'
import * as KoaBodyParser from 'koa-bodyparser'
import Router from 'koa-advanced-router'
import {ServiceConfigurator, QueueService} from '../../systemInterfaces/serviceConfigurator'
import {WebserverServiceEnabled} from './interfaces/webserverServiceEnabled'

export interface WebserverHandlerDeps {
  readonly Http: typeof http
  readonly Https: typeof https
  readonly Immer: typeof immer
  readonly Koa: typeof Koa
  readonly KoaBodyParser: typeof KoaBodyParser
  readonly KoaRouter: typeof Router
}

export type WebserverEnabledServiceConfigurator<
  TWebserverConfig extends WebserverServiceEnabled = WebserverServiceEnabled
> = ServiceConfigurator<boolean, boolean, false | QueueService, TWebserverConfig>

export interface WebserverStartResponse {
  close: (callback?: () => void) => void
}

export interface WebServerObject {
  http?: http.Server
  https?: http.Server
}
