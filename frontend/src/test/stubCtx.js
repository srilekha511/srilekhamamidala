// Minimal CanvasRenderingContext2D stand-in that records every method call.
export function stubCtx() {
  const calls = []
  const target = {
    calls,
    measureText: (s) => ({ width: String(s).length * 8 }),
  }
  return new Proxy(target, {
    get(t, key) {
      if (key in t) return t[key]
      return (...args) => { calls.push([key, ...args]) }
    },
    set(t, key, value) {
      if (key === 'fillStyle') calls.push(['fillStyle', value])
      t[key] = value
      return true
    },
  })
}
