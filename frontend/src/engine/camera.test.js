import { describe, it, expect } from 'vitest'
import { clampCamera, followCamera } from './camera.js'

describe('camera', () => {
  it('clamps to room bounds', () => {
    expect(clampCamera(-50, 1000)).toBe(0)
    expect(clampCamera(900, 1000)).toBe(680)
    expect(clampCamera(100, 200)).toBe(0) // room narrower than view
  })
  it('eases toward the avatar-centred position', () => {
    const x = followCamera(0, 500, 1000, 1 / 60)
    expect(x).toBeGreaterThan(0)
    expect(x).toBeLessThan(340)
    let c = 0
    for (let i = 0; i < 600; i++) c = followCamera(c, 500, 1000, 1 / 60)
    expect(c).toBeCloseTo(340, 1)
  })
})
