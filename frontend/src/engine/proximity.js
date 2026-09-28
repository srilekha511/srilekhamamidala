export const ENTER_RANGE = 20
export const EXIT_RANGE = 28

export const centerOf = (item) => item.x + item.w / 2

export function nearestWithin(x, items, range) {
  let best = null
  let bestD = Infinity
  for (const item of items) {
    const d = Math.abs(centerOf(item) - x)
    if (d <= range && d < bestD) {
      best = item
      bestD = d
    }
  }
  return best
}

export function createProximityTracker({ enter = ENTER_RANGE, exit = EXIT_RANGE } = {}) {
  let active = null
  return {
    get active() {
      return active
    },
    update(x, items) {
      const prev = active
      if (active && Math.abs(centerOf(active) - x) > exit) active = null
      const candidate = nearestWithin(x, items, enter)
      if (candidate && (!active || Math.abs(centerOf(candidate) - x) < Math.abs(centerOf(active) - x))) {
        active = candidate
      }
      return { active, changed: prev !== active }
    },
    reset() {
      active = null
    },
  }
}
