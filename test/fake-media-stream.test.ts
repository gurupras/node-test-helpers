import { describe, test, expect, beforeEach, vi } from 'vitest'
import { FakeDOMNode, FakeMediaTrack, FakeMediaStream } from '../src/fake-media-stream.js'

describe('FakeDOMNode', () => {
  let node: FakeDOMNode
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
    const evt = { type: 'test' }
    node.dispatchEvent(evt)
    await expect(promise).resolves.toEqual(evt)
  })
})

describe('FakeMediaTrack', () => {
  test('Every track has a UUID', async () => {
    const ids = new Set()
    for (let idx = 0; idx < 100; idx++) {
      const track = new FakeMediaTrack()
      expect(typeof track.id).toBe('string')
      expect(ids.has(track.id)).toBe(false)
      ids.add(track.id)
    }
  })

  describe('Constructor', () => {
    test('Can create a video track', () => {
      const track = new FakeMediaTrack({ kind: 'video' })
      expect(track.kind).toBe('video')
    })

    test('Can create an audio track', () => {
      const track = new FakeMediaTrack({ kind: 'audio' })
      expect(track.kind).toBe('audio')
    })

    test('Kind is randomly assigned if not specified', () => {
      const track = new FakeMediaTrack()
      expect(['video', 'audio']).toContain(track.kind)
    })

    test('A track is enabled by default', () => {
      const track = new FakeMediaTrack()
      expect(track.enabled).toBe(true)
    })

    test('Can create a disabled track', () => {
      const track = new FakeMediaTrack({ enabled: false })
      expect(track.enabled).toBe(false)
    })
  })

  describe('Clone', () => {
    test('Cloned tracks have different uuid', async () => {
      const track = new FakeMediaTrack()
      const clone = track.clone()
      expect(clone.id).not.toEqual(track.id)
    })
    test('Stopping original track does not stop cloned track', async () => {
      const track = new FakeMediaTrack()
      const clone = track.clone()
      vi.spyOn(clone, 'stop')
      track.stop()
      expect(clone.stop).not.toHaveBeenCalled()
    })
    test('Cloned track has same kind', async () => {
      const track = new FakeMediaTrack({ kind: 'video' })
      const clone = track.clone()
      expect(clone.kind).toBe('video')
    })
    test('Cloned track has same enabled status', async () => {
      const track = new FakeMediaTrack({ enabled: false })
      const clone = track.clone()
      expect(clone.enabled).toBe(false)
    })
  })
})

describe('FakeMediaStream', () => {
  test('Always has an id', async () => {
    const stream = new FakeMediaStream()
    expect(typeof stream.id).toBe('string')
  })
  test('Able to create an empty stream', async () => {
    const stream = new FakeMediaStream()
    expect(stream.getTracks().length).toEqual(0)
  })
  test('Able to copy streams by specifying first argument', () => {
    const stream1 = new FakeMediaStream(undefined, { numVideoTracks: 3, numAudioTracks: 3 })
    const stream2 = new FakeMediaStream(stream1)
    expect(stream2.getVideoTracks().length).toEqual(stream1.getVideoTracks().length)
    expect(stream2.getAudioTracks().length).toEqual(stream1.getAudioTracks().length)
    expect(stream2.getTracks()).toEqual(expect.arrayContaining(stream1.getTracks()))
  })
  test('Able to copy tracks by specifying an array in the first argument', () => {
    const tracks = [...Array(5)].map(x => new FakeMediaTrack())
    const stream = new FakeMediaStream(tracks)
    expect(stream.getTracks()).toEqual(expect.arrayContaining(tracks))
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
    expect(stream.getTracks()).toEqual(expect.arrayContaining([track]))
  })
  test('Able to remove track', async () => {
    const tracks = [...Array(5)].map(x => new FakeMediaTrack())
    const trackToRemove = tracks[2]
    const stream = new FakeMediaStream(tracks)
    expect(() => stream.removeTrack(trackToRemove)).not.toThrow()
    const expected = [...tracks]
    expected.splice(tracks.indexOf(trackToRemove), 1)
    expect(stream.getTracks()).toEqual(expect.arrayContaining(expected))
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
    const track = new FakeMediaTrack()
    stream.addTrack(track)
    await expect(promise).resolves.toEqual({ track })
  })

  test('Able to set up onremovetrack and have it trigger', async () => {
    const stream = new FakeMediaStream()
    const track = new FakeMediaTrack()
    stream.addTrack(track)
    const promise = new Promise(resolve => { stream.onremovetrack = resolve })
    stream.removeTrack(track)
    await expect(promise).resolves.toEqual({ track })
  })
})
