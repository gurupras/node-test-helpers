import { vi } from 'vitest'

type EventCallback = (...args: any[]) => void

export class MockSocket {
  private events = new Map<string, EventCallback[]>()

  constructor (private peer?: MockSocket) {}

  setPeer (peer: MockSocket) {
    this.peer = peer
  }

  on (event: string, callback: EventCallback) {
    if (!this.events.has(event)) {
      this.events.set(event, [])
    }
    this.events.get(event)!.push(callback)
  }

  emit (event: string, ...args: any[]) {
    if (this.peer) {
      this.peer._trigger(event, ...args)
    }
  }

  _trigger (event: string, ...args: any[]) {
    const callbacks = this.events.get(event) || []
    callbacks.forEach(cb => cb(...args))
  }

  removeAllListeners = vi.fn().mockImplementation((event?: string) => {
    if (event) {
      this.events.delete(event)
    } else {
      this.events.clear()
    }
  })

  // Optional: simulate `disconnect`, `connect`, etc.
}

export function createMockSocketPair (): { serverSocket: MockSocket; clientSocket: MockSocket } {
  const serverSocket = new MockSocket()
  const clientSocket = new MockSocket()

  serverSocket.setPeer(clientSocket)
  clientSocket.setPeer(serverSocket)

  return { serverSocket, clientSocket }
}
