/* eslint-disable accessor-pairs */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import * as sinon from 'sinon'

interface KoaStubs {
  _vars: {[key: string]: any}
  callback: sinon.SinonStub<any[], any>
  constructor: sinon.SinonStub<any[], any>
  on: sinon.SinonStub<any[], any>
  use: sinon.SinonStub<any[], any>
}

const stubs: KoaStubs = {
  _vars: {},
  callback: sinon.stub(),
  constructor: sinon.stub(),
  on: sinon.stub(),
  use: sinon.stub(),
}

const reset = () => {
  stubs.callback.resetHistory()
  stubs.constructor.resetHistory()
  stubs.on.resetHistory()
  stubs.use.resetHistory()
  stubs._vars = {}
}

const Instance = class {
  public constructor(...args: any[]) {
    stubs.constructor(...args)
  }

  public use(...args: any[]) {
    return stubs.use(...args)
  }

  public on(...args: any[]) {
    return stubs.on(...args)
  }

  public callback(...args: any[]) {
    return stubs.callback(...args)
  }

  set env(value: any) {
    stubs._vars.env = value
  }

  set proxy(value: any) {
    stubs._vars.proxy = value
  }

  set subdomainOffset(value: any) {
    stubs._vars.subdomainOffset = value
  }

  set silent(value: any) {
    stubs._vars.silent = value
  }
}

export {stubs, Instance, reset}
