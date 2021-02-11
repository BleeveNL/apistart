/* eslint-disable @typescript-eslint/no-explicit-any */
import * as faker from 'faker'
import {Config} from '../../systemInterfaces/config'
import {Methods} from 'koa-advanced-router'
import {ApiStartSettings} from '../../systemInterfaces/apiStartSettings'

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

export const everythingEnabled: Config<
  ApiStartSettings<{
    cache: true
    database: true
    queue: {
      enabled: true
      exchanges: 'test' | 'test2'
    }
    webserver: {
      http: true
      https: true
      versionHandling: true
    }
  }>
> = {
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
      models: {},
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
          enabled: true,
          port: faker.random.number(),
        },
        https: {
          cert: {
            cert: faker.random.alphaNumeric(48),
            key: faker.random.alphaNumeric(48),
          },
          enabled: true,
          port: faker.random.number(),
        },
      },

      enabled: true,
      middleware: [],
      router: [],
      settings: {
        allowedMethods: faker.random.alphaNumeric(8) as any,
        bodyParser: faker.random.alphaNumeric(8) as any,
        cors: {
          allowCredentials: true,
          allowedHeaders: [faker.random.alphaNumeric(8)],
          allowedMethods: [Methods.put],
          allowedOrigin: faker.internet.url(),
          exposedHeaders: [faker.random.alphaNumeric(8)],
          maxAge: faker.random.number(),
        },
        expose: faker.random.alphaNumeric(8) as any,
        prefix: faker.random.alphaNumeric(8),
        proxy: false,
        sensitive: faker.random.alphaNumeric(8) as any,
        silent: faker.random.alphaNumeric(8) as any,
        subdomainOffset: faker.random.number(),
        versionHandler: faker.random.alphaNumeric(8) as any,
      },
      versions: [
        {
          enabled: true,
          identifier: '1.0',
          middleware: [],
          options: {
            cors: [
              {
                allowCredentials: true,
                allowedHeaders: [faker.random.alphaNumeric(8)],
                allowedMethods: [Methods.get],
                allowedOrigin: [faker.internet.url()],
                exposedHeaders: [faker.random.alphaNumeric(8)],
                maxAge: faker.random.number(),
              },
            ],
            sensitive: true,
          },
          router: [],
        },
      ],
    },
  },
}

export const everythingEnabledWithoutVersioning: Config<
  ApiStartSettings<{
    cache: true
    database: true
    queue: {
      enabled: true
      exchanges: 'test' | 'test2'
    }
    webserver: {
      http: true
      https: true
      versionHandling: false
    }
  }>
> = {
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
      models: {},
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
          enabled: true,
          port: faker.random.number(),
        },
        https: {
          cert: {
            cert: faker.random.alphaNumeric(48),
            key: faker.random.alphaNumeric(48),
          },
          enabled: true,
          port: faker.random.number(),
        },
      },

      enabled: true,
      middleware: [],
      router: [],
      settings: {
        allowedMethods: faker.random.alphaNumeric(8) as any,
        bodyParser: faker.random.alphaNumeric(8) as any,
        cors: {
          allowCredentials: true,
          allowedHeaders: [faker.random.alphaNumeric(8)],
          allowedMethods: [Methods.put],
          allowedOrigin: faker.internet.url(),
          exposedHeaders: [faker.random.alphaNumeric(8)],
          maxAge: faker.random.number(),
        },
        expose: faker.random.alphaNumeric(8) as any,
        proxy: false,
        sensitive: faker.random.alphaNumeric(8) as any,
        silent: faker.random.alphaNumeric(8) as any,
        subdomainOffset: faker.random.number(),
        versionHandler: false,
      },
    },
  },
}

export default {
  correct: {
    everythingDisabled,
    everythingEnabled,
    everythingEnabledWithoutVersioning,
  },
  error,
}
