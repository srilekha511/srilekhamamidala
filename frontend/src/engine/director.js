export const INTRO = { reveal: 3.5, welcome: 0.8, hold: 0.8, zoom: 1.4 }
export const REDUCED_INTRO = 0.8
export const DURATIONS = {
  ripple: { out: 0.9, in: 0.5 },
  fold: { out: 0.9, in: 0.7 },
  crossfade: { out: 0.25, in: 0.25 },
}
const INTRO_ORDER = ['reveal', 'welcome', 'hold', 'zoom']

export function introPhase(t, reduced = false) {
  if (reduced) return t >= REDUCED_INTRO ? { phase: 'done', p: 1 } : { phase: 'fade', p: t / REDUCED_INTRO }
  let start = 0
  for (const phase of INTRO_ORDER) {
    const d = INTRO[phase]
    if (t < start + d) return { phase, p: (t - start) / d }
    start += d
  }
  return { phase: 'done', p: 1 }
}

export function pickTransition(from, to, { reducedMotion = false, kind } = {}) {
  if (reducedMotion) return 'crossfade'
  if (kind) return kind
  return to === 'hall' && from !== 'hall' ? 'fold' : 'ripple'
}

export function createDirector({ room = 'hall', playIntro = false, reducedMotion = false } = {}) {
  const state = { mode: playIntro ? 'intro' : 'play', room, t: 0, transition: null }

  function request(to, { kind, origin = null } = {}) {
    if (state.mode !== 'play' || to === state.room) return false
    state.transition = {
      kind: pickTransition(state.room, to, { reducedMotion, kind }),
      from: state.room,
      to,
      phase: 'out',
      t: 0,
      origin,
    }
    state.mode = 'transition'
    return true
  }

  function tick(dt) {
    const events = []
    if (state.mode === 'intro') {
      state.t += dt
      if (introPhase(state.t, reducedMotion).phase === 'done') {
        state.mode = 'play'
        events.push({ type: 'introDone' })
      }
    } else if (state.mode === 'transition') {
      const tr = state.transition
      const dur = DURATIONS[tr.kind]
      tr.t += dt
      if (tr.phase === 'out' && tr.t >= dur.out) {
        tr.phase = 'in'
        tr.t = 0
        state.room = tr.to
        events.push({ type: 'roomChanged', room: tr.to, from: tr.from, kind: tr.kind })
      } else if (tr.phase === 'in' && tr.t >= dur.in) {
        state.transition = null
        state.mode = 'play'
        events.push({ type: 'transitionDone', room: state.room })
      }
    }
    return events
  }

  return {
    state,
    request,
    tick,
    skipIntro() {
      if (state.mode !== 'intro') return []
      state.mode = 'play'
      return [{ type: 'introDone' }]
    },
    replayIntro() {
      if (state.mode !== 'play') return false
      state.mode = 'intro'
      state.t = 0
      state.room = 'hall'
      return true
    },
    progress() {
      const tr = state.transition
      if (!tr) return 0
      return Math.min(1, tr.t / DURATIONS[tr.kind][tr.phase])
    },
  }
}
