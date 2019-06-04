/* eslint-disable @typescript-eslint/no-explicit-any */
import * as sinon from 'sinon'

const stubs = {
  fnc: sinon.stub(),
}

const reset = () => {
  stubs.fnc.resetHistory()
}

const fnc = (...middlewareArgs: any[]) => {
  stubs.fnc(...middlewareArgs)
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  return new Instance()
}

class Instance {
  public readonly fnc = fnc
}

export {stubs, reset, fnc, Instance}
