/* global jest */
const { FakeMediaStream } = require('./fake-media-stream')

class FakeAudioNode {
  constructor (stream) {
    this.tracks = new Set()
    this.connect = jest.fn().mockImplementation(dst => {
      this._dst = dst
      ;[...this.tracks].forEach(t => {
        if (dst.stream) {
          dst.stream.addTrack(t)
        } else {
          dst.addTrack(t)
        }
      })
      return dst
    })

    this.disconnect = jest.fn().mockImplementation(() => {
      if (!this._dst) {
        return
      }
      ;[...this.tracks].forEach(t => {
        if (this._dst.stream) {
          this._dst.stream.removeTrack(t)
        } else {
          this._dst.removeTrack(t)
        }
      })
    })

    this.addTrack = jest.fn().mockImplementation(t => {
      this.tracks.add(t)
    })

    if (stream) {
      stream.getAudioTracks().forEach(this.addTrack, this)
    }
  }
}

class FakeAudioWorkletNode extends FakeAudioNode {
  constructor (ctx, name) {
    super(new FakeMediaStream())
    this.context = ctx
    this.name = name
    this.port = {
      onmessage: jest.fn(),
      postMessage: jest.fn()
    }
  }
}

class FakeAudioContext extends FakeAudioNode {
  constructor (...args) {
    super(...args)
    this.audioWorklet = {
      addModule: jest.fn()
    }
    this.destination = new FakeAudioNode(new FakeMediaStream())
    this.close = jest.fn()
  }

  createMediaStreamSource (stream) {
    return new FakeAudioNode(stream)
  }

  createMediaStreamDestination () {
    return {
      stream: new FakeMediaStream()
    }
  }

  createGain () {
    const node = new FakeAudioNode()
    node.gain = {
      value: 1.0
    }
    return node
  }
}

module.exports = {
  FakeAudioNode,
  FakeAudioWorkletNode,
  FakeAudioContext
}
