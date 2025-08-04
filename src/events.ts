interface TestEventOptions {
  count?: number;
  timeout?: number;
  vue?: boolean;
  on?: string;
  off?: string;
}

export async function testForEvent (obj: any, evt: string, opts: TestEventOptions = {}): Promise<any> {
  const { count = 1, timeout = 0, vue = false } = opts
  let { on = 'on', off = 'off' } = opts
  if (vue) {
    on = '$on'
    off = '$off'
  }
  return new Promise((resolve, reject) => {
    let rejectTimeout: NodeJS.Timeout
    let failed = true
    if (timeout) {
      rejectTimeout = setTimeout(() => {
        if (failed) {
          return reject(new Error('Timeout'))
        }
      }, timeout)
    }
    let counted = 0
    obj[on](evt, function listener (...args: any[]) {
      counted++
      if (!count || (count && counted === count)) {
        if (off) {
          obj[off](evt, listener)
        }
        failed = false
        rejectTimeout && clearTimeout(rejectTimeout)
        resolve(args.length > 1 ? args : args[0])
      }
    })
  })
}

export async function testForNoEvent (obj: any, evt: string, opts: TestEventOptions = {}): Promise<void> {
  if (!opts.timeout) {
    opts.timeout = 100
  }
  let failed = true
  try {
    await testForEvent(obj, evt, opts)
  } catch (e) {
    failed = false
  }
  if (failed) {
    throw new Error(`Received event '${evt}' when we should not have`)
  }
}
