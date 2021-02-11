/* eslint-disable no-useless-constructor */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import * as sinon from 'sinon'

const stubs = {
  client: sinon.stub(),
  loadServer: sinon.stub(),
  server: sinon.stub(),
  setup: sinon.stub(),
}

const reset = () => {
  stubs.client.reset()
  stubs.loadServer.reset()
  stubs.server.reset()
  stubs.setup.reset()
}

class Instance {
  public constructor(private enabled: boolean) {}

  public setup(...args: any[]) {
    stubs.setup(...args)

    return {
      client: this.enabled ? stubs.client : undefined,
      server: (...args2: any[]) => {
        stubs.server(...args2)
        return stubs.loadServer
      },
    }
  }
}

export {stubs, reset, Instance}
