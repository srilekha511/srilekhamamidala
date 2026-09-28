import { clamp01, easeInOut, lerpRect } from './tween.js'

export const foldRect = (p, screen, target) => (p <= 0 ? { ...screen } : p >= 1 ? { ...target } : lerpRect(screen, target, easeInOut(p)))
export const settleScale = (p) => (p >= 1 ? 1 : 1 + 0.4 * (1 - easeInOut(p)))

const DUST_COLORS = ['#f2d27a', '#d4a93a', '#ffffff', '#9fb7e8']

// Particles start on the edge of the shrinking room image and drift outward.
export function makeDust(count, rng) {
  return Array.from({ length: count }, () => {
    const edge = Math.floor(rng() * 4)
    const t = rng()
    const u = edge === 0 ? t : edge === 1 ? 1 : edge === 2 ? t : 0
    const v = edge === 0 ? 0 : edge === 1 ? t : edge === 2 ? 1 : t
    const angle = Math.atan2(v - 0.5, u - 0.5) + (rng() - 0.5)
    const speed = 20 + rng() * 40
    return { u, v, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, color: DUST_COLORS[Math.floor(rng() * DUST_COLORS.length)] }
  })
}

export function dustAt(d, p, rect) {
  const k = clamp01(p)
  return {
    x: rect.x + d.u * rect.w + d.vx * k,
    y: rect.y + d.v * rect.h + d.vy * k,
    alpha: 1 - k,
  }
}
