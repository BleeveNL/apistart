/* eslint-disable @typescript-eslint/no-explicit-any */
import * as sinon from 'sinon'
import * as faker from 'faker'

const stubs = {
  init: sinon.stub(),
  sync: sinon.stub(),
}

const reset = () => {
  stubs.init.reset()
  stubs.sync.reset()
}

const Instance = class {
  public file!: string

  public round!: number

  public id!: number

  public createdAt!: number

  public updatedAt!: number

  public static readonly structure = {test: faker.random.alphaNumeric(64)}

  public static readonly settings = {test: faker.random.alphaNumeric(64)}

  public static init(...args: any[]) {
    return stubs.init(...args)
  }

  public static sync(...args: any[]) {
    return stubs.sync(...args)
  }
}

export {stubs, reset, Instance}
