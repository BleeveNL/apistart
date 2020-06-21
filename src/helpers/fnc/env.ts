export const env = (name: string): string => {
  if (name in process.env) {
    const env = process.env[name] as string
    return env
  }
  throw new Error(`Environment variable "${name}" isn't set.`)
}

export default env
