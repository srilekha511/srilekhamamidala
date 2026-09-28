import { describe, it, expect } from 'vitest'
import { createStorage } from './storage.js'

function mapBackend() {
  const m = new Map()
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, v), m }
}
const throwing = {
  getItem() { throw new Error('blocked') },
  setItem() { throw new Error('blocked') },
}

describe('storage', () => {
  it('round-trips JSON values through the backend', () => {
    const b = mapBackend()
    createStorage(b).set('k', { a: 1 })
    expect(createStorage(b).get('k', null)).toEqual({ a: 1 })
  })
  it('returns the fallback for missing keys', () => {
    expect(createStorage(mapBackend()).get('nope', false)).toBe(false)
  })
  it('never throws when the backend throws, and remembers in memory', () => {
    const s = createStorage(throwing)
    expect(() => s.set('k', true)).not.toThrow()
    expect(s.get('k', false)).toBe(true)
    expect(s.get('other', 'fb')).toBe('fb')
  })
  it('works with no backend at all', () => {
    const s = createStorage(null)
    s.set('k', 3)
    expect(s.get('k', 0)).toBe(3)
  })
  it('falls back when stored JSON is corrupt', () => {
    const b = mapBackend(); b.m.set('k', '{oops')
    expect(createStorage(b).get('k', 'fb')).toBe('fb')
  })
})
