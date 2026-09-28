export const STEP = 1 / 60
export const MAX_FRAME = 0.25

export function createLoop({
  update,
  render,
  raf = (f) => requestAnimationFrame(f),
  caf = (id) => cancelAnimationFrame(id),
}) {
  let acc = 0
  let last = null
  let id = null

  function advance(dt) {
    acc += Math.min(Math.max(dt, 0), MAX_FRAME)
    let steps = 0
    while (acc >= STEP - 1e-9) {
      update(STEP)
      acc -= STEP
      steps++
    }
    return steps
  }

  function frame(ts) {
    if (last !== null) advance((ts - last) / 1000)
    last = ts
    render()
    id = raf(frame)
  }

  return {
    advance,
    start() {
      if (id === null) {
        last = null
        id = raf(frame)
      }
    },
    stop() {
      if (id !== null) caf(id)
      id = null
    },
  }
}
