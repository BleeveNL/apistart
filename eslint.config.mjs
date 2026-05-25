import { defineConfig, globalIgnores } from 'eslint/config'
import typescriptEslint from '@typescript-eslint/eslint-plugin'
import prettier from 'eslint-plugin-prettier'
import tsParser from '@typescript-eslint/parser'

export default defineConfig([
  globalIgnores([
    '**/node_modules',
    '**/lib/',
    '**/coverage/',
    '**/yarn.lock',
    '**/prettier.config.js',
    '**/wallaby.conf.js',
  ]),
  {
    plugins: {
      '@typescript-eslint': typescriptEslint,
      prettier,
    },

    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2020,
      sourceType: 'module',
    },

    rules: {
      'prettier/prettier': 'error',
    },
  },
])
