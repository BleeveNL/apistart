import * as amqp from './amqp'
import * as http from './http'
import * as https from './https'
import * as koa from './koa'
import * as koaBodyParser from './koaBodyParser'
import * as koaCors from './koaCors'
import * as koaRouter from './koaRouter'
import * as logHandler from './logHandler'
import * as middleware from './middleware'
import * as param from './param'
import * as redis from './redis'
import * as route from './route'

export const reset = () => {
  amqp.reset()
  http.reset()
  https.reset()
  koa.reset()
  koaBodyParser.reset()
  koaCors.reset()
  koaRouter.reset()
  logHandler.reset()
  middleware.reset()
  param.reset()
  route.reset()
  redis.reset()
}

export {amqp, http, https, koa, koaBodyParser, koaCors, koaRouter, logHandler, middleware, param, redis, route}
