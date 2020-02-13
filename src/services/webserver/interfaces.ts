import * as http from 'http'
import * as https from 'https'
import immer from 'immer'
import * as Koa from 'koa'
import * as KoaBodyParser from 'koa-bodyparser'
import * as KoaRouter from 'koa-router'
import * as koaCors from '@koa/cors'
import {ServiceConfigurator} from '../../systemInterfaces/serviceConfigurator'
import {InternalSystem} from '../../systemInterfaces/internalSystem'
import {Models} from '../database/interfaces/model'
import {Config} from '../../systemInterfaces/config'

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

export type WebserverCallbackFunction<
  TServiceConfigurator extends ServiceConfigurator,
  TConfig extends Config,
  TModels extends Models
> = (system: InternalSystem<TServiceConfigurator, TConfig, TModels>, connection: 'http' | 'https') => void

export interface WebserverStartResponse {
  close: (callback?: () => void) => void
}

export interface WebServerObject {
  http?: http.Server
  https?: http.Server
}
