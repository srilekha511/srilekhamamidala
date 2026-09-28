import { describe, it, expect } from 'vitest'
import { stubCtx } from '../../test/stubCtx.js'
import * as data from '../../data.js'
import { buildRooms } from '../../scenes/rooms.js'
import { drawRoom, frameInnerScreenRect } from './room.js'
import { drawAvatar } from './avatar.js'

const rooms = buildRooms(data)
const assets = { starry: {} }

describe('drawRoom', () => {
  it('draws every room without throwing, including missing thumbnails', () => {
    for (const room of Object.values(rooms)) {
      expect(() => drawRoom(stubCtx(), room, 0, 1, assets, null)).not.toThrow()
      expect(() => drawRoom(stubCtx(), room, room.width - 320, 1, assets, room.tiles[0]?.id)).not.toThrow()
    }
  })
  it('skips frames that are off screen', () => {
    const ctx = stubCtx()
    drawRoom(ctx, rooms.projects, 0, 0, assets, null)
    const drawnFar = ctx.calls.some((c) => c[0] === 'fillRect' && c[1] > 400)
    expect(drawnFar).toBe(false)
  })
  it('computes the inner rect of a frame in screen space', () => {
    const f = rooms.hall.frames[0]
    expect(frameInnerScreenRect(f, 10)).toEqual({ x: f.x - 10 + 3, y: f.y + 3, w: f.w - 6, h: f.h - 6 })
  })
})

describe('drawAvatar', () => {
  it('draws the sprite centred on avatar.x relative to the camera', () => {
    const ctx = stubCtx()
    drawAvatar(ctx, { x: 100, facing: 1, walking: false, animT: 0 }, 40)
    const xs = ctx.calls.filter((c) => c[0] === 'fillRect').map((c) => c[1])
    expect(Math.min(...xs)).toBeGreaterThanOrEqual(100 - 40 - 8 - 1)
    expect(Math.max(...xs)).toBeLessThanOrEqual(100 - 40 + 8 + 1)
  })
})

describe('intro layout follows the view width', () => {
  it('centres the painting and the Welcome text', async () => {
    const { setViewSize } = await import('../renderer.js')
    const { paintFull, drawWelcome } = await import('./intro.js')
    setViewSize(400)
    const r = paintFull()
    expect(r.x + r.w / 2).toBe(200)
    const ctx = stubCtx()
    drawWelcome(ctx, 1, 0)
    const [, text, x] = ctx.calls.filter((c) => c[0] === 'fillText').at(-1)
    expect(x + String(text).length * 8 / 2).toBeCloseTo(200, 0)
    setViewSize(320)
  })
})
