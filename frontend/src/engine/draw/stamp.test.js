import { describe, it, expect } from 'vitest'
import { stubCtx } from '../../test/stubCtx.js'
import { drawStamp, STAMP_ICONS } from './stamp.js'
import { AVATAR_FEET_Y } from '../../scenes/rooms.js'

describe('drawStamp', () => {
  it('draws a small floating stamp above the floor at the stamp position', () => {
    const ctx = stubCtx()
    drawStamp(ctx, { id: 'research', x: 150, height: 22 }, 100, 0.4)
    const rects = ctx.calls.filter((c) => c[0] === 'fillRect')
    expect(rects.length).toBeGreaterThan(20)
    for (const [, x, y, w, h] of rects) {
      expect(x).toBeGreaterThanOrEqual(50 - 10); expect(x + w).toBeLessThanOrEqual(50 + 10)
      expect(y + h).toBeLessThanOrEqual(AVATAR_FEET_Y - 22 + 4)
      expect(y).toBeGreaterThanOrEqual(AVATAR_FEET_Y - 22 - 24)
    }
  })
  it('has an icon for every room', () => {
    expect(Object.keys(STAMP_ICONS)).toEqual(['hall', 'about', 'research', 'projects', 'experience', 'contact'])
  })
})
