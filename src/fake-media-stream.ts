import { vi } from 'vitest'
import mitt, { Emitter } from 'mitt'
import { v4 as uuidv4 } from 'uuid'

type Event = { type: string; [key: string]: any }

export class FakeDOMNode {
  private emitter: Emitter<Record<string, Event>>

  constructor () {
    this.emitter = mitt()
  }

  dispatchEvent (evt: Event) {
    this.emitter.emit(evt.type, evt)
  }

  addEventListener (evt: string, listener: (event: Event) => void) {
    this.emitter.on(evt, listener)
  }

  removeEventListener (evt: string, listener: (event: Event) => void) {
    this.emitter.off(evt, listener)
  }
}

interface FakeMediaTrackData {
  kind?: 'video' | 'audio';
  enabled?: boolean;
}

export class FakeMediaTrack extends FakeDOMNode {
  id: string
  kind: 'video' | 'audio'
  stop: ReturnType<typeof vi.fn>
  enabled: boolean

  constructor (data: FakeMediaTrackData = {}) {
    super()
    const { kind = Math.random() > 0.5 ? 'video' : 'audio', enabled = true } = data
    this.id = uuidv4()
    this.kind = kind
    this.stop = vi.fn()
    this.enabled = enabled
  }

  clone (): FakeMediaTrack {
    const data = {
      ...this,
      id: uuidv4(),
      stop: vi.fn(),
    }
    return new FakeMediaTrack(data)
  }
}

interface FakeMediaStreamOptions {
  numVideoTracks?: number;
  numAudioTracks?: number;
}

export class FakeMediaStream extends FakeDOMNode {
  id: string
  tracks: Set<FakeMediaTrack>
  onaddtrack?: (event: { track: FakeMediaTrack }) => void
  onremovetrack?: (event: { track: FakeMediaTrack }) => void

  constructor (arg?: FakeMediaStream | FakeMediaTrack[] | FakeMediaStreamOptions, opts?: FakeMediaStreamOptions) {
    super()
    this.id = uuidv4()
    this.tracks = new Set()

    if (arg instanceof FakeMediaStream) {
      arg.getTracks().forEach(t => this.tracks.add(t), this)
    } else if (Array.isArray(arg)) {
      for (const track of arg) {
        this.tracks.add(track as FakeMediaTrack)
      }
    } else if (!!arg && typeof arg === 'object') {
      opts = arg as FakeMediaStreamOptions
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

  addTrack (track: FakeMediaTrack) {
    this.tracks.add(track)
    if (this.onaddtrack) {
      this.onaddtrack({ track })
    }
  }

  removeTrack (track: FakeMediaTrack) {
    this.tracks.delete(track)
    if (this.onremovetrack) {
      this.onremovetrack({ track })
    }
  }

  getTracks (): FakeMediaTrack[] {
    return [...this.tracks]
  }

  private _getFilteredTracks (kind: 'video' | 'audio'): FakeMediaTrack[] {
    return [...this.tracks].filter(x => x.kind === kind)
  }

  getVideoTracks (): FakeMediaTrack[] {
    return this._getFilteredTracks('video')
  }

  getAudioTracks (): FakeMediaTrack[] {
    return this._getFilteredTracks('audio')
  }
}

(global as any).MediaStream = FakeMediaStream
