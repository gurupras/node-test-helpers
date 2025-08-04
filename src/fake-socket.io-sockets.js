/**
 * @callback EventCallback
 * @param {...any} args
 */

/**
 * @class
 */
class MockSocket {
  constructor () {
    /** @type {Map<string, EventCallback[]>} */
    this._events = new Map()

    /** @type {MockSocket | null} */
    this._peer = null
  }

  /**
   * @param {MockSocket} peer
   */
  setPeer (peer) {
    this._peer = peer
  }

  /**
   * Register an event listener
   * @param {string} event
   * @param {EventCallback} callback
   */
  on (event, callback) {
    if (!this._events.has(event)) {
      this._events.set(event, [])
    }
    this._events.get(event).push(callback)
  }

  /**
   * Emit an event to the peer socket
   * @param {string} event
   * @param {...any} args
   */
  emit (event, ...args) {
    if (this._peer) {
      this._peer._trigger(event, ...args)
    }
  }

  /**
   * Internal trigger method to invoke callbacks
   * @param {string} event
   * @param {...any} args
   * @private
   */
  _trigger (event, ...args) {
    const callbacks = this._events.get(event) || []
    callbacks.forEach(cb => cb(...args))
  }
}

/**
 * Creates a mock socket pair where server and client are linked in-memory
 * @returns {{ serverSocket: MockSocket, clientSocket: MockSocket }}
 */
function createMockSocketPair () {
  const serverSocket = new MockSocket()
  const clientSocket = new MockSocket()

  serverSocket.setPeer(clientSocket)
  clientSocket.setPeer(serverSocket)

  return { serverSocket, clientSocket }
}

module.exports = {
  MockSocket,
  createMockSocketPair
}
