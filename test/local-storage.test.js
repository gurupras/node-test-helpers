import { describe, test, expect, beforeEach } from 'vitest'
import LocalStorageMock from '../src/local-storage.js'

describe('LocalStorageMock', () => {
  let localStorageMock
  beforeEach(() => {
    localStorageMock = new LocalStorageMock()
  })

  test('setItem and getItem', () => {
    localStorageMock.setItem('key', 'value')
    expect(localStorageMock.getItem('key')).toBe('value')
  })

  test('getItem for non-existent key returns null', () => {
    expect(localStorageMock.getItem('non-existent')).toBe(null)
  })

  test('setItem converts value to string', () => {
    localStorageMock.setItem('number', 123)
    expect(localStorageMock.getItem('number')).toBe('123')
    localStorageMock.setItem('object', { a: 1 })
    expect(localStorageMock.getItem('object')).toBe('[object Object]')
  })

  test('removeItem', () => {
    localStorageMock.setItem('key', 'value')
    localStorageMock.removeItem('key')
    expect(localStorageMock.getItem('key')).toBe(null)
  })

  test('clear', () => {
    localStorageMock.setItem('key1', 'value1')
    localStorageMock.setItem('key2', 'value2')
    localStorageMock.clear()
    expect(localStorageMock.getItem('key1')).toBe(null)
    expect(localStorageMock.getItem('key2')).toBe(null)
    expect(Object.keys(localStorageMock.store).length).toBe(0)
  })
})
