/* eslint-disable @typescript-eslint/no-explicit-any */
import * as sinon from 'sinon'

const stubs = {
  callback: sinon.stub(),
  on: sinon.stub(),
  use: sinon.stub(),
}

const reset = () => {
  stubs.callback.resetHistory()
  stubs.on.resetHistory()
  stubs.use.resetHistory()
}

const Instance = class {
  public use(...args: any[]) {
    stubs.use(...args)
  }

  public on(...args: any[]) {
    stubs.on(...args)
  }

  public callback(...args: any[]) {
    stubs.callback(...args)
    return () => undefined
  }
}

export {stubs, Instance, reset}
