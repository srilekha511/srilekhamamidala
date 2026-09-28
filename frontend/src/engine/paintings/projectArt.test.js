import { describe, it, expect } from 'vitest'
import { stubCtx } from '../../test/stubCtx.js'
import * as data from '../../data.js'
import { PROJECT_ART, drawProjectArt } from './projectArt.js'

const X = 100, Y = 53, W = 42, H = 32 // item frame inner area

describe('project art', () => {
  for (const name of Object.keys(PROJECT_ART)) {
    it(`${name} is a real scene that stays inside its frame`, () => {
      const ctx = stubCtx()
      drawProjectArt(ctx, name, X, Y, W, H, 1.3)
      const rects = ctx.calls.filter((c) => c[0] === 'fillRect')
      expect(rects.length).toBeGreaterThan(10)
      for (const [, x, y, w, h] of rects) {
        expect(x).toBeGreaterThanOrEqual(X); expect(y).toBeGreaterThanOrEqual(Y)
        expect(x + w).toBeLessThanOrEqual(X + W); expect(y + h).toBeLessThanOrEqual(Y + H)
      }
    })
  }
  it('falls back to the idea lightbulb for unknown names', () => {
    const a = stubCtx(), b = stubCtx()
    drawProjectArt(a, 'nope', X, Y, W, H, 0)
    drawProjectArt(b, 'idea', X, Y, W, H, 0)
    expect(a.calls).toEqual(b.calls)
  })
  it('every project picks an existing scene, and each scene is used once', () => {
    const arts = data.projects.map((p) => p.art)
    for (const a of arts) expect(PROJECT_ART, String(a)).toHaveProperty(a)
    expect(new Set(arts).size).toBe(arts.length)
  })
})
