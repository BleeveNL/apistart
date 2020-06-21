/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import * as sinon from 'sinon'

const stubs = {
  alert: sinon.stub(),
  crit: sinon.stub(),
  debug: sinon.stub(),
  emerg: sinon.stub(),
  err: sinon.stub(),
  info: sinon.stub(),
  notice: sinon.stub(),
  warn: sinon.stub(),
}

const reset = () => {
  stubs.alert.reset()
  stubs.crit.reset()
  stubs.debug.reset()
  stubs.emerg.reset()
  stubs.err.reset()
  stubs.info.reset()
  stubs.notice.reset()
  stubs.warn.reset()
}

const Instance = class {
  public alert(...args: any[]) {
    stubs.alert(...args)
  }

  public crit(...args: any[]) {
    stubs.crit(...args)
  }

  public debug(...args: any[]) {
    stubs.debug(...args)
  }

  public emerg(...args: any[]) {
    stubs.emerg(...args)
  }

  public err(...args: any[]) {
    stubs.err(...args)
  }

  public info(...args: any[]) {
    stubs.info(...args)
  }

  public notice(...args: any[]) {
    stubs.notice(...args)
  }

  public warn(...args: any[]) {
    stubs.warn(...args)
  }
}

export {stubs, Instance, reset}
