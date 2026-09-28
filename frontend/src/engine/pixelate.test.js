import { describe, it, expect } from 'vitest'
import { quantize, quantizeImageData, loadPixelated } from './pixelate.js'

describe('pixelate', () => {
  it('quantizes channels to the nearest level', () => {
    expect(quantize(0, 6)).toBe(0)
    expect(quantize(255, 6)).toBe(255)
    expect(quantize(60, 6)).toBe(51)
    expect(quantize(130, 6)).toBe(153)
  })
  it('leaves alpha untouched', () => {
    const d = new Uint8ClampedArray([60, 130, 200, 77])
    quantizeImageData(d, 6)
    expect(Array.from(d)).toEqual([51, 153, 204, 77])
  })
  it('resolves null (no throw) when the image fails to load', async () => {
    const res = await loadPixelated('/missing.png', 42, 32, { loadImage: () => Promise.reject(new Error('404')) })
    expect(res).toBe(null)
  })
  it('caches by src and size', () => {
    let calls = 0
    const loadImage = () => { calls++; return Promise.reject(new Error('x')) }
    loadPixelated('/a.png', 10, 10, { loadImage })
    loadPixelated('/a.png', 10, 10, { loadImage })
    expect(calls).toBe(1)
  })
})
