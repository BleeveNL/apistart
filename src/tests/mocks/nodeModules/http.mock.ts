/* eslint-disable @typescript-eslint/no-explicit-any */
import * as sinon from 'sinon'

const stubs = {
  createServer: sinon.stub(),
  listen: sinon.stub(),
}

const reset = () => {
  stubs.createServer.resetHistory()
  stubs.listen.resetHistory()
}

const Instance = class {
  public createServer(...args: any[]) {
    stubs.createServer(...args)
    return {
      listen: (port: number, callback: Function) => {
        stubs.listen(port)
        setTimeout(callback, 1)
        return this
      },
    }
  }
}

export {stubs, Instance, reset}
