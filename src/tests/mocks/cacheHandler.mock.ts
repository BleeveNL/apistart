/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import * as sinon from 'sinon'

const stubs = {
  constructor: sinon.stub(),
  setup: sinon.stub(),
}

const reset = () => {
  stubs.constructor.resetHistory()
  stubs.setup.resetHistory()
}

const Instance = class {
  public constructor(...args: any[]) {
    stubs.constructor(...args)
  }

  public setup(...args: any[]) {
    return stubs.setup(...args)
  }
}

export {stubs, reset, Instance}
