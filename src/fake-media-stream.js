/* global jest */
const Emittery = require('emittery')
const uuidv4 = require('uuid/v4')

const emitteryWeakMap = new WeakMap()

class FakeDOMNode {
  dispatchEvent (evt) {
    const emitter = emitteryWeakMap.get(this)
    emitter.emit(evt.type, evt)
  }

  addEventListener (evt, listener) {
    const emitter = emitteryWeakMap.get(this)
    emitter.on(evt, listener)
  }

  removeEventListener (evt, listener) {
    const emitter = emitteryWeakMap.get(this)
    emitter.off(evt, listener)
  }
}

class FakeMediaStream extends FakeDOMNode {
  constructor (arg, opts = {}) {
    super()
    const { numVideoTracks = 0, numAudioTracks = 0 } = opts
    this.id = uuidv4()
    this.tracks = new Set()

    if (arg instanceof FakeMediaStream) {
      arg.getTracks().forEach(t => this.tracks.add(t), this)
    } else if (arg instanceof Array) {
      for (const track of arg) {
        this.tracks.add(track)
      }
    }
    if (numVideoTracks > 0) {
      for (let idx = 0; idx < numVideoTracks; idx++) {
        this.addTrack(new FakeMediaTrack({ kind: 'video' }))
      }
    }
    if (numAudioTracks > 0) {
      for (let idx = 0; idx < numAudioTracks; idx++) {
        this.addTrack(new FakeMediaTrack({ kind: 'audio' }))
      }
    }
  }

  addTrack (track) {
    this.tracks.add(track)
    if (this.onaddtrack) {
      this.onaddtrack({ track })
    }
  }

  removeTrack (track) {
    this.tracks.delete(track)
    if (this.onremovetrack) {
      this.onremovetrack({ track })
    }
  }

  getTracks () {
    return [...this.tracks]
  }

  _getFilteredTracks (kind) {
    return [...this.tracks].filter(x => x.kind === kind)
  }

  getVideoTracks () {
    return this._getFilteredTracks('video')
  }

  getAudioTracks () {
    return this._getFilteredTracks('audio')
  }
}

class FakeMediaTrack extends FakeDOMNode {
  constructor (data = {}) {
    super()
    const emittery = new Emittery()
    emitteryWeakMap.set(this, emittery)
    const { kind = Math.random() > 0.5 ? 'video' : 'audio' } = data
    Object.assign(this, {
      id: uuidv4(),
      kind,
      stop: jest.fn()
    })
  }
}

global.MediaStream = FakeMediaStream

module.exports = {
  FakeMediaStream,
  FakeMediaTrack
}
