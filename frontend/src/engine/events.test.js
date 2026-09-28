import { describe, it, expect, vi } from 'vitest'
import { createEmitter } from './events.js'

describe('emitter', () => {
  it('delivers payloads and unsubscribes', () => {
    const e = createEmitter(); const fn = vi.fn()
    const off = e.on('card', fn)
    e.emit('card', { a: 1 }); off(); e.emit('card', { a: 2 })
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith({ a: 1 })
  })
  it('ignores events with no listeners', () => {
    expect(() => createEmitter().emit('nobody', 1)).not.toThrow()
  })
})
