import { describe, test, expect, vi, beforeEach } from 'vitest'
import { setupSocket } from '../src/socket.io.js'
import { createUserJWT } from '../src/jwt.js'
import io from 'socket.io-client'
import { testForEvent } from '../src/events.js'

// Mock socket.io-client
const mockSocket = {
  on: vi.fn(),
  open: vi.fn(),
  emit: vi.fn()
}
vi.mock('socket.io-client', () => ({
  default: vi.fn(() => mockSocket)
}))

// Mock jwt
vi.mock('../src/jwt.js', async () => {
  const actual = await vi.importActual('../src/jwt.js')
  return {
    ...actual,
    createUserJWT: vi.fn(() => 'test-jwt-token')
  }
})

// Mock events
vi.mock('../src/events.js', () => ({
  testForEvent: vi.fn(() => Promise.resolve())
}))

describe('setupSocket', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('should create a socket with default options', async () => {
    const socket = await setupSocket('test-user', 3000, {})
    expect(io).toHaveBeenCalledWith('http://localhost:3000', {
      query: { token: 'test-jwt-token' },
      autoConnect: false
    })
    expect(createUserJWT).toHaveBeenCalledWith({ iss: 'test-user' })
    expect(socket.open).toHaveBeenCalled()
    expect(socket).toBe(mockSocket)
  })

  test('should handle user object for JWT', async () => {
    const user = { iss: 'test-user', sub: 'test-sub' }
    await setupSocket(user, 3000, {})
    expect(createUserJWT).toHaveBeenCalledWith(user)
  })

  test('should not include JWT if withJWT is false', async () => {
    await setupSocket('test-user', 3000, { withJWT: false })
    expect(io).toHaveBeenCalledWith('http://localhost:3000', {
      query: {},
      autoConnect: false
    })
    expect(createUserJWT).not.toHaveBeenCalled()
  })

  test('should not open socket if noOpen is true', async () => {
    const socket = await setupSocket('test-user', 3000, { noOpen: true })
    expect(socket.open).not.toHaveBeenCalled()
  })

  test('should wait for connect event if waitForConnect is provided', async () => {
    await setupSocket('test-user', 3000, { waitForConnect: 'connect' })
    expect(testForEvent).toHaveBeenCalledWith(mockSocket, 'connect', { timeout: 300 })
    expect(mockSocket.open).toHaveBeenCalled()
  })
})
