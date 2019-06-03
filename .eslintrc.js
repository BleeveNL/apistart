module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'prettier', 'import'],
  env: {
    es6: true,
    node: true,
    mocha: true,
  },
  extends: ['standard', 'plugin:@typescript-eslint/recommended', 'prettier', 'prettier/@typescript-eslint'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    sourceType: 'module',
    // project: './tsconfig.json',
  },
  rules: {
    'prettier/prettier': 2,
    '@typescript-eslint/explicit-function-return-type': 0,
    'sort-keys': 1,
  },
}
