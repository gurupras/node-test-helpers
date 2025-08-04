import { describe, test, expect } from 'vitest'
import { randomString, sleep } from '../src/random.js'

describe('randomString', () => {
  test('returns a string of default length 20', () => {
    const str = randomString()
    expect(typeof str).toBe('string')
    expect(str.length).toBe(20)
  })

  test('returns a string with specified length', () => {
    const str = randomString(10, 10)
    expect(str.length).toBe(10)
  })

  test('returns a string within a range', () => {
    for (let i = 0; i < 100; i++) {
      const str = randomString(15, 5)
      expect(str.length).toBeGreaterThanOrEqual(5)
      expect(str.length).toBeLessThanOrEqual(15)
    }
  })
})

describe('sleep', () => {
  test('resolves after the given time', async () => {
    const start = Date.now()
    await sleep(100)
    const end = Date.now()
    expect(end - start).toBeGreaterThanOrEqual(95)
  })
})
