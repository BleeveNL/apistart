/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import * as sinon from 'sinon'

const stubs = {
  param: sinon.stub(),
  setup: sinon.stub(),
}

const reset = () => {
  stubs.setup.reset()
  stubs.param.reset()
}

const Instance = (...args: any[]) => {
  stubs.setup(...args)
  return (...args: any[]) => {
    return stubs.param(...args)
  }
}

export {stubs, reset, Instance}
