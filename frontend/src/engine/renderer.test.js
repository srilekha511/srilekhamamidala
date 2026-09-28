import { describe, it, expect } from 'vitest'
import { computeScale, fitScale, VIEW_W, VIEW_H } from './renderer.js'

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

describe('fitScale (whole viewport, reserving room for cards)', () => {
  it('keeps the desktop layout at an integer 3x', () => {
    expect(fitScale(1440, 900)).toBe(3)
  })
  it('stays usable on a landscape phone', () => {
    expect(VIEW_W * fitScale(844, 340)).toBeGreaterThanOrEqual(400)
  })
  it('never collapses on very short windows', () => {
    expect(fitScale(1000, 200)).toBeGreaterThanOrEqual(0.5)
  })
  it('never overflows the width (16px gutters)', () => {
    for (const [w, h] of [[390, 844], [844, 340], [300, 150], [1000, 200], [2560, 1400]]) {
      expect(VIEW_W * fitScale(w, h)).toBeLessThanOrEqual(w - 32 + 0.001)
    }
  })
})
