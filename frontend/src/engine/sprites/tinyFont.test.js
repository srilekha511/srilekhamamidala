import { describe, it, expect } from 'vitest'
import { stubCtx } from '../../test/stubCtx.js'
import { GLYPHS, textWidth, drawTinyText, plaqueWidth, plaqueLines, drawPlaque } from './tinyFont.js'

describe('tiny plaque font', () => {
  it('every glyph is 5 tall and 3 wide, except the wide M and W', () => {
    for (const [ch, rows] of Object.entries(GLYPHS)) {
      expect(rows, ch).toHaveLength(5)
      const w = 'MW'.includes(ch) ? 5 : 3
      for (const r of rows) expect(r.length, ch).toBe(w)
    }
  })
  it('covers letters, digits and plaque punctuation', () => {
    for (const ch of "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 &-.,'?+") expect(GLYPHS, ch).toHaveProperty(ch)
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
  it('puts the lab on its own line and wraps long lines at word breaks', () => {
    expect(plaqueLines('Skills')).toEqual(['Skills'])
    expect(plaqueLines('LLM Evaluation @ MIT CSAIL')).toEqual(['LLM Evaluation', 'MIT CSAIL'])
    expect(plaqueLines('LLMs for Legal Code @ University of Pennsylvania')).toEqual(['LLMs for Legal Code', 'University of', 'Pennsylvania'])
  })
  it('multi-line plaques are as wide as their widest line and draw every line', () => {
    const text = 'ML + Drug Repurposing @ Drexel University'
    expect(plaqueWidth(text)).toBe(plaqueWidth('Drexel University'))
    const ctx = stubCtx()
    drawPlaque(ctx, 100, 50, text)
    const ys = new Set(ctx.calls.filter((c) => c[0] === 'fillRect' && c[3] === 1 && c[4] === 1).map((c) => c[2]))
    expect(Math.max(...ys) - Math.min(...ys)).toBeGreaterThanOrEqual(7 + 4) // two lines of glyphs
  })
  it('shows the lab in maroon instead of an @', () => {
    const ctx = stubCtx()
    drawPlaque(ctx, 100, 50, 'Topic @ Lab')
    const styles = ctx.calls.filter((c) => c[0] === 'fillStyle').map((c) => c[1])
    expect(styles.slice(-2)).toEqual(['#3a2a10', '#8a1f2b']) // topic ink, then lab maroon
  })
})
