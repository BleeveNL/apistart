import * as chai from 'chai'
import index from '../index'

const assert = chai.assert

suite('Test plugin (index.ts).', () => {
  test('Returns as default "Hello World!"', () => {
    assert.equal(index, 'Hello World!')
  })
})
