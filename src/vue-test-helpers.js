const deepmerge = require('deepmerge')
const { shallowMount } = require('@vue/test-utils')

function waitForWatch (vue, prop, executor, opts) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('waitForWatch timed out')), 100)
    const unwatch = vue.$watch(prop, (v, o) => {
      unwatch()
      clearTimeout(timeout)
      vue.$nextTick(() => resolve([v, o]))
    }, opts)
    executor()
  })
}

function commonMount (component, defaults, overrides = {}) {
  let opts = defaults
  if (overrides) {
    opts = deepmerge(defaults, overrides)
  }
  const wrapper = shallowMount(component, opts)
  return wrapper
}

module.exports = {
  waitForWatch,
  commonMount
}
