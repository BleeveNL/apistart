import { QueueEventListener } from "../../../../services/queue/interfaces"
import * as sinon from 'sinon'
import * as faker from 'faker'

const stubs  = {
    dependencies: sinon.stub(),
    handler: sinon.stub()
}

const reset = () => {
    stubs.dependencies.reset()
    stubs.handler.reset()
}

 const Instance: QueueEventListener<any, any, any, any> = {
  dependencies: (...args: any) => {
      return stubs.dependencies(args)
  },
  exchange: 'test',
  handler: async (...args: any) => {
    return stubs.handler(args)
  },
  routingKey: faker.random.alphaNumeric(8),
  settings: {
    consume: {},
    queue: {}
  },
}

export {stubs, reset, Instance}
