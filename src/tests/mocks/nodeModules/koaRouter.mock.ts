/* eslint-disable @typescript-eslint/no-explicit-any */
import * as sinon from 'sinon'

const stubs = {
  constructor: sinon.stub(),
  get: sinon.stub(),
  param: sinon.stub(),
  post: sinon.stub(),
  routes: sinon.stub(),
  use: sinon.stub(),
}

const reset = () => {
  stubs.routes.resetHistory()
  stubs.constructor.resetHistory()
  stubs.get.resetHistory()
  stubs.post.resetHistory()
  stubs.use.resetHistory()
  stubs.param.resetHistory()
}

class Instance {
  public readonly middleware: any[] = []

  public constructor(...args: any[]) {
    stubs.constructor(...args)
  }

  public use(...args: any[]) {
    stubs.use(...args)

    if (Array.isArray(args[0])) {
      this.middleware.push(...args[0])
    } else {
      this.middleware.push(args[0])
    }

    return this
  }

  public routes(...args: any[]) {
    stubs.routes(...args)
    const dispatch: any = () => undefined
    dispatch.router = this
    return dispatch
  }

  public param(...args: any[]) {
    stubs.param(...args)
    return this
  }

  public get(...args: any[]) {
    stubs.get(...args)
    return this
  }

  public post(...args: any[]) {
    stubs.post(...args)
    return this
  }
}

export {stubs, reset, Instance}
