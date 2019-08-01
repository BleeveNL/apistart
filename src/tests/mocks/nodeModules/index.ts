import * as amqp from './amqp.mock'
import * as http from './http.mock'
import * as https from './https.mock'
import * as koa from './koa.mock'
import * as koaBodyParser from './koaBodyParser.mock'
import * as koaCors from './koaCors.mock'
import * as koaRouter from './koaRouter.mock'
import * as logHandler from './logHandler.mock'
import * as middleware from './middleware.mock'
import * as param from './param.mock'
import * as redis from './redis.mock'
import * as route from './route.mock'

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
