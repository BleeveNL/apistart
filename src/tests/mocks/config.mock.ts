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
  services: {
    cache: {
      enabled: false,
    },
    database: {
      enabled: false,
    },
    queue: {
      enabled: false,
    },
  },
}

export const error = ({
  app: 'Broken Config',
  log: {
    reporters: [],
    reporting: {
      silent: true,
    },
  },
} as unknown) as Config

export const dbEnabled: Config<{
  cache: false
  db: true
  queue: false
}> = {
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
  services: {
    cache: {
      enabled: false,
    },
    database: {
      database: faker.random.word(),
      dialect: 'postgres',
      enabled: true,
      folder: {
        migrations: faker.system.filePath(),
        seeds: faker.system.filePath(),
      },
      models: [],
      password: faker.random.alphaNumeric(15),
      port: faker.random.number(),
      username: faker.random.alphaNumeric(15),
    },
    queue: {
      enabled: false,
    },
  },
}

export const queueEnabled: Config<{
  cache: false
  db: false
  queue: {
    enabled: true
    exchanges: 'test'
  }
}> = {
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
  services: {
    cache: {
      enabled: false,
    },
    database: {
      enabled: false,
    },
    queue: {
      enabled: true,
      exchanges: [
        {
          name: 'test',
          type: 'default',
        },
        {
          name: 'test2',
          type: 'default',
        },
      ],
    },
  },
}

export default {
  correct,
  dbEnabled,
  error,
  queueEnabled,
}
