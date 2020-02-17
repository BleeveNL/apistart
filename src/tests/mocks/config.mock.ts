import * as faker from 'faker'
import {Config} from '../../systemInterfaces/config'

export const everythingDisabled: Config = {
  app: {
    env: faker.random.alphaNumeric(8),
    name: faker.random.alphaNumeric(8),
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
    webserver: {
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

export const everythingEnabled: Config<{
  cache: true
  db: true
  queue: {
    enabled: true
    exchanges: 'test' | 'test2'
  }
  webserver: true
}> = {
  app: {
    env: faker.random.alphaNumeric(8),
    name: faker.random.alphaNumeric(8),
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
      enabled: true,
      host: faker.internet.domainName(),
      port: 1234,
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
    webserver: {
      connection: {
        http: {
          enabled: false,
        },
        https: {
          enabled: false,
        },
      },

      enabled: true,
      settings: {
        proxy: false,
        subdomainOffset: faker.random.number(),
        versionHandler: 'url',
      },
    },
  },
}

export default {
  correct: {
    everythingDisabled,
    everythingEnabled,
  },
  error,
}
