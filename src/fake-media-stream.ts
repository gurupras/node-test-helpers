import { vi } from 'vitest'
import mitt, { Emitter } from 'mitt'
import { v4 as uuidv4 } from 'uuid'

type Event = { type: string; [key: string]: any }

export class FakeDOMNode {
  private emitter: Emitter<Record<string, Event>>

  constructor () {
    this.emitter = (mitt as any)()
  }

  dispatchEvent (evt: Event): boolean {
    this.emitter.emit(evt.type, evt)
    return true
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

export class FakeMediaTrack extends FakeDOMNode implements MediaStreamTrack {
  readonly id: string
  readonly kind: 'video' | 'audio'
  readonly label = ''
  readonly contentHint = ''
  readonly muted = false
  readonly readyState: MediaStreamTrackState = 'live'
  enabled: boolean

  onended: ((this: MediaStreamTrack, ev: Event) => any) | null = null
  onmute: ((this: MediaStreamTrack, ev: Event) => any) | null = null
  onunmute: ((this: MediaStreamTrack, ev: Event) => any) | null = null
  onoverconstrained: ((this: MediaStreamTrack, ev: Event) => any) | null = null

  stop = vi.fn()
  applyConstraints = vi.fn().mockResolvedValue(undefined)
  getCapabilities = vi.fn().mockReturnValue({})
  getConstraints = vi.fn().mockReturnValue({})
  getSettings = vi.fn().mockReturnValue({})

  constructor (data: FakeMediaTrackData = {}) {
    super()
    const { kind = Math.random() > 0.5 ? 'video' : 'audio', enabled = true } = data
    this.id = uuidv4()
    this.kind = kind
    this.enabled = enabled
  }

  clone (): MediaStreamTrack {
    return new FakeMediaTrack({
      kind: this.kind,
      enabled: this.enabled,
    })
  }
}

interface FakeMediaStreamOptions {
  numVideoTracks?: number;
  numAudioTracks?: number;
}

export class FakeMediaStream extends FakeDOMNode implements MediaStream {
  id: string
  tracks: Set<FakeMediaTrack>
  active = true
  onaddtrack: ((this: MediaStream, ev: MediaStreamTrackEvent) => any) | null = null
  onremovetrack: ((this: MediaStream, ev: MediaStreamTrackEvent) => any) | null = null

  constructor (
    arg?: FakeMediaStream | FakeMediaTrack[] | FakeMediaStreamOptions,
    opts?: FakeMediaStreamOptions
  ) {
    super()
    this.id = uuidv4()
    this.tracks = new Set()

    if (typeof (arg as any)?.getTracks === 'function') {
      (arg as FakeMediaStream).getTracks().forEach(t => this.tracks.add(t))
    } else if (Array.isArray(arg)) {
      for (const track of arg) {
        this.tracks.add(track)
      }
    } else if (!!arg && typeof arg === 'object') {
      opts = arg as FakeMediaStreamOptions
    }

    opts = opts || {}
    const { numVideoTracks = 0, numAudioTracks = 0 } = opts

    for (let i = 0; i < numVideoTracks; i++) {
      this.addTrack(new FakeMediaTrack({ kind: 'video' }))
    }

    for (let i = 0; i < numAudioTracks; i++) {
      this.addTrack(new FakeMediaTrack({ kind: 'audio' }))
    }
  }

  getTracks () {
    return [...this.tracks]
  }

  getAudioTracks () {
    return [...this.tracks].filter(t => t.kind === 'audio')
  }

  getVideoTracks () {
    return [...this.tracks].filter(t => t.kind === 'video')
  }

  getTrackById (id: string) {
    return [...this.tracks].find(t => t.id === id) || null
  }

  addTrack (track: FakeMediaTrack) {
    this.tracks.add(track)
    if (this.onaddtrack) {
      const event = { track } as unknown as MediaStreamTrackEvent
      this.onaddtrack(event)
    }
  }

  removeTrack = (track: FakeMediaTrack) => {
    this.tracks.delete(track)
    if (this.onremovetrack) {
      const event = { track } as unknown as MediaStreamTrackEvent
      this.onremovetrack(event)
    }
  }

  clone () {
    return new FakeMediaStream(this)
  }
}

(global as any).MediaStream = FakeMediaStream
