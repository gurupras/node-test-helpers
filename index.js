const LocalStorageMock = require('./src/local-storage')
const FakeAudioContext = require('./src/fake-audio-context')
const FakeMedia = require('./src/fake-media-stream')
const { waitForWatch, commonMount } = require('./src/vue-test-helpers')
const jwt = require('./src/jwt')
const events = require('./src/events')
const random = require('./src/random')
const socketio = require('./src/socket.io')

module.exports = {
  LocalStorageMock,
  FakeAudioContext,
  vueWaitForWatch: waitForWatch,
  vueCommonMount: commonMount,
  ...FakeMedia,
  ...jwt,
  ...events,
  ...random,
  ...socketio
}
