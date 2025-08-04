import deepmerge from 'deepmerge'
import { shallowMount, Wrapper as VueWrapper } from '@vue/test-utils'
import { Component, ComponentPublicInstance } from 'vue'

export function waitForWatch<T> (
  vue: ComponentPublicInstance,
  prop: string,
  executor: () => void,
  opts?: any
): Promise<[T, T]> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('waitForWatch timed out')), 100)
    const unwatch = vue.$watch(
      prop,
      (v: T, o: T) => {
        unwatch()
        clearTimeout(timeout)
        vue.$nextTick(() => resolve([v, o]))
      },
      opts
    )
    executor()
  })
}

export function commonMount (
  component: Component,
  defaults: any,
  overrides: any = {}
): VueWrapper<any> {
  let opts = defaults
  if (overrides) {
    opts = deepmerge(defaults, overrides)
  }
  const wrapper = shallowMount(component, opts)
  return wrapper
}
