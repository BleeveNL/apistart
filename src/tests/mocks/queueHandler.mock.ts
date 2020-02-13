import * as sinon from 'sinon'

const stubs = {
  client: sinon.stub(),
  server: sinon.stub(),
  setup: sinon.stub(),
}

const reset = () => {
  stubs.client.reset()
  stubs.server.reset()
  stubs.setup.reset()
}

const Instance = class {
  public setup(...args: any[]) {
    return {
      ...this,
      ...stubs.setup(args),
    }
  }

  public client(...args: any[]) {
    return {
      ...this,
      ...stubs.client(args),
    }
  }

  public server(...args: any[]) {
    return {
      ...this,
      ...stubs.server(args),
    }
  }
}

export {stubs, reset, Instance}
