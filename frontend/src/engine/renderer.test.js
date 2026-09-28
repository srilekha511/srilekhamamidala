import { describe, it, expect } from 'vitest'
import { computeScale, fitView, VIEW_W, VIEW_H } from './renderer.js'

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

describe('fitView (game fills the window)', () => {
  it('fills a laptop/desktop window exactly, keeping 180px of world height', () => {
    const { viewW, scale } = fitView(1440, 900)
    expect(scale).toBe(5)
    expect(viewW).toBe(288)
    const wide = fitView(1920, 1080)
    expect(wide.viewW).toBe(320)
    expect(wide.viewW * wide.scale).toBeCloseTo(1920, 0)
    expect(VIEW_H * wide.scale).toBeCloseTo(1080, 0)
  })
  it('fills the width on portrait phones with a minimum world width', () => {
    const { viewW, scale } = fitView(390, 844)
    expect(viewW).toBe(240)
    expect(viewW * scale).toBeCloseTo(390, 0)
    expect(VIEW_H * scale).toBeLessThan(844)
  })
  it('caps very wide screens so rooms still fill the view', () => {
    const { viewW, scale } = fitView(3440, 800)
    expect(viewW).toBe(560)
    expect(viewW * scale).toBeLessThanOrEqual(3440)
    expect(VIEW_H * scale).toBeLessThanOrEqual(800 + 0.001)
  })
  it('never overflows the window', () => {
    for (const [w, h] of [[390, 844], [844, 390], [1280, 720], [300, 150], [2560, 1400], [5000, 400]]) {
      const { viewW, scale } = fitView(w, h)
      expect(viewW * scale).toBeLessThanOrEqual(w + 0.5)
      expect(VIEW_H * scale).toBeLessThanOrEqual(h + 0.5)
    }
  })
})

describe('setViewSize', () => {
  it('updates the live VIEW_W binding used across the engine', async () => {
    const mod = await import('./renderer.js')
    mod.setViewSize(288)
    expect(mod.VIEW_W).toBe(288)
    mod.setViewSize(320)
  })
})
