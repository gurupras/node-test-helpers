import Emittery from 'emittery'
import { testForEvent, testForNoEvent, sleep } from '../index'

function Vue () {
  const vueObj = new Emittery()
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

let event
beforeEach(() => {
  event = 'test'
})

const cases = [
  ['EventEmitter', new Emittery(), 'emit', false],
  ['Vue-like', new Vue(), '$emit', true]
]
describe('Events', () => {
  describe('testForEvent', () => {
    describe.each(cases)('cases', (type, obj, fn, vue) => {
      test(`Works with ${type} API`, async () => {
        const promise = testForEvent(obj, event, { vue })
        obj[fn](event)
        await expect(promise).toResolve()
      })
      test(`[${type}]: Works with count`, async () => {
        const promise = testForEvent(obj, event, { vue, count: 2 })
        obj[fn](event)
        obj[fn](event)
        await expect(promise).toResolve()
      })
      test(`[${type}]: Custom timeout`, async () => {
        const timeout = 500
        const promise = testForEvent(obj, event, { timeout, vue })
        await sleep(350)
        obj.emit(event)
        await expect(promise).toResolve()
      })
      test(`[${type}]: Fails on timeout`, async () => {
        const promise = testForEvent(obj, event, { timeout: 100, vue })
        await expect(promise).toReject()
      })
      test(`[${type}]: Does not fail if 'off' is not defined`, async () => {
        const promise = testForEvent(obj, event, { vue, off: null })
        obj[fn](event)
        await expect(promise).toResolve()
      })
    })
    test('Passing no options works as expected', async () => {
      const obj = new Emittery()
      const promise = testForEvent(obj, event)
      obj.emit(event)
      await expect(promise).toResolve()
    })
  })
  describe('testForNoEvent', () => {
    describe.each(cases)('cases', (type, obj, fn, vue) => {
      test(`Works with ${type} API`, async () => {
        const promise = testForNoEvent(obj, event, { vue })
        await expect(promise).toResolve()
      })
      test(`[${type}]: Fails if event is received`, async () => {
        const promise = testForNoEvent(obj, event, { timeout: 10000, vue })
        obj[fn](event)
        await expect(promise).toReject()
      })
      test(`[${type}]: Custom timeout`, async () => {
        const timeout = 500
        const promise = testForEvent(obj, event, { timeout, vue })
        await sleep(400)
        obj.emit(event)
        await expect(promise).toResolve()
      })
      test(`[${type}]: Does not fail if 'off' is not defined`, async () => {
        const promise = testForNoEvent(obj, event, { vue, off: null })
        await expect(promise).toResolve()
      })
    })
    test('Passing no options works as expected', async () => {
      const obj = new Emittery()
      const promise = testForNoEvent(obj, event)
      await expect(promise).toResolve()
    })
  })
})
