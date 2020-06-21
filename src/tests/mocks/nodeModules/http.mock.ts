/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import * as sinon from 'sinon'

const stubs = {
  createServer: sinon.stub(),
  emit: sinon.stub(),
  listen: sinon.stub(),
}

const reset = () => {
  stubs.createServer.reset()
  stubs.listen.reset()
  stubs.emit.reset()
}

const Instance = class {
  public createServer(...args: any[]) {
    stubs.createServer(...args)
    return {
      listen: (...args: any[]) => {
        stubs.listen(...args)
        args[1]()
        return {
          emit: (...args: any[]) => {
            stubs.emit(...args)
          },
        }
      },
    }
  }
}

export {stubs, Instance, reset}
