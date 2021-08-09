export const env = (name: string, defaultValue: string | undefined): string => {
  if (name in process.env) {
    return process.env[name] as string
  }
  if (defaultValue) {
    return defaultValue
  }
  throw new Error(`Environment variable "${name}" isn't set.`)
}

export default env
