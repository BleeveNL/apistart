/* eslint-disable @typescript-eslint/no-explicit-any */

import * as sinon from 'sinon'

const stubs = {
  controller: sinon.stub(),
}

const reset = () => {
  stubs.controller.resetHistory()
}

const controller = (...args: any[]) => {
  stubs.controller(...args)
}

class Instance {
  public readonly method: string
  public readonly path: string
  public readonly middleware: any[]

  public readonly controller = controller

  public constructor(method: string, path: string, middleware: any[]) {
    this.method = method
    this.path = path
    this.middleware = middleware
  }
}

export {stubs, reset, Instance}
