import { describe, it, expect, vi } from 'vitest'
import { createLoop, STEP } from './loop.js'

describe('loop', () => {
  it('runs fixed steps for elapsed time', () => {
    const update = vi.fn()
    const loop = createLoop({ update, render: () => {}, raf: () => 0, caf: () => {} })
    expect(loop.advance(STEP * 3)).toBe(3)
    expect(update).toHaveBeenCalledWith(STEP)
  })
  it('clamps huge frame gaps (background tab) to 0.25s', () => {
    const loop = createLoop({ update: () => {}, render: () => {}, raf: () => 0, caf: () => {} })
    expect(loop.advance(10)).toBe(15)
  })
  it('ignores negative dt', () => {
    const loop = createLoop({ update: () => {}, render: () => {}, raf: () => 0, caf: () => {} })
    expect(loop.advance(-1)).toBe(0)
  })
})
