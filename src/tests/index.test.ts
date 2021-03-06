import {assert} from 'chai'
import apiStart from '../index'
import mockedConfig from './mocks/config.mock'
import Microservice from '../microservice'

suite('Test plugin (index.ts).', () => {
  test('is function"', () => {
    assert.isFunction(apiStart)
  })

  test('Allows 1 Parameter', () => {
    assert.equal(apiStart.length, 2)
  })

  test("Throws error when given parameter isn't a valid configuration", () => {
    assert.throw(() => apiStart(mockedConfig.error, {}))
  })

  test('Returns instanceOf Microservice when correct config is given', async () => {
    assert.instanceOf(await apiStart(mockedConfig.correct.everythingDisabled, {}), Microservice)
  })
})
