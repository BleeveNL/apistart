/* eslint-disable @typescript-eslint/no-explicit-any */
import * as sinon from 'sinon'

const stubs = {
  connect: sinon.stub(),
}

const reset = () => {
  stubs.connect.reset()
}

const Instance = class {
  public async connect(...args: any[]) {
    stubs.connect(...args)
    return this
  }
}

export {stubs, Instance, reset}
