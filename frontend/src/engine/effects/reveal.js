import { clamp01 } from './tween.js'

// Random pixel order, biased so the sky (region 0) fills in before the ground (region 1).
export function revealOrder(regions, rng, groundDelay = 0.6) {
  const n = regions.length
  const keys = new Float64Array(n)
  for (let i = 0; i < n; i++) keys[i] = rng() + (regions[i] === 1 ? groundDelay : 0)
  const idx = Array.from({ length: n }, (_, i) => i)
  idx.sort((a, b) => keys[a] - keys[b])
  return Uint32Array.from(idx)
}

// Starts with a trickle of pixels and accelerates.
export function revealCount(p, total) {
  const x = clamp01(p)
  return x >= 1 ? total : Math.floor(total * x * x)
}
