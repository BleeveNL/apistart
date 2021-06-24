import {Models} from './models.interface'
import {EntityRepository} from '@mikro-orm/core'

export type EntityRepositoryList<Type extends Models> = {
  readonly [Property in keyof Type]: EntityRepository<Type[Property]>
}
