/* eslint-disable @typescript-eslint/no-explicit-any */
import * as sinon from 'sinon'

const stubs = {
  fn: sinon.stub(),
}

const reset = () => {
  stubs.fn.resetHistory()
}

class Instance {
  public fn(...args: any[]) {
    stubs.fn(...args)

    return new Instance() as any
  }
}

const fn = new Instance().fn

export {stubs, reset, fn, Instance}
