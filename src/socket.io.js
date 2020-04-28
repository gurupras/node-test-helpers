const io = require('socket.io-client')
const { createUserJWT } = require('./jwt')
const { testForEvent } = require('./events')

async function setupSocket (user = 'dummy', port, opts) {
  let token
  const { withJWT = true, waitForConnect, noOpen = false } = opts
  const query = {}
  if (withJWT) {
    const jwtArgs = {}
    if (typeof user === 'string') {
      // We treat this as iss
      jwtArgs.iss = user
    } else {
      Object.assign(jwtArgs, user)
    }
    token = createUserJWT(jwtArgs)
    query.token = token
  }
  const socket = io(`http://localhost:${port}`, {
    query,
    autoconnect: false
  })
  if (noOpen) {
    return socket
  }
  if (waitForConnect) {
    const promise = testForEvent(socket, waitForConnect, { timeout: 300 })
    socket.open()
    await promise
  } else {
    socket.open()
  }
  return socket
}

module.exports = {
  setupSocket
}
