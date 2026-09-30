import { describe, it, expect } from 'vitest'
import { createStorage } from './storage.js'
import { createPassport, STAMP_IDS } from './passport.js'

const memory = () => { const m = new Map(); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, v) } }

describe('passport', () => {
  it('has one stamp per room', () => {
    expect(STAMP_IDS).toEqual(['hall', 'about', 'research', 'projects', 'experience', 'contact'])
  })
  it('collects each stamp once and remembers it across visits', () => {
    const backend = memory()
    const p = createPassport(createStorage(backend))
    expect(p.collect('about')).toEqual({ added: true, complete: false })
    expect(p.collect('about')).toEqual({ added: false, complete: false })
    expect(createPassport(createStorage(backend)).list()).toEqual(['about'])
  })
  it('is complete once all six are collected', () => {
    const p = createPassport(createStorage(memory()))
    let last
    for (const id of STAMP_IDS) last = p.collect(id)
    expect(last).toEqual({ added: true, complete: true })
    expect(p.list()).toEqual(STAMP_IDS)
  })
  it('ignores unknown stamps and corrupt saved data', () => {
    const backend = memory(); backend.setItem('rg.stamps', '"nope"')
    const p = createPassport(createStorage(backend))
    expect(p.list()).toEqual([])
    expect(p.collect('attic')).toEqual({ added: false, complete: false })
  })
  it('still works when the browser blocks storage', () => {
    const blocked = { getItem() { throw new Error('x') }, setItem() { throw new Error('x') } }
    const p = createPassport(createStorage(blocked))
    expect(p.collect('hall').added).toBe(true)
    expect(p.list()).toEqual(['hall'])
  })
})
