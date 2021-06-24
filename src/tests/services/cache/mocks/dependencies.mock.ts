/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import {Dependencies} from '../../../../services/cache/cacheHandler'
import * as Redis from 'ioredis'
import Immer from 'immer'
import * as LoghandlerMock from '../../../mocks/nodeModules/logHandler.mock'
import * as RedisMock from '../../../mocks/nodeModules/redis.mock'
import {Log} from 'loghandler'

export const dependencies: Dependencies = {
  Immer,
  Log: new LoghandlerMock.Instance() as unknown as Log,
  Redis: RedisMock.Instance as unknown as typeof Redis,
}

export const reset = () => {
  LoghandlerMock.reset()
  RedisMock.reset()
}

export const stubs = {
  loghandler: LoghandlerMock.stubs,
  redis: RedisMock.stubs,
}

export default {dependencies, reset, stubs}
