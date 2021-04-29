const { FakeDOMNode, FakeMediaTrack, FakeMediaStream } = require('../src/fake-media-stream')

describe('FakeDOMNode', () => {
  /** @type {FakeDOMNode} */
  let node
  beforeEach(() => {
    node = new FakeDOMNode()
  })

  test('Able to set up event listeners', async () => {
    expect(() => node.addEventListener('test', () => {})).not.toThrow()
  })
  test('Able to remove event listeners', async () => {
    const fn = () => {}
    node.addEventListener('test', fn)
    expect(() => node.removeEventListener('test', fn)).not.toThrow()
  })
  test('Able to emit events and have event listeners be triggered', async () => {
    const promise = new Promise(resolve => node.addEventListener('test', resolve))
    node.dispatchEvent({ type: 'test' })
    await expect(promise).toResolve()
  })
})

describe('FakeMediaTrack', () => {
  test('Every track has a UUID', async () => {
    const ids = new Set()
    for (let idx = 0; idx < 100; idx++) {
      const track = new FakeMediaTrack()
      expect(track.id).toBeString()
      expect(ids.has(track.id)).toBeFalse()
      ids.add(track.id)
    }
  })
})

describe('FakeMediaStream', () => {
  test('Always has an id', async () => {
    const stream = new FakeMediaStream()
    expect(stream.id).toBeString()
  })
  test('Able to create an empty stream', async () => {
    const stream = new FakeMediaStream()
    expect(stream.getTracks().length).toEqual(0)
  })
  test('Able to copy streams by specifying first argument', () => {
    const stream1 = new FakeMediaStream(null, { numVideoTracks: 3, numAudioTracks: 3 })
    const stream2 = new FakeMediaStream(stream1)
    expect(stream2.getVideoTracks().length).toEqual(stream1.getVideoTracks().length)
    expect(stream2.getAudioTracks().length).toEqual(stream1.getAudioTracks().length)
    expect(stream2.getTracks()).toIncludeSameMembers(stream1.getTracks())
  })
  test('Able to copy tracks by specifying an array in the first argument', () => {
    const tracks = [...Array(5)].map(x => new FakeMediaTrack())
    const stream = new FakeMediaStream(tracks)
    expect(stream.getTracks()).toIncludeSameMembers(tracks)
  })
  test('Specifying an object in the first argument with numVideoTracks and numAudioTracks treats it as opts', async () => {
    const stream = new FakeMediaStream({ numVideoTracks: 3, numAudioTracks: 3 })
    expect(stream.getAudioTracks().length).toBe(3)
    expect(stream.getVideoTracks().length).toBe(3)
  })

  test('Able to add track to stream', async () => {
    const stream = new FakeMediaStream()
    const track = new FakeMediaTrack()
    stream.addTrack(track)
    expect(stream.getTracks()).toIncludeSameMembers([track])
  })
  test('Able to remove track', async () => {
    const tracks = [...Array(5)].map(x => new FakeMediaTrack())
    const trackToRemove = tracks[2]
    const stream = new FakeMediaStream(tracks)
    expect(() => stream.removeTrack(trackToRemove)).not.toThrow()
    const expected = [...tracks]
    expected.splice(tracks.indexOf(trackToRemove), 1)
    expect(stream.getTracks()).toIncludeSameMembers(expected)
  })

  test('Able to create a fake stream by just specifying numVideoTracks', async () => {
    const stream = new FakeMediaStream({ numVideoTracks: 2 })
    expect(stream.getVideoTracks().length).toBe(2)
  })
  test('Able to create a fake stream by just specifying numAudioTracks', async () => {
    const stream = new FakeMediaStream({ numAudioTracks: 2 })
    expect(stream.getAudioTracks().length).toBe(2)
  })

  test('Able to set up onaddtrack and have it trigger', async () => {
    const stream = new FakeMediaStream()
    const promise = new Promise(resolve => { stream.onaddtrack = resolve })
    stream.addTrack(new FakeMediaTrack())
    await expect(promise).toResolve()
  })

  test('Able to set up onremovetrack and have it trigger', async () => {
    const stream = new FakeMediaStream()
    stream.addTrack(new FakeMediaTrack())
    const promise = new Promise(resolve => { stream.onremovetrack = resolve })
    stream.removeTrack(stream.getTracks()[0])
    await expect(promise).toResolve()
  })
})
