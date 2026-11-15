import { describe, it, expect } from 'vitest'
import { wormholePixels, WH_SIZE, WH_PALETTE, WH_STAR, WH_RIM } from './wormhole.js'

const px = (data, x, y) => {
  const i = (y * WH_SIZE + x) * 4
  return [data[i], data[i + 1], data[i + 2], data[i + 3]]
}
const key = (r, g, b) => `${r},${g},${b}`

describe('wormholePixels', () => {
  it('fills an RGBA buffer the size of the portal', () => {
    expect(wormholePixels(0)).toHaveLength(WH_SIZE * WH_SIZE * 4)
  })
  it('is a round hole: corners are transparent, the middle is an opaque dark void', () => {
    const d = wormholePixels(1.3)
    for (const [x, y] of [[0, 0], [WH_SIZE - 1, 0], [0, WH_SIZE - 1], [WH_SIZE - 1, WH_SIZE - 1]]) expect(px(d, x, y)[3]).toBe(0)
    const c = Math.floor(WH_SIZE / 2)
    const [r, g, b, a] = px(d, c, c)
    expect(a).toBe(255)
    expect(r + g + b).toBeLessThan(60)
  })
  it('only uses the palette, rim and star colours (crisp pixel art, no blending)', () => {
    const allowed = new Set([...WH_PALETTE, WH_STAR, WH_RIM].map((c) => key(...c)))
    const d = wormholePixels(2.7)
    for (let i = 0; i < d.length; i += 4) if (d[i + 3]) expect(allowed.has(key(d[i], d[i + 1], d[i + 2]))).toBe(true)
  })
  it('swirls over time and is the same frame for the same time', () => {
    expect(wormholePixels(0.5)).toEqual(wormholePixels(0.5))
    expect(wormholePixels(0.5)).not.toEqual(wormholePixels(0.9))
  })
  it('matches the site theme: no light blue, and a gold rim with cream stars', () => {
    expect(WH_RIM).toEqual([212, 169, 58]) // --gold
    expect(WH_STAR).toEqual([251, 243, 224]) // --paper cream
    for (const [r, g, b] of [...WH_PALETTE, WH_STAR, WH_RIM]) expect(b > 200 && g > 160 && r < 200).toBe(false)
    const d = wormholePixels(1.1)
    let rim = 0
    for (let i = 0; i < d.length; i += 4) if (d[i] === 212 && d[i + 1] === 169 && d[i + 2] === 58) rim++
    expect(rim).toBeGreaterThan(20)
  })
})
