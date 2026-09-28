import { describe, it, expect } from 'vitest'
import { computeScale, VIEW_W, VIEW_H } from './renderer.js'

describe('computeScale', () => {
  it('uses an integer scale when at least 2x fits', () => {
    expect(computeScale(1440 - 32, 900 - 220)).toBe(3)
  })
  it('fills small screens with a fractional scale', () => {
    const s = computeScale(390 - 32, 600)
    expect(s).toBeGreaterThan(1)
    expect(s).toBeLessThan(2)
  })
  it('never exceeds the available width or height', () => {
    for (const [w, h] of [[358, 624], [200, 100], [1000, 300], [320, 180], [2560, 1300], [150, 90]]) {
      const s = computeScale(w, h)
      expect(VIEW_W * s).toBeLessThanOrEqual(w + 0.001)
      expect(VIEW_H * s).toBeLessThanOrEqual(h + 0.001)
      expect(s).toBeGreaterThan(0)
    }
  })
})
