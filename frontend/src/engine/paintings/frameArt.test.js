import { describe, it, expect } from 'vitest'
import { stubCtx } from '../../test/stubCtx.js'
import * as data from '../../data.js'
import { FRAME_ART, drawFrameArt, HOBBY_ICONS } from './frameArt.js'

const X = 100, Y = 53, W = 42, H = 32 // item frame inner area

it('has scenes for the About and Contact rooms', () => {
  for (const k of ['avatar', 'mit', 'inventory', 'interests', 'email', 'github', 'linkedin']) expect(FRAME_ART).toHaveProperty(k)
})

describe('frame art', () => {
  for (const name of Object.keys(FRAME_ART)) {
    it(`${name} is a real scene that stays inside its frame`, () => {
      const ctx = stubCtx()
      drawFrameArt(ctx, name, X, Y, W, H, 1.3)
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
    drawFrameArt(a, 'nope', X, Y, W, H, 0)
    drawFrameArt(b, 'idea', X, Y, W, H, 0)
    expect(a.calls).toEqual(b.calls)
  })
  it('every project and role picks an existing scene, and each scene is used once', () => {
    const arts = [...data.projects, ...data.experience].map((p) => p.art)
    for (const a of arts) expect(FRAME_ART, String(a)).toHaveProperty(a)
    expect(new Set(arts).size).toBe(arts.length)
  })
  it('the Interests painting shows one 8x8 icon per For Fun hobby', () => {
    expect(Object.keys(HOBBY_ICONS)).toEqual(['dance', 'travel', 'cooking', 'eagles', 'painting', 'singing'])
    for (const [name, { rows }] of Object.entries(HOBBY_ICONS)) {
      expect(rows, name).toHaveLength(8)
      for (const r of rows) expect(r.length, name).toBe(8)
    }
  })
})
