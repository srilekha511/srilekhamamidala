import { describe, it, expect } from 'vitest'
import { createProximityTracker, nearestWithin } from './proximity.js'

const A = { id: 'a', x: 100, w: 40 } // centre 120
const B = { id: 'b', x: 160, w: 40 } // centre 180

describe('proximity', () => {
  it('finds the nearest item within range', () => {
    expect(nearestWithin(118, [A, B], 20)).toBe(A)
    expect(nearestWithin(150, [A, B], 20)).toBe(null)
  })
  it('activates at enter range and holds until exit range (no boundary flicker)', () => {
    const t = createProximityTracker({ enter: 20, exit: 28 })
    expect(t.update(95, [A]).active).toBe(null)
    const r = t.update(101, [A]); expect(r.active).toBe(A); expect(r.changed).toBe(true)
    expect(t.update(99, [A])).toEqual({ active: A, changed: false }) // 21 away: still active
    expect(t.update(101, [A]).changed).toBe(false)
    expect(t.update(91, [A])).toEqual({ active: null, changed: true }) // 29 away
  })
  it('switches to a strictly nearer item', () => {
    const t = createProximityTracker({ enter: 40, exit: 50 })
    t.update(140, [A, B])
    expect(t.update(165, [A, B]).active).toBe(B)
  })
  it('reset clears the active item', () => {
    const t = createProximityTracker(); t.update(120, [A]); t.reset()
    expect(t.active).toBe(null)
  })
})
