module.exports = {
  env: {
    es6: true,
    mocha: true,
    node: true,
  },
  extends: ['standard', 'plugin:@typescript-eslint/recommended', 'prettier'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'prettier', 'import'],
  root: true,
  rules: {
    '@typescript-eslint/explicit-function-return-type': 0,
    'prettier/prettier': 2,
    'sort-keys': 1,
  },
}
