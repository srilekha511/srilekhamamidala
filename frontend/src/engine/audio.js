const NOTES = { E4: 329.63, G4: 392, A4: 440, C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99 }
const MELODY = ['C5', 'E5', 'G5', 'E5', 'A4', 'C5', 'E5', 'C5', 'G4', 'C5', 'D5', 'G4', 'E4', 'G4', 'C5', 'G4']
const BEAT_MS = 220

export function createAudio({ AudioCtx = globalThis.AudioContext || globalThis.webkitAudioContext } = {}) {
  let ctx = null
  let master = null
  let enabled = false
  let timer = null
  let step = 0

  function ensure() {
    if (!AudioCtx) return false
    if (!ctx) {
      ctx = new AudioCtx()
      master = ctx.createGain()
      master.gain.value = 0.08
      master.connect(ctx.destination)
    }
    return true
  }

  // Browsers start audio suspended until a user gesture; queueing notes then would burst on resume.
  const running = () => ctx && (ctx.state === undefined || ctx.state === 'running')

  function unlockOnGesture() {
    const unlock = () => {
      ctx?.resume?.()
      if (running()) {
        window.removeEventListener('pointerdown', unlock)
        window.removeEventListener('keydown', unlock)
      }
    }
    window.addEventListener('pointerdown', unlock)
    window.addEventListener('keydown', unlock)
  }

  function blip(freq, dur, type = 'square', vol = 1, delay = 0) {
    if (!running()) return
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const t0 = ctx.currentTime + delay
    osc.type = type
    osc.frequency.value = freq
    gain.gain.setValueAtTime(vol, t0)
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur)
    osc.connect(gain).connect(master)
    osc.start(t0)
    osc.stop(t0 + dur)
  }

  const SFX = {
    step: () => blip(180, 0.04, 'square', 0.2),
    pop: () => blip(880 + Math.random() * 400, 0.05, 'square', 0.25),
    card: () => { blip(660, 0.06); blip(990, 0.08, 'square', 0.5, 0.06) },
    whoosh: () => { for (let i = 0; i < 8; i++) blip(300 + i * 120, 0.08, 'sawtooth', 0.3, i * 0.04) },
    sparkle: () => { for (let i = 0; i < 4; i++) blip(1200 + i * 300, 0.06, 'triangle', 0.3, i * 0.05) },
  }

  function stopMusic() {
    if (timer) clearInterval(timer)
    timer = null
  }
  function startMusic() {
    stopMusic()
    timer = setInterval(() => {
      const note = NOTES[MELODY[step % MELODY.length]]
      blip(note, 0.18, 'triangle', 0.6)
      if (step % 4 === 0) blip(note / 2, 0.35, 'square', 0.25)
      step++
    }, BEAT_MS)
  }

  return {
    get enabled() {
      return enabled
    },
    setEnabled(on) {
      enabled = !!on
      if (!enabled) {
        stopMusic()
        return
      }
      if (!ensure()) return
      ctx.resume?.()
      if (!running()) unlockOnGesture()
      startMusic()
    },
    sfx(name) {
      if (!enabled || !ctx) return
      SFX[name]?.()
    },
    destroy() {
      stopMusic()
      ctx?.close?.()
      ctx = null
    },
  }
}
