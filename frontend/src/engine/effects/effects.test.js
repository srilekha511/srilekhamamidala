import { describe, it, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import { lerpRect, easeInOut } from './tween.js'
import { revealOrder, revealCount } from './reveal.js'
import { applyRipple, rippleFlash, rippleAmplitude, zoomScale } from './ripple.js'
import { foldRect, settleScale, makeDust, dustAt } from './fold.js'
import { fadeAlpha } from './fade.js'

describe('rng', () => {
  it('is deterministic per seed and in [0,1)', () => {
    const a = mulberry32(7), b = mulberry32(7)
    for (let i = 0; i < 100; i++) {
      const v = a(); expect(v).toBe(b()); expect(v).toBeGreaterThanOrEqual(0); expect(v).toBeLessThan(1)
    }
  })
})

describe('tween', () => {
  it('lerpRect hits both endpoints', () => {
    const a = { x: 0, y: 0, w: 10, h: 10 }, b = { x: 100, y: 50, w: 20, h: 30 }
    expect(lerpRect(a, b, 0)).toEqual(a)
    expect(lerpRect(a, b, 1)).toEqual(b)
    expect(easeInOut(0.5)).toBeCloseTo(0.5)
  })
})

describe('reveal', () => {
  const regions = new Uint8Array(2000).map((_, i) => (i < 1000 ? 0 : 1))
  const order = revealOrder(regions, mulberry32(1))
  it('is a permutation of every pixel', () => {
    expect(order).toHaveLength(2000)
    expect(new Set(order).size).toBe(2000)
  })
  it('reveals the sky before the ground on average', () => {
    const pos = new Float64Array(2000)
    order.forEach((px, i) => { pos[px] = i })
    const mean = (from, to) => pos.slice(from, to).reduce((s, v) => s + v, 0) / (to - from)
    expect(mean(0, 1000)).toBeLessThan(mean(1000, 2000))
  })
  it('revealCount runs 0 → total and is clamped', () => {
    expect(revealCount(0, 500)).toBe(0)
    expect(revealCount(1, 500)).toBe(500)
    expect(revealCount(2, 500)).toBe(500)
    expect(revealCount(0.5, 500)).toBeLessThan(250) // starts slow
  })
})

describe('ripple', () => {
  const w = 8, h = 8
  const src = new Uint8ClampedArray(w * h * 4).map((_, i) => (i % 4 === 3 ? 255 : (i * 37) % 256))
  it('is the identity at p = 0', () => {
    const dst = new Uint8ClampedArray(src.length)
    applyRipple(src, dst, w, h, 4, 4, 0)
    expect(dst).toEqual(src)
  })
  it('distorts mid-way, only reusing source pixels', () => {
    const dst = new Uint8ClampedArray(src.length)
    applyRipple(src, dst, w, h, 4, 4, 0.5)
    expect(dst).not.toEqual(src)
    const srcPixels = new Set()
    for (let i = 0; i < src.length; i += 4) srcPixels.add(src.slice(i, i + 4).join())
    for (let i = 0; i < dst.length; i += 4) expect(srcPixels.has(dst.slice(i, i + 4).join())).toBe(true)
  })
  it('flashes to white by the end and zooms in', () => {
    expect(rippleFlash(0)).toBe(0)
    expect(rippleFlash(1)).toBe(1)
    expect(rippleAmplitude(0)).toBe(0)
    expect(zoomScale(0)).toBe(1)
    expect(zoomScale(1)).toBeGreaterThan(2)
  })
})

describe('fold', () => {
  const screen = { x: 0, y: 0, w: 320, h: 180 }, target = { x: 132, y: 66, w: 56, h: 44 }
  it('shrinks the screen into the frame', () => {
    expect(foldRect(0, screen, target)).toEqual(screen)
    expect(foldRect(1, screen, target)).toEqual(target)
  })
  it('settles from 1.4x to 1x', () => {
    expect(settleScale(0)).toBeCloseTo(1.4)
    expect(settleScale(1)).toBe(1)
  })
  it('dust fades out as it scatters', () => {
    const [d] = makeDust(1, mulberry32(3))
    expect(dustAt(d, 0, screen).alpha).toBe(1)
    expect(dustAt(d, 1, screen).alpha).toBe(0)
  })
})

describe('fade', () => {
  it('fades to black then back', () => {
    expect(fadeAlpha('out', 0)).toBe(0)
    expect(fadeAlpha('out', 1)).toBe(1)
    expect(fadeAlpha('in', 0)).toBe(1)
    expect(fadeAlpha('in', 1)).toBe(0)
  })
})
