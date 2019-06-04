import * as faker from 'faker'
import {Config} from '../../systemInterfaces/config'

export const correct: Config = {
  app: {
    env: faker.lorem.word(),
    name: faker.lorem.slug(),
    version: faker.system.semver(),
  },
  log: {
    reporters: [],
    reporting: {
      silent: true,
    },
  },
  storage: {
    cache: {
      enabled: false,
    },
  },
}

export const error = ({
  app: 'hello World!',
  log: {
    reporters: [],
    reporting: {
      silent: true,
    },
  },
} as unknown) as Config

export default {
  correct,
  error,
}
