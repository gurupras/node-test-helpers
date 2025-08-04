import { describe, test, expect, beforeEach } from 'vitest'
import { FakeAudioContext, FakeAudioNode, FakeAudioWorkletNode } from '../src/fake-audio-context.js'
import { FakeMediaStream, FakeMediaTrack } from '../src/fake-media-stream.js'

describe('FakeAudioNode', () => {
  let node
  beforeEach(() => {
    node = new FakeAudioNode()
  })

  test('constructor with stream', () => {
    const track = new FakeMediaTrack({ kind: 'audio' })
    const stream = new FakeMediaStream([track])
    const streamNode = new FakeAudioNode(stream)
    expect(streamNode.tracks.has(track)).toBe(true)
  })

  test('addTrack', () => {
    const track = new FakeMediaTrack()
    node.addTrack(track)
    expect(node.tracks.has(track)).toBe(true)
  })

  test('connect', () => {
    const dst = new FakeAudioNode()
    const track = new FakeMediaTrack()
    node.addTrack(track)
    node.connect(dst)
    expect(node.connect).toHaveBeenCalledWith(dst)
    expect(dst.tracks.has(track)).toBe(true)
  })

  test('connect to destination with stream', () => {
    const dst = { stream: new FakeMediaStream() }
    const track = new FakeMediaTrack()
    node.addTrack(track)
    node.connect(dst)
    expect(dst.stream.getTracks()).toContain(track)
  })

  test('disconnect', () => {
    const dst = new FakeAudioNode()
    const track = new FakeMediaTrack()
    node.addTrack(track)
    node.connect(dst)
    node.disconnect()
    expect(node.disconnect).toHaveBeenCalled()
    expect(dst.tracks.has(track)).toBe(false)
  })

  test('disconnect from destination with stream', () => {
    const dst = { stream: new FakeMediaStream() }
    const track = new FakeMediaTrack()
    node.addTrack(track)
    node.connect(dst)
    expect(dst.stream.getTracks()).toContain(track)
    node.disconnect()
    expect(dst.stream.getTracks()).not.toContain(track)
  })

  test('disconnect without destination does not throw', () => {
    expect(() => node.disconnect()).not.toThrow()
  })
})

describe('FakeAudioWorkletNode', () => {
  test('constructor', () => {
    const ctx = new FakeAudioContext()
    const node = new FakeAudioWorkletNode(ctx, 'test-processor')
    expect(node.context).toBe(ctx)
    expect(node.name).toBe('test-processor')
    expect(node.port).toBeDefined()
  })
})

describe('FakeAudioContext', () => {
  let context
  beforeEach(() => {
    context = new FakeAudioContext()
  })

  test('constructor', () => {
    expect(context.audioWorklet).toBeDefined()
    expect(context.destination).toBeInstanceOf(FakeAudioNode)
    expect(context.close).toBeDefined()
  })

  test('createMediaStreamSource', () => {
    const stream = new FakeMediaStream()
    const source = context.createMediaStreamSource(stream)
    expect(source).toBeInstanceOf(FakeAudioNode)
  })

  test('createMediaStreamDestination', () => {
    const destination = context.createMediaStreamDestination()
    expect(destination.stream).toBeInstanceOf(FakeMediaStream)
  })

  test('createGain', () => {
    const gainNode = context.createGain()
    expect(gainNode).toBeInstanceOf(FakeAudioNode)
    expect(gainNode.gain.value).toBe(1.0)
  })
})
