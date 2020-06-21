/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import * as sinon from 'sinon'

const stubs = {
  setup: sinon.stub(),
}

const reset = () => {
  stubs.setup.reset()
}

const Instance = class {
  public setup(...args: any[]) {
    return {
      ...this,
      ...stubs.setup(args),
    }
  }
}

export {stubs, reset, Instance}
