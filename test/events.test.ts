import { describe, test, expect, beforeEach } from 'vitest'
import Emittery from 'emittery'
import { testForEvent, testForNoEvent, sleep } from '../src/index.js'

function Vue () {
  const vueObj = new Emittery() as any
  vueObj.$on = vueObj.on.bind(vueObj)
  vueObj.$off = vueObj.off.bind(vueObj)
  vueObj.$once = vueObj.once.bind(vueObj)
  vueObj.$emit = vueObj.emit.bind(vueObj)
  delete vueObj.on
  delete vueObj.off
  delete vueObj.once
  delete vueObj.emit
  return vueObj
}

let event: string
beforeEach(() => {
  event = 'test'
})

const cases = [
  ['EventEmitter', new Emittery(), 'emit', false],
  ['Vue-like', Vue(), '$emit', true]
]
describe('Events', () => {
  describe('testForEvent', () => {
    describe.each(cases)('cases', (type, obj, fn, vue) => {
      test(`Works with ${type} API`, async () => {
        const promise = testForEvent(obj, event, { vue })
        obj[fn](event)
        await expect(promise).resolves.toBeUndefined()
      })
      test(`[${type}]: Works with count`, async () => {
        const promise = testForEvent(obj, event, { vue, count: 2 })
        obj[fn](event)
        obj[fn](event)
        await expect(promise).resolves.toBeUndefined()
      })
      test(`[${type}]: Custom timeout`, async () => {
        const timeout = 500
        const promise = testForEvent(obj, event, { timeout, vue })
        await sleep(350)
        obj.emit(event)
        await expect(promise).resolves.toBeUndefined()
      })
      test(`[${type}]: Fails on timeout`, async () => {
        const promise = testForEvent(obj, event, { timeout: 100, vue })
        await expect(promise).rejects.toThrow()
      })
      test(`[${type}]: Does not fail if 'off' is not defined`, async () => {
        const promise = testForEvent(obj, event, { vue, off: undefined })
        obj[fn](event)
        await expect(promise).resolves.toBeUndefined()
      })
    })
    test('Passing no options works as expected', async () => {
      const obj = new Emittery()
      const promise = testForEvent(obj, event)
      obj.emit(event)
      await expect(promise).resolves.toBeUndefined()
    })
  })
  describe('testForNoEvent', () => {
    describe.each(cases)('cases', (type, obj, fn, vue) => {
      test(`Works with ${type} API`, async () => {
        const promise = testForNoEvent(obj, event, { vue })
        await expect(promise).resolves.toBeUndefined()
      })
      test(`[${type}]: Fails if event is received`, async () => {
        const promise = testForNoEvent(obj, event, { timeout: 10000, vue })
        obj[fn](event)
        await expect(promise).rejects.toThrow()
      })
      test(`[${type}]: Custom timeout`, async () => {
        const timeout = 500
        const promise = testForEvent(obj, event, { timeout, vue })
        await sleep(400)
        obj.emit(event)
        await expect(promise).resolves.toBeUndefined()
      })
      test(`[${type}]: Does not fail if 'off' is not defined`, async () => {
        const promise = testForNoEvent(obj, event, { vue, off: undefined })
        await expect(promise).resolves.toBeUndefined()
      })
    })
    test('Passing no options works as expected', async () => {
      const obj = new Emittery()
      const promise = testForNoEvent(obj, event)
      await expect(promise).resolves.toBeUndefined()
    })
  })
})
