import io, { Socket } from 'socket.io-client'
import { createUserJWT } from './jwt.js'
import { testForEvent } from './events.js'

interface SetupSocketOptions {
  withJWT?: boolean;
  waitForConnect?: string;
  noOpen?: boolean;
}

export async function setupSocket (
  user: string | { iss: string; [key: string]: any } = 'dummy',
  port: number,
  opts: SetupSocketOptions = {}
): Promise<Socket> {
  let token: string
  const { withJWT = true, waitForConnect, noOpen = false } = opts
  const query: { token?: string } = {}
  if (withJWT) {
    const jwtArgs: { iss: string; [key: string]: any } = { iss: '' }
    if (typeof user === 'string') {
      jwtArgs.iss = user
    } else {
      Object.assign(jwtArgs, user)
    }
    token = createUserJWT(jwtArgs)
    query.token = token
  }
  const socket = io(`http://localhost:${port}`, {
    query,
    autoConnect: false,
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
