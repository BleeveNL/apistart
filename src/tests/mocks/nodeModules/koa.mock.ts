/* eslint-disable @typescript-eslint/no-explicit-any */
import * as sinon from 'sinon'

const stubs = {
  callback: sinon.stub(),
  constructor: sinon.stub(),
  on: sinon.stub(),
  use: sinon.stub(),
}

const reset = () => {
  stubs.callback.resetHistory()
  stubs.constructor.resetHistory()
  stubs.on.resetHistory()
  stubs.use.resetHistory()
}

const Instance = class {
  public constructor(...args: any[]) {
    stubs.constructor(...args)
  }

  public use(...args: any[]) {
    return stubs.use(...args)
  }

  public on(...args: any[]) {
    return stubs.on(...args)
  }

  public callback(...args: any[]) {
    return stubs.callback(...args)
  }
}

export {stubs, Instance, reset}
