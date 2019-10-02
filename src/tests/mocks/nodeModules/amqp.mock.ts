/* eslint-disable @typescript-eslint/no-explicit-any */
import * as sinon from 'sinon'

const stubs = {
  assertExchange: sinon.stub(),
  connect: sinon.stub(),
  createChannel: sinon.stub(),
  publish: sinon.stub(),
}

const reset = () => {
  stubs.assertExchange.reset()
  stubs.connect.reset()
  stubs.createChannel.reset()
  stubs.publish.reset()
}

const Instance = class {
  public async assertExchange(...args: any[]) {
    stubs.assertExchange(...args)
    return this
  }
  
  public async connect(...args: any[]) {
    stubs.connect(...args)
    return this
  }

  public async createChannel(...args: any[]) {
    stubs.createChannel(...args)
    return this
  }

  public async publish(...args: any[]) {
    stubs.publish(...args)
    return this
  }

}

export {stubs, Instance, reset}
