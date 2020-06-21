/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import * as sinon from 'sinon'

const stubs = {
  all: sinon.stub(),
  connect: sinon.stub(),
  constructor: sinon.stub(),
  delete: sinon.stub(),
  get: sinon.stub(),
  head: sinon.stub(),
  options: sinon.stub(),
  param: sinon.stub(),
  patch: sinon.stub(),
  post: sinon.stub(),
  put: sinon.stub(),
  route: sinon.stub(),
  routes: sinon.stub(),
  routesMiddleware: sinon.stub(),
  trace: sinon.stub(),
  use: sinon.stub(),
  version: sinon.stub(),
}

const reset = () => {
  stubs.constructor.resetHistory()
  stubs.route.resetHistory()
  stubs.all.resetHistory()
  stubs.connect.resetHistory()
  stubs.delete.resetHistory()
  stubs.get.resetHistory()
  stubs.head.resetHistory()
  stubs.options.resetHistory()
  stubs.patch.resetHistory()
  stubs.post.resetHistory()
  stubs.put.resetHistory()
  stubs.trace.resetHistory()
  stubs.use.resetHistory()
  stubs.param.resetHistory()
  stubs.routes.resetHistory()
  stubs.routesMiddleware.resetHistory()
  stubs.version.resetHistory()
}

class Router {
  constructor(...args: any[]) {
    stubs.constructor(...args)
  }

  public route(...args: any[]) {
    stubs.route(...args)
    return this
  }

  public all(...args: any[]) {
    stubs.all(...args)
    return this
  }

  public connect(...args: any[]) {
    stubs.connect(...args)
    return this
  }

  public delete(...args: any[]) {
    stubs.delete(...args)
    return this
  }

  public get(...args: any[]) {
    stubs.get(...args)
    return this
  }

  public head(...args: any[]) {
    stubs.head(...args)
    return this
  }

  public options(...args: any[]) {
    stubs.options(...args)
    return this
  }

  public patch(...args: any[]) {
    stubs.patch(...args)
    return this
  }

  public post(...args: any[]) {
    stubs.post(...args)
    return this
  }

  public put(...args: any[]) {
    stubs.put(...args)
    return this
  }

  public trace(...args: any[]) {
    stubs.trace(...args)
    return this
  }

  public use(...args: any[]) {
    stubs.use(...args)
    return this
  }

  public param(...args: any[]) {
    stubs.param(...args)
    return this
  }

  public version(...args: any[]) {
    stubs.version(...args)
    return this
  }

  public get routes() {
    stubs.routes()
    return (...args: any[]) => {
      return stubs.routesMiddleware(...args)
    }
  }
}

function Instance(...args: any[]) {
  return new Router(...args)
}

export {stubs, reset, Instance}
