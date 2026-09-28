import { describe, it, expect } from 'vitest'
import { createHallScene, WALK_SPEED, AVATAR_MARGIN, JUMP_VELOCITY, GRAVITY } from './hallScene.js'

const fakeInput = ({ dir = 0, presses = [] } = {}) => {
  const p = new Set(presses)
  return { direction: () => dir, consume: (a) => p.delete(a) }
}
const room = {
  id: 'hall', width: 400, spawnX: 50,
  frames: [
    { id: 'starry', kind: 'starry', x: 60, w: 38 },
    { id: 'about', kind: 'section', target: 'about', x: 200, w: 56 }, // centre 228
  ],
  tiles: [],
}
const sectionRoom = {
  id: 'about', width: 400, spawnX: 24,
  frames: [{ id: 'about-me', kind: 'item', x: 70, w: 48, card: { title: 'Me' } }], // centre 94
  tiles: [{ id: 'tile-hall', target: 'hall', x: 300, w: 24 }], // centre 312
}

describe('hallScene', () => {
  it('walks at WALK_SPEED and faces the walking direction', () => {
    const s = createHallScene(room)
    s.update(0.5, fakeInput({ dir: 1 }))
    expect(s.avatar.x).toBeCloseTo(50 + WALK_SPEED * 0.5)
    expect(s.avatar.facing).toBe(1)
    expect(s.avatar.walking).toBe(true)
    s.update(0.1, fakeInput({ dir: -1 }))
    expect(s.avatar.facing).toBe(-1)
  })
  it('stays inside the room', () => {
    const s = createHallScene(room)
    for (let i = 0; i < 100; i++) s.update(0.1, fakeInput({ dir: -1 }))
    expect(s.avatar.x).toBe(AVATAR_MARGIN)
    for (let i = 0; i < 100; i++) s.update(0.1, fakeInput({ dir: 1 }))
    expect(s.avatar.x).toBe(room.width - AVATAR_MARGIN)
  })
  it('emits firstMove exactly once', () => {
    const s = createHallScene(room)
    const a = s.update(0.1, fakeInput({ dir: 1 }))
    const b = s.update(0.1, fakeInput({ dir: 1 }))
    expect(a.filter((e) => e.type === 'firstMove')).toHaveLength(1)
    expect(b.filter((e) => e.type === 'firstMove')).toHaveLength(0)
  })
  it('emits frame events on enter and leave only', () => {
    const s = createHallScene(room, { spawnX: 228 })
    expect(s.update(0.016, fakeInput())).toContainEqual({ type: 'frame', frame: room.frames[1] })
    expect(s.update(0.016, fakeInput()).some((e) => e.type === 'frame')).toBe(false)
    s.walkTo(330)
    let evs = []
    for (let i = 0; i < 200; i++) evs = evs.concat(s.update(0.016, fakeInput()))
    expect(evs).toContainEqual({ type: 'frame', frame: null })
  })
  it('Enter near a section frame requests travel to it', () => {
    const s = createHallScene(room, { spawnX: 228 })
    s.update(0.016, fakeInput())
    const evs = s.update(0.016, fakeInput({ presses: ['interact'] }))
    expect(evs).toContainEqual({ type: 'go', target: 'about', origin: room.frames[1] })
  })
  it('Enter near an item frame or the Starry Night does nothing', () => {
    const s = createHallScene(room, { spawnX: 79 })
    s.update(0.016, fakeInput())
    expect(s.update(0.016, fakeInput({ presses: ['interact'] })).some((e) => e.type === 'go')).toBe(false)
  })
  it('Enter on a portal tile travels to its target', () => {
    const s = createHallScene(sectionRoom, { spawnX: 312 })
    expect(s.update(0.016, fakeInput())).toContainEqual({ type: 'tile', tile: sectionRoom.tiles[0] })
    expect(s.update(0.016, fakeInput({ presses: ['interact'] }))).toContainEqual({ type: 'go', target: 'hall', origin: sectionRoom.tiles[0] })
  })
  it('walkTo arrives exactly and stops without oscillating', () => {
    const s = createHallScene(room)
    s.walkTo(120)
    for (let i = 0; i < 120; i++) s.update(1 / 60, fakeInput())
    expect(s.avatar.x).toBe(120)
    expect(s.avatar.walking).toBe(false)
  })
  it('keyboard input cancels a walkTo target', () => {
    const s = createHallScene(room)
    s.walkTo(300)
    s.update(0.1, fakeInput({ dir: -1 }))
    for (let i = 0; i < 10; i++) s.update(0.1, fakeInput())
    expect(s.avatar.x).toBeLessThan(50)
  })
  it('jumps about 1.5 avatar heights and lands exactly on the floor', () => {
    const s = createHallScene(room)
    const evs = s.update(1 / 60, fakeInput({ presses: ['jump'] }))
    expect(evs).toContainEqual({ type: 'jump' })
    let peak = 0, landed = null
    for (let i = 1; i < 120 && landed === null; i++) {
      const e = s.update(1 / 60, fakeInput())
      peak = Math.max(peak, s.avatar.y)
      if (e.some((x) => x.type === 'land')) landed = i / 60
    }
    expect(peak).toBeGreaterThan(30)
    expect(peak).toBeLessThan(42)
    expect(landed).toBeCloseTo((2 * JUMP_VELOCITY) / GRAVITY, 1)
    expect(s.avatar.y).toBe(0)
    expect(s.avatar.airborne).toBe(false)
  })
  it('cannot double-jump in mid-air', () => {
    const s = createHallScene(room)
    s.update(1 / 60, fakeInput({ presses: ['jump'] }))
    s.update(0.1, fakeInput())
    expect(s.update(1 / 60, fakeInput({ presses: ['jump'] })).some((e) => e.type === 'jump')).toBe(false)
  })
  it('can steer left and right in mid-air', () => {
    const s = createHallScene(room)
    s.update(1 / 60, fakeInput({ presses: ['jump'] }))
    s.update(0.2, fakeInput({ dir: 1 }))
    expect(s.avatar.x).toBeGreaterThan(50)
    expect(s.avatar.y).toBeGreaterThan(0)
  })
  it('portals only respond once the avatar has landed', () => {
    const s = createHallScene(sectionRoom, { spawnX: 312 })
    s.update(1 / 60, fakeInput({ presses: ['jump'] }))
    expect(s.update(1 / 60, fakeInput({ presses: ['interact'] })).some((e) => e.type === 'go')).toBe(false)
    for (let i = 0; i < 60; i++) s.update(1 / 60, fakeInput())
    expect(s.update(1 / 60, fakeInput({ presses: ['interact'] })).some((e) => e.type === 'go')).toBe(true)
  })
})
