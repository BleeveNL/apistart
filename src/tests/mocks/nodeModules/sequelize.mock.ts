/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import * as sinon from 'sinon'

const stubs = {
  authenticate: sinon.stub(),
  constructor: sinon.stub(),
}

const reset = () => {
  stubs.constructor.reset()
  stubs.authenticate.reset()
}

const Instance = class {
  public constructor(...args: any[]) {
    stubs.constructor(...args)
    return this
  }

  public async authenticate(...args: any[]) {
    stubs.authenticate(...args)
    return this
  }
}

export {stubs, Instance, reset}
