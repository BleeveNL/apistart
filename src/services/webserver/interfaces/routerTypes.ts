export enum Methods {
  connect = 'CONNECT',
  delete = 'DELETE',
  get = 'GET',
  head = 'HEAD',
  options = 'OPTIONS',
  patch = 'PATCH',
  post = 'POST',
  put = 'PUT',
  trace = 'TRACE',
}

export type VersionMatchingFunction = (identifier: string, ctx: any) => boolean

export interface VersionOptions {
  readonly cors?: any
  readonly sensitive?: boolean
}

export interface RouterOptions {
  readonly allowedMethods?: boolean
  readonly cors?: any
  readonly expose?: boolean
  readonly prefix?: string
  readonly sensitive?: boolean
  readonly versionHandler?: 'url' | 'header' | VersionMatchingFunction | false
}
