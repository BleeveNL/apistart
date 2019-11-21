/* eslint-disable @typescript-eslint/no-explicit-any */
import * as sinon from 'sinon'

const stubs = {
  ack: sinon.stub(),
  assertExchange: sinon.stub(),
  assertQueue: sinon.stub(),
  bindQueue: sinon.stub(),
  connect: sinon.stub(),
  consume: sinon.stub(),
  createChannel: sinon.stub(),
  nack: sinon.stub(),
  publish: sinon.stub(),
}

const reset = () => {
  stubs.assertExchange.reset()
  stubs.connect.reset()
  stubs.createChannel.reset()
  stubs.publish.reset()
  stubs.assertQueue.reset()
  stubs.bindQueue.reset()
  stubs.consume.reset()
  stubs.ack.reset()
  stubs.nack.reset()
}

const Instance = class {
  public ack(...args: any[]) {
    stubs.ack(...args)
    return this
  }

  public async assertExchange(...args: any[]) {
    stubs.assertExchange(...args)
    return this
  }

  public async assertQueue(...args: any[]) {
    return {
      ...this,
      ...stubs.assertQueue(...args),
    }
  }

  public async bindQueue(...args: any[]) {
    stubs.bindQueue(...args)
    return this
  }

  public async connect(...args: any[]) {
    stubs.connect(...args)
    return this
  }

  public async consume(...args: any[]) {
    stubs.consume(...args)
    return this
  }

  public async createChannel(...args: any[]) {
    stubs.createChannel(...args)
    return this
  }

  public nack(...args: any[]) {
    stubs.nack(...args)
    return this
  }

  public async publish(...args: any[]) {
    stubs.publish(...args)
    return this
  }
}

export {stubs, Instance, reset}

/* eslint-enable @typescript-eslint/no-explicit-any */
