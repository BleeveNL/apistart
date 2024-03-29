/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import {QueueEventListener} from '../../../../services/queue/interfaces/queueEventListener.interface'
import * as sinon from 'sinon'
import * as faker from 'faker'

const stubs = {
  dependencies: sinon.stub(),
  handler: sinon.stub(),
}

const reset = () => {
  stubs.dependencies.reset()
  stubs.handler.reset()
}

const Instance: QueueEventListener<any, any> = {
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
    queue: {
      name: faker.random.alphaNumeric(8),
    },
  },
}

export {stubs, reset, Instance}
/* eslint-enable @typescript-eslint/no-explicit-any */
