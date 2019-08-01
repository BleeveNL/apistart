/* eslint-disable @typescript-eslint/no-explicit-any */
import * as sinon from 'sinon'

const stubs = {
  connect: sinon.stub(),

  constructor: sinon.stub(),
  on: sinon.stub(),
}

const reset = () => {
  stubs.connect.resetHistory()
  stubs.on.resetHistory()
  stubs.constructor.resetHistory()
}

const Instance = class {
  public constructor(...args: any[]) {
    stubs.constructor(...args)
  }

  public connect(...args: any[]) {
    stubs.connect(args)
  }

  public on(tag: string, callback: Function) {
    stubs.on(tag)

    if (tag === 'error') {
      callback(new Error('mocked error'))
    } else {
      callback()
    }
  }
}

export {stubs, Instance, reset}
