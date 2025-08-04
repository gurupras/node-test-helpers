import { FakeMediaStream, FakeMediaTrack } from './fake-media-stream.js'
import { vi } from 'vitest'

export class FakeAudioNode {
  tracks: Set<FakeMediaTrack>
  connect: ReturnType<typeof vi.fn>
  disconnect: ReturnType<typeof vi.fn>
  addTrack: ReturnType<typeof vi.fn>
  removeTrack: ReturnType<typeof vi.fn>
  _dst?: any
  gain?: { value: number }
  stream?: FakeMediaStream

  constructor (stream?: FakeMediaStream) {
    this.tracks = new Set()
    this.connect = vi.fn().mockImplementation(dst => {
      this._dst = dst;
      [...this.tracks].forEach(t => {
        if (dst.stream) {
          dst.stream.addTrack(t)
        } else {
          dst.addTrack(t)
        }
      })
      return dst
    })

    this.disconnect = vi.fn().mockImplementation(() => {
      if (!this._dst) {
        return
      }
      [...this.tracks].forEach(t => {
        if (this._dst.stream) {
          this._dst.stream.removeTrack(t)
        } else {
          this._dst.removeTrack(t)
        }
      })
    })

    this.addTrack = vi.fn().mockImplementation((t: FakeMediaTrack) => {
      this.tracks.add(t)
    })

    this.removeTrack = vi.fn().mockImplementation((t: FakeMediaTrack) => {
      this.tracks.delete(t)
    })

    if (stream) {
      stream.getAudioTracks().forEach(this.addTrack, this)
    }
  }
}

export class FakeAudioWorkletNode extends FakeAudioNode {
  context: FakeAudioContext
  name: string
  port: {
    onmessage: ReturnType<typeof vi.fn>;
    postMessage: ReturnType<typeof vi.fn>;
  }

  constructor (ctx: FakeAudioContext, name: string) {
    super(new FakeMediaStream())
    this.context = ctx
    this.name = name
    this.port = {
      onmessage: vi.fn(),
      postMessage: vi.fn(),
    }
  }
}

export class FakeAudioContext extends FakeAudioNode {
  audioWorklet: {
    addModule: ReturnType<typeof vi.fn>;
  }

  destination: FakeAudioNode
  close: ReturnType<typeof vi.fn>

  constructor (...args: any[]) {
    super(...args)
    this.audioWorklet = {
      addModule: vi.fn(),
    }
    this.destination = new FakeAudioNode(new FakeMediaStream())
    this.close = vi.fn()
  }

  createMediaStreamSource (stream: FakeMediaStream): FakeAudioNode {
    return new FakeAudioNode(stream)
  }

  createMediaStreamDestination (): { stream: FakeMediaStream } {
    return {
      stream: new FakeMediaStream(),
    }
  }

  createGain (): FakeAudioNode {
    const node = new FakeAudioNode()
    node.gain = {
      value: 1.0,
    }
    return node
  }
}
