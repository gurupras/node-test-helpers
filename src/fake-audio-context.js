/* global jest */
const { FakeMediaStream } = require('./fake-media-stream')

class FakeAudioNode {
  constructor (stream) {
    this.tracks = new Set()
    this.connect = jest.fn().mockImplementation(dst => {
      [...this.tracks].forEach(t => {
        if (dst.stream) {
          dst.stream.addTrack(t)
        } else {
          dst.addTrack(t)
        }
      })
      return dst
    })
    this.addTrack = jest.fn().mockImplementation(t => {
      this.tracks.add(t)
    })
    if (stream) {
      stream.getAudioTracks().forEach(this.addTrack, this)
    }
  }
}

class FakeAudioContext extends FakeAudioNode {
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

module.exports = FakeAudioContext
