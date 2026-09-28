import { describe, it, expect } from 'vitest'
import { createDirector, introPhase, pickTransition, INTRO, DURATIONS } from './director.js'

const run = (d, seconds, dt = 1 / 60) => {
  const events = []
  for (let t = 0; t < seconds; t += dt) events.push(...d.tick(dt))
  return events
}

describe('introPhase', () => {
  it('walks through reveal → welcome → hold → zoom → done', () => {
    expect(introPhase(0).phase).toBe('reveal')
    expect(introPhase(INTRO.reveal + 0.1).phase).toBe('welcome')
    expect(introPhase(INTRO.reveal + INTRO.welcome + 0.1).phase).toBe('hold')
    expect(introPhase(INTRO.reveal + INTRO.welcome + INTRO.hold + 0.1).phase).toBe('zoom')
    expect(introPhase(100)).toEqual({ phase: 'done', p: 1 })
    expect(introPhase(INTRO.reveal / 2).p).toBeCloseTo(0.5)
  })
  it('is a short fade under reduced motion', () => {
    expect(introPhase(0.4, true)).toEqual({ phase: 'fade', p: 0.5 })
    expect(introPhase(0.8, true).phase).toBe('done')
  })
})

describe('pickTransition', () => {
  it('folds when returning home, ripples otherwise', () => {
    expect(pickTransition('projects', 'hall')).toBe('fold')
    expect(pickTransition('hall', 'projects')).toBe('ripple')
    expect(pickTransition('about', 'contact')).toBe('ripple')
  })
  it('honours explicit kinds and reduced motion', () => {
    expect(pickTransition('hall', 'about', { kind: 'crossfade' })).toBe('crossfade')
    expect(pickTransition('about', 'hall', { reducedMotion: true })).toBe('crossfade')
  })
})

describe('director', () => {
  it('intro ends in play with one introDone', () => {
    const d = createDirector({ room: 'hall', playIntro: true })
    const evs = run(d, 7)
    expect(evs.filter((e) => e.type === 'introDone')).toHaveLength(1)
    expect(d.state.mode).toBe('play')
  })
  it('skipIntro jumps straight to play', () => {
    const d = createDirector({ room: 'hall', playIntro: true })
    expect(d.skipIntro()).toEqual([{ type: 'introDone' }])
    expect(d.state.mode).toBe('play')
    expect(d.skipIntro()).toEqual([])
  })
  it('refuses navigation during the intro', () => {
    const d = createDirector({ room: 'hall', playIntro: true })
    expect(d.request('about')).toBe(false)
  })
  it('switches rooms exactly once, halfway through the transition', () => {
    const d = createDirector({ room: 'hall' })
    expect(d.request('about', { origin: { x: 1, y: 2 } })).toBe(true)
    expect(d.state.transition.origin).toEqual({ x: 1, y: 2 })
    const evs = run(d, DURATIONS.ripple.out + DURATIONS.ripple.in + 0.1)
    expect(evs.filter((e) => e.type === 'roomChanged')).toEqual([{ type: 'roomChanged', room: 'about', from: 'hall', kind: 'ripple' }])
    expect(evs.at(-1)).toEqual({ type: 'transitionDone', room: 'about' })
    expect(d.state).toMatchObject({ mode: 'play', room: 'about', transition: null })
  })
  it('ignores repeated requests while a transition is running', () => {
    const d = createDirector({ room: 'hall' })
    d.request('about')
    expect(d.request('projects')).toBe(false)
    run(d, 2)
    expect(d.state.room).toBe('about')
  })
  it('ignores a request for the current room', () => {
    expect(createDirector({ room: 'about' }).request('about')).toBe(false)
  })
  it('progress runs 0 → 1 within each phase', () => {
    const d = createDirector({ room: 'hall' })
    d.request('about')
    d.tick(DURATIONS.ripple.out / 2)
    expect(d.progress()).toBeCloseTo(0.5)
  })
  it('replayIntro only from play, and resets to the hall', () => {
    const d = createDirector({ room: 'projects' })
    expect(d.replayIntro()).toBe(true)
    expect(d.state).toMatchObject({ mode: 'intro', room: 'hall', t: 0 })
    expect(d.replayIntro()).toBe(false)
  })
})
