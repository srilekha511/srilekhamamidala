import { describe, it, expect, vi, afterEach } from 'vitest'
import { createAudio } from './audio.js'

function fakeAudioCtx() {
  const oscillators = []
  class Param { setValueAtTime() {} exponentialRampToValueAtTime() {} }
  class Ctx {
    constructor() { this.currentTime = 0; this.destination = {}; this.state = 'running' }
    createGain() { return { gain: Object.assign(new Param(), { value: 1 }), connect: (n) => n } }
    createOscillator() {
      const o = { type: '', frequency: { value: 0 }, connect: (n) => n, start: vi.fn(), stop: vi.fn() }
      oscillators.push(o)
      return o
    }
    resume() { return Promise.resolve() }
    close() { return Promise.resolve() }
  }
  return { Ctx, oscillators }
}

afterEach(() => vi.useRealTimers())

describe('audio', () => {
  it('is silent and safe without WebAudio', () => {
    const a = createAudio({ AudioCtx: undefined })
    expect(() => { a.setEnabled(true); a.sfx('pop'); a.destroy() }).not.toThrow()
  })
  it('starts disabled and plays nothing', () => {
    const { Ctx, oscillators } = fakeAudioCtx()
    const a = createAudio({ AudioCtx: Ctx })
    a.sfx('pop')
    expect(a.enabled).toBe(false)
    expect(oscillators).toHaveLength(0)
  })
  it('plays SFX and music once enabled, and stops music when disabled', () => {
    vi.useFakeTimers()
    const { Ctx, oscillators } = fakeAudioCtx()
    const a = createAudio({ AudioCtx: Ctx })
    a.setEnabled(true)
    a.sfx('card')
    const afterSfx = oscillators.length
    expect(afterSfx).toBeGreaterThan(0)
    vi.advanceTimersByTime(1000)
    const afterMusic = oscillators.length
    expect(afterMusic).toBeGreaterThan(afterSfx)
    a.setEnabled(false)
    vi.advanceTimersByTime(1000)
    expect(oscillators.length).toBe(afterMusic)
  })
  it('ignores unknown effect names', () => {
    const { Ctx } = fakeAudioCtx()
    const a = createAudio({ AudioCtx: Ctx }); a.setEnabled(true)
    expect(() => a.sfx('nope')).not.toThrow()
    a.destroy()
  })
})
