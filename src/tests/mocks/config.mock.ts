import {faker} from '@faker-js/faker'
import {Config} from '../../systemInterfaces/config'
import {Methods} from '../../services/webserver/interfaces/routerTypes'
import {ApiStartSettings} from '../../systemInterfaces/apiStartSettings'

export const everythingDisabled: Config = {
  app: {
    env: faker.string.alphanumeric(8),
    name: faker.string.alphanumeric(8),
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
    queue: {
      enabled: false,
    },
    webserver: {
      enabled: false,
    },
  },
}

export const error = {
  app: 'Broken Config',
  log: {
    reporters: [],
    reporting: {
      silent: true,
    },
  },
} as unknown as Config

export const everythingEnabled: Config<
  ApiStartSettings<{
    cache: true
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
    env: faker.string.alphanumeric(8),
    name: faker.string.alphanumeric(8),
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
          port: faker.number.int({max: 99999}),
        },
        https: {
          cert: {
            cert: faker.string.alphanumeric(48),
            key: faker.string.alphanumeric(48),
          },
          enabled: true,
          port: faker.number.int({max: 99999}),
        },
      },

      enabled: true,
      middleware: [],
      router: [],
      settings: {
        allowedMethods: faker.string.alphanumeric(8) as any,
        bodyParser: faker.string.alphanumeric(8) as any,
        cors: {
          allowCredentials: true,
          allowedHeaders: [faker.string.alphanumeric(8)],
          allowedMethods: [Methods.put],
          allowedOrigin: faker.internet.url(),
          exposedHeaders: [faker.string.alphanumeric(8)],
          maxAge: faker.number.int({max: 99999}),
        },
        expose: faker.string.alphanumeric(8) as any,
        prefix: faker.string.alphanumeric(8),
        proxy: false,
        sensitive: faker.string.alphanumeric(8) as any,
        silent: faker.string.alphanumeric(8) as any,
        subdomainOffset: faker.number.int({max: 99999}),
        versionHandler: faker.string.alphanumeric(8) as any,
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
                allowedHeaders: [faker.string.alphanumeric(8)],
                allowedMethods: [Methods.get],
                allowedOrigin: [faker.internet.url()],
                exposedHeaders: [faker.string.alphanumeric(8)],
                maxAge: faker.number.int({max: 99999}),
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
    env: faker.string.alphanumeric(8),
    name: faker.string.alphanumeric(8),
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
          port: faker.number.int({max: 99999}),
        },
        https: {
          cert: {
            cert: faker.string.alphanumeric(48),
            key: faker.string.alphanumeric(48),
          },
          enabled: true,
          port: faker.number.int({max: 99999}),
        },
      },

      enabled: true,
      middleware: [],
      router: [],
      settings: {
        allowedMethods: faker.string.alphanumeric(8) as any,
        bodyParser: faker.string.alphanumeric(8) as any,
        cors: {
          allowCredentials: true,
          allowedHeaders: [faker.string.alphanumeric(8)],
          allowedMethods: [Methods.put],
          allowedOrigin: faker.internet.url(),
          exposedHeaders: [faker.string.alphanumeric(8)],
          maxAge: faker.number.int({max: 99999}),
        },
        expose: faker.string.alphanumeric(8) as any,
        proxy: false,
        sensitive: faker.string.alphanumeric(8) as any,
        silent: faker.string.alphanumeric(8) as any,
        subdomainOffset: faker.number.int({max: 99999}),
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
