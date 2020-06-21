import env from './fnc/env'
import loadEnv from './fnc/loadEnv'

export default interface SystemHelpers {
  env: typeof env
  loadEnv: typeof loadEnv
}
