import LocalStorageMock from './local-storage.js'
import { FakeAudioNode, FakeAudioWorkletNode, FakeAudioContext } from './fake-audio-context.js'
import { waitForWatch, commonMount } from './vue-test-helpers.js'
import { createMockSocketPair } from './fake-socket.io-sockets.js'

export {
  LocalStorageMock,
  FakeAudioNode,
  FakeAudioWorkletNode,
  FakeAudioContext,
  waitForWatch as vueWaitForWatch,
  commonMount as vueCommonMount,
  createMockSocketPair,
}

export * from './fake-media-stream.js'
export * from './jwt.js'
export * from './events.js'
export * from './random.js'
export * from './socket.io.js'
