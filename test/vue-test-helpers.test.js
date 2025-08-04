import { describe, test, expect, vi } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import deepmerge from 'deepmerge'
import { waitForWatch, commonMount } from '../src/vue-test-helpers.js'

// Mock @vue/test-utils
vi.mock('@vue/test-utils', () => ({
  shallowMount: vi.fn()
}))

// A mock Vue-like component
class MockVueComponent {
  constructor () {
    this._watchers = {}
    this.prop = 'initial'
  }

  $watch (prop, cb, options) {
    this._watchers[prop] = cb
    return () => delete this._watchers[prop]
  }

  $nextTick (cb) {
    Promise.resolve().then(cb)
  }

  // Helper to trigger watch
  _triggerWatch (prop, newVal, oldVal) {
    if (this._watchers[prop]) {
      this._watchers[prop](newVal, oldVal)
    }
  }
}

describe('vue-test-helpers', () => {
  describe('waitForWatch', () => {
    test('resolves when property changes', async () => {
      const vue = new MockVueComponent()
      const executor = () => {
        setTimeout(() => {
          const oldVal = vue.prop
          vue.prop = 'changed'
          vue._triggerWatch('prop', vue.prop, oldVal)
        }, 10)
      }
      const promise = waitForWatch(vue, 'prop', executor)
      await expect(promise).resolves.toEqual(['changed', 'initial'])
    })

    test('rejects on timeout', async () => {
      const vue = new MockVueComponent()
      const executor = () => {} // Don't do anything to trigger watch
      const promise = waitForWatch(vue, 'prop', executor)
      // default timeout is 100ms
      await expect(promise).rejects.toThrow('waitForWatch timed out')
    })
  })

  describe('commonMount', () => {
    test('calls shallowMount with default options', () => {
      const component = {}
      const defaultOpts = { propsData: { msg: 'hello' } }
      commonMount(component, defaultOpts)
      expect(shallowMount).toHaveBeenCalledWith(component, defaultOpts)
    })

    test('merges default and override options', () => {
      const component = {}
      const defaultOpts = { propsData: { msg: 'hello', val: 1 } }
      const overrideOpts = { propsData: { msg: 'world' } }
      const expectedOpts = deepmerge(defaultOpts, overrideOpts)
      commonMount(component, defaultOpts, overrideOpts)
      expect(shallowMount).toHaveBeenCalledWith(component, expectedOpts)
    })

    test('handles no overrides', () => {
      const component = {}
      const defaultOpts = { propsData: { msg: 'hello' } }
      commonMount(component, defaultOpts, undefined)
      expect(shallowMount).toHaveBeenCalledWith(component, defaultOpts)
    })
  })
})
