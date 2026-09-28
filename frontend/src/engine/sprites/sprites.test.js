import { describe, it, expect } from 'vitest'
import { stubCtx } from '../../test/stubCtx.js'
import { drawPixelArt } from './pixelArt.js'
import { AVATAR_FRAMES, AVATAR_PALETTE, AVATAR_W, AVATAR_H, avatarFrame } from './avatar.js'
import { ICONS, drawIcon } from './icons.js'

const fillRects = (ctx) => ctx.calls.filter((c) => c[0] === 'fillRect')

describe('pixel art', () => {
  it('draws one rect per opaque pixel and mirrors when flipped', () => {
    const ctx = stubCtx()
    drawPixelArt(ctx, ['x.', '..'], { x: '#fff' }, 10, 20)
    expect(fillRects(ctx)).toEqual([['fillRect', 10, 20, 1, 1]])
    const f = stubCtx()
    drawPixelArt(f, ['x.', '..'], { x: '#fff' }, 10, 20, { flip: true, scale: 2 })
    expect(fillRects(f)).toEqual([['fillRect', 12, 20, 2, 2]])
  })
})

describe('avatar', () => {
  it('every frame is 16x24 and uses only palette colours', () => {
    for (const [name, rows] of Object.entries(AVATAR_FRAMES)) {
      expect(rows, name).toHaveLength(AVATAR_H)
      for (const row of rows) {
        expect(row.length, `${name}: "${row}"`).toBe(AVATAR_W)
        for (const ch of row) expect(ch === '.' || ch in AVATAR_PALETTE, `${name} char ${ch}`).toBe(true)
      }
    }
  })
  it('has glasses, maroon hoodie, black hair and skin colours', () => {
    expect(AVATAR_PALETTE.m.toLowerCase()).toBe('#8a1f2b')
    for (const k of ['k', 's', 'g', 'm']) expect(AVATAR_PALETTE[k]).toBeTruthy()
  })
  it('cycles through distinct walk frames with a bob', () => {
    const seen = new Set()
    const offsets = new Set()
    for (let t = 0; t < 0.5; t += 0.05) {
      const f = avatarFrame({ walking: true, animT: t })
      seen.add(f.rows); offsets.add(f.yOffset)
    }
    expect(seen.size).toBe(2)
    expect(offsets).toEqual(new Set([0, -1]))
  })
  it('idles and occasionally blinks', () => {
    expect(avatarFrame({ walking: false, animT: 0.5 }).rows).toBe(AVATAR_FRAMES.idle)
    expect(avatarFrame({ walking: false, animT: 2.9 }).rows).toBe(AVATAR_FRAMES.blink)
  })
})

describe('icons', () => {
  it('are all 8x8', () => {
    for (const [name, rows] of Object.entries(ICONS)) {
      expect(rows, name).toHaveLength(8)
      for (const r of rows) expect(r.length, name).toBe(8)
    }
  })
  it('drawIcon ignores unknown names', () => {
    const ctx = stubCtx()
    expect(() => drawIcon(ctx, 'nope', 0, 0, '#fff')).not.toThrow()
    expect(fillRects(ctx)).toHaveLength(0)
  })
  it('tucks legs in the air and squashes on landing', () => {
    expect(avatarFrame({ walking: false, animT: 0, airborne: true }).rows).toBe(AVATAR_FRAMES.walkB)
    expect(avatarFrame({ walking: true, animT: 0, landing: 0.1 }).yOffset).toBe(1)
  })
})
