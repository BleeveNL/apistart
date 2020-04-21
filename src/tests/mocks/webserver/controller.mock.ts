/* eslint-disable @typescript-eslint/no-explicit-any */
import * as sinon from 'sinon'

const stubs = {
  controller: sinon.stub(),
  setup: sinon.stub(),
}

const reset = () => {
  stubs.setup.reset()
  stubs.controller.reset()
}

const Instance = (...args: any[]) => {
  stubs.setup(...args)
  return (...args: any[]) => {
    return stubs.controller(...args)
  }
}

export {stubs, reset, Instance}
