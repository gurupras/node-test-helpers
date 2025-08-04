import { describe, test, expect, vi } from 'vitest'
import { MockSocket, createMockSocketPair } from '../src/fake-socket.io-sockets.js'

describe('createMockSocketPair', () => {
  test('should return a pair of MockSocket instances', () => {
    const { serverSocket, clientSocket } = createMockSocketPair()
    expect(serverSocket).toBeInstanceOf(MockSocket)
    expect(clientSocket).toBeInstanceOf(MockSocket)
  })

  test('sockets should be peered with each other', () => {
    const { serverSocket, clientSocket } = createMockSocketPair()
    const serverCallback = vi.fn()
    const clientCallback = vi.fn()

    serverSocket.on('from-client', serverCallback)
    clientSocket.on('from-server', clientCallback)

    clientSocket.emit('from-client', 'hello server')
    expect(serverCallback).toHaveBeenCalledWith('hello server')

    serverSocket.emit('from-server', 'hello client')
    expect(clientCallback).toHaveBeenCalledWith('hello client')
  })
})

describe('MockSocket', () => {
  test('on should register an event listener', () => {
    const socket = new MockSocket()
    const callback = vi.fn()
    socket.on('test-event', callback)
    socket._trigger('test-event', 'data')
    expect(callback).toHaveBeenCalledWith('data')
  })

  test('emit should trigger event on peer', () => {
    const { serverSocket, clientSocket } = createMockSocketPair()
    const callback = vi.fn()
    clientSocket.on('test-event', callback)
    serverSocket.emit('test-event', 'data')
    expect(callback).toHaveBeenCalledWith('data')
  })

  test('emit should not throw if peer is not set', () => {
    const socket = new MockSocket()
    expect(() => socket.emit('test-event', 'data')).not.toThrow()
  })

  test('multiple arguments can be passed', () => {
    const { serverSocket, clientSocket } = createMockSocketPair()
    const callback = vi.fn()
    clientSocket.on('test-event', callback)
    serverSocket.emit('test-event', 'arg1', 'arg2', { id: 1 })
    expect(callback).toHaveBeenCalledWith('arg1', 'arg2', { id: 1 })
  })

  describe('removeAllListeners', () => {
    test('should remove all listeners for a specific event', () => {
      const socket = new MockSocket()
      const callback1 = vi.fn()
      const callback2 = vi.fn()
      const callback3 = vi.fn()

      socket.on('event1', callback1)
      socket.on('event1', callback2)
      socket.on('event2', callback3)

      socket.removeAllListeners('event1')

      socket._trigger('event1', 'data')
      socket._trigger('event2', 'data')

      expect(callback1).not.toHaveBeenCalled()
      expect(callback2).not.toHaveBeenCalled()
      expect(callback3).toHaveBeenCalledWith('data')
    })

    test('should remove all listeners for all events if no event is specified', () => {
      const socket = new MockSocket()
      const callback1 = vi.fn()
      const callback2 = vi.fn()

      socket.on('event1', callback1)
      socket.on('event2', callback2)

      socket.removeAllListeners()

      socket._trigger('event1', 'data')
      socket._trigger('event2', 'data')

      expect(callback1).not.toHaveBeenCalled()
      expect(callback2).not.toHaveBeenCalled()
    })
  })
})