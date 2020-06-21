/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import * as sinon from 'sinon'

const stubs = {
  middleware: sinon.stub(),
  setup: sinon.stub(),
}

const reset = () => {
  stubs.setup.reset()
  stubs.middleware.reset()
}

const Instance = (...args: any[]) => {
  stubs.setup(...args)
  return (...args: any[]) => {
    return stubs.middleware(...args)
  }
}

export {stubs, reset, Instance}
