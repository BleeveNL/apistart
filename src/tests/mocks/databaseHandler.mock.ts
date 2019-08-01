/* eslint-disable @typescript-eslint/no-explicit-any */
import * as sinon from 'sinon'

const stubs = {
  getModels: sinon.stub(),
  setup: sinon.stub(),
}

const reset = () => {
  stubs.setup.reset()
  stubs.getModels.reset()
}

const Instance = class {
  public file!: string

  public setup(...args: any[]) {
    return stubs.setup(...args)
  }

  public getModels(...args: any[]) {
    return stubs.getModels(...args)
  }
}

export {stubs, reset, Instance}
