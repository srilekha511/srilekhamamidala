import { describe, it, expect } from 'vitest'
import { stubCtx } from '../../test/stubCtx.js'
import { generateStarryNight, SN_W, SN_H } from './starryNight.js'
import { drawCover } from './covers.js'

describe('Starry Night', () => {
  const p = generateStarryNight()
  it('is 144x90 RGBA, fully opaque', () => {
    expect(p.width).toBe(SN_W); expect(p.height).toBe(SN_H)
    expect(p.pixels).toHaveLength(SN_W * SN_H * 4)
    for (let i = 3; i < p.pixels.length; i += 4) expect(p.pixels[i]).toBe(255)
  })
  it('has both sky and ground regions, with sky across the top', () => {
    const sky = p.regions.filter((r) => r === 0).length
    expect(sky).toBeGreaterThan(SN_W * SN_H * 0.4)
    expect(sky).toBeLessThan(SN_W * SN_H * 0.8)
    expect(p.regions[SN_W * 2 + Math.floor(SN_W / 2)]).toBe(0)
    expect(p.regions[(SN_H - 1) * SN_W + Math.floor(SN_W / 2)]).toBe(1)
  })
  it('is deterministic', () => {
    expect(generateStarryNight().pixels).toEqual(p.pixels)
  })
  it('uses several distinct colours (swirls, stars, moon, village)', () => {
    const colours = new Set()
    for (let i = 0; i < p.pixels.length; i += 4) colours.add(`${p.pixels[i]},${p.pixels[i + 1]},${p.pixels[i + 2]}`)
    expect(colours.size).toBeGreaterThanOrEqual(10)
  })
})

describe('covers', () => {
  for (const id of ['about', 'projects', 'experience', 'contact', 'unknown']) {
    it(`${id} cover stays inside its frame`, () => {
      const ctx = stubCtx()
      const X = 100, Y = 47, W = 50, H = 38
      drawCover(ctx, id, X, Y, W, H, 1.3)
      const rects = ctx.calls.filter((c) => c[0] === 'fillRect')
      expect(rects.length).toBeGreaterThan(0)
      for (const [, x, y, w, h] of rects) {
        expect(x).toBeGreaterThanOrEqual(X); expect(y).toBeGreaterThanOrEqual(Y)
        expect(x + w).toBeLessThanOrEqual(X + W); expect(y + h).toBeLessThanOrEqual(Y + H)
      }
    })
  }
})
