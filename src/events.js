async function testForEvent (obj, evt, opts = {}) {
  const { count = 1, timeout = 0, vue = false } = opts
  let { on = 'on', off = 'off' } = opts
  if (vue) {
    on = '$on'
    off = '$off'
  }
  return new Promise((resolve, reject) => {
    let rejectTimeout
    let failed = true
    if (timeout) {
      rejectTimeout = setTimeout(() => {
        if (failed) {
          return reject(new Error('Timeout'))
        }
      }, timeout)
    }
    var counted = 0
    obj[on](evt, function listener (...args) {
      counted++
      if (!count || (count && counted === count)) {
        if (off) {
          obj[off](evt, listener)
        }
        failed = false
        rejectTimeout && clearTimeout(rejectTimeout)
        resolve(...args)
      }
    })
  })
}

async function testForNoEvent (obj, evt, opts = {}) {
  // We absolutely need a timeout here
  if (!opts.timeout) {
    opts.timeout = 100
  }
  let failed = true
  try {
    // This _should_ throw
    await testForEvent(obj, evt, opts)
  } catch (e) {
    failed = false
  }
  if (failed) {
    throw new Error(`Received event '${evt}' when we should not have`)
  }
}

module.exports = {
  testForEvent,
  testForNoEvent
}
