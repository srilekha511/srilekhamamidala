import { describe, it, expect } from 'vitest'
import { fireworkPixels } from './fireworks.js'

describe('fireworks', () => {
  it('shows bursts of fading coloured sparks around the centre', () => {
    for (const t of [0.2, 0.7, 1.3, 2.9]) {
      const px = fireworkPixels(t, 100, 40)
      expect(px.length, `t=${t}`).toBeGreaterThan(0)
      for (const p of px) {
        expect(Math.hypot(p.x - 100, p.y - 40)).toBeLessThan(40)
        expect(p.alpha).toBeGreaterThan(0)
        expect(p.alpha).toBeLessThanOrEqual(1)
        expect(p.color).toMatch(/^#[0-9a-f]{6}$/)
        expect(p.size).toBe(2) // chunky enough to read on light walls
      }
    }
  })
  it('is deterministic for a given time', () => {
    expect(fireworkPixels(1.1, 0, 0)).toEqual(fireworkPixels(1.1, 0, 0))
  })
})
