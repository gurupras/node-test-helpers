import { vi } from 'vitest'

type EventCallback = (...args: any[]) => void

export class MockSocket {
  public id: string
  private events = new Map<string, EventCallback[]>()

  constructor (private peer?: MockSocket, private socketCollection?: Map<string, MockSocket>) {
    this.id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  setPeer (peer: MockSocket) {
    this.peer = peer
  }

  on = vi.fn().mockImplementation((event: string, callback: EventCallback) => {
    if (!this.events.has(event)) {
      this.events.set(event, [])
    }
    this.events.get(event)!.push(callback)
  })

  emit = vi.fn().mockImplementation((event: string, ...args: any[]) => {
    if (this.peer) {
      this.peer._trigger(event, ...args)
    }
  })

  broadcast = {
    to: vi.fn().mockImplementation((room: string) => ({
      emit: vi.fn().mockImplementation((event: string, ...args: any[]) => {
        if (this.socketCollection) {
          const targetSocket = this.socketCollection.get(room)
          if (targetSocket) {
            targetSocket._trigger(event, ...args)
          }
        }
      })
    }))
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
  const socketCollection = new Map<string, MockSocket>()
  const serverSocket = new MockSocket(undefined, socketCollection)
  const clientSocket = new MockSocket(undefined, socketCollection)

  socketCollection.set(serverSocket.id, serverSocket)
  socketCollection.set(clientSocket.id, clientSocket)

  serverSocket.setPeer(clientSocket)
  clientSocket.setPeer(serverSocket)

  return { serverSocket, clientSocket }
}
