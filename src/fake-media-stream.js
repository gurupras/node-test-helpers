/* global jest */
const mitt = require('mitt')
const { v4: uuidv4 } = require('uuid')

class FakeDOMNode {
  constructor () {
    this.emitter = mitt()
  }

  dispatchEvent (evt) {
    this.emitter.emit(evt.type, evt)
  }

  addEventListener (evt, listener) {
    this.emitter.on(evt, listener)
  }

  removeEventListener (evt, listener) {
    this.emitter.off(evt, listener)
  }
}

class FakeMediaStream extends FakeDOMNode {
  constructor (arg, opts) {
    super()
    this.id = uuidv4()
    this.tracks = new Set()

    if (arg instanceof FakeMediaStream) {
      arg.getTracks().forEach(t => this.tracks.add(t), this)
    } else if (Array.isArray(arg)) {
      for (const track of arg) {
        this.tracks.add(track)
      }
    } else if (!!arg && typeof arg === 'object') {
      // This is an object but not a FakeMediaStream or an array. We're going to assume these are opts
      opts = arg
    }
    opts = opts || {}
    const { numVideoTracks = 0, numAudioTracks = 0 } = opts

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
    const { kind = Math.random() > 0.5 ? 'video' : 'audio', enabled = true } = data
    this.id = uuidv4()
    this.kind = kind
    this.stop = jest.fn()
    this.enabled = enabled
  }

  clone () {
    const data = {
      ...this,
      id: uuidv4(),
      stop: jest.fn()
    }
    return new FakeMediaTrack(data)
  }
}

global.MediaStream = FakeMediaStream

module.exports = {
  FakeDOMNode,
  FakeMediaStream,
  FakeMediaTrack
}
