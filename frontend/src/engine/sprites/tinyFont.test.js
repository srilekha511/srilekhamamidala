import { describe, it, expect } from 'vitest'
import { stubCtx } from '../../test/stubCtx.js'
import { GLYPHS, textWidth, drawTinyText, plaqueWidth, drawPlaque } from './tinyFont.js'

describe('tiny plaque font', () => {
  it('every glyph is 5 tall and 3 wide, except the wide M and W', () => {
    for (const [ch, rows] of Object.entries(GLYPHS)) {
      expect(rows, ch).toHaveLength(5)
      const w = 'MW'.includes(ch) ? 5 : 3
      for (const r of rows) expect(r.length, ch).toBe(w)
    }
  })
  it('covers letters, digits and plaque punctuation', () => {
    for (const ch of "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 &-.'?") expect(GLYPHS, ch).toHaveProperty(ch)
  })
  it('measures 4px per character minus the trailing gap', () => {
    expect(textWidth('ABC')).toBe(11)
    expect(textWidth('')).toBe(0)
    expect(textWidth('MW')).toBe(11)
    expect(textWidth('email')).toBe(21)
  })
  it('draws lowercase as uppercase and unknown characters as ?', () => {
    const a = stubCtx(), b = stubCtx()
    drawTinyText(a, 'dermalab~', 0, 0, '#000')
    drawTinyText(b, 'DERMALAB?', 0, 0, '#000')
    expect(a.calls).toEqual(b.calls)
  })
  it('plaques are centred and fit their text', () => {
    const ctx = stubCtx()
    drawPlaque(ctx, 100, 50, 'MIT Media Lab')
    const w = plaqueWidth('MIT Media Lab')
    const rects = ctx.calls.filter((c) => c[0] === 'fillRect')
    for (const [, x, , rw] of rects) {
      expect(x).toBeGreaterThanOrEqual(100 - Math.ceil(w / 2))
      expect(x + rw).toBeLessThanOrEqual(100 + Math.ceil(w / 2))
    }
  })
})
