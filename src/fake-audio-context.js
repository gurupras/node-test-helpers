/* global jest */
const { FakeMediaStream } = require('./fake-media-stream')

class FakeAudioContext {
  createMediaStreamSource () {
    return {
      connect: jest.fn(),
      addTrack: jest.fn()
    }
  }

  createMediaStreamDestination () {
    return {
      stream: new FakeMediaStream()
    }
  }

  createGain () {
    return {
      gain: {
        value: 1.0
      }
    }
  }
}

module.exports = FakeAudioContext
