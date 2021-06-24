import {EntityClass, AnyEntity} from '@mikro-orm/core/typings'

export interface Models {
  readonly [key: string]: EntityClass<AnyEntity>
}
