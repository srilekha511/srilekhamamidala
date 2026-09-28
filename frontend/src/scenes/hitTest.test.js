import { describe, it, expect } from 'vitest'
import * as data from '../data.js'
import { buildRooms } from './rooms.js'
import { frameAt } from './hitTest.js'

const { hall, projects } = buildRooms(data)

describe('frameAt', () => {
  it('finds the hall painting under a world point, including its nameplate', () => {
    const f = hall.frames.find((x) => x.id === 'projects')
    expect(frameAt(hall, f.x + f.w / 2, f.y + f.h / 2)).toBe(f)
    expect(frameAt(hall, f.x + 1, f.y + f.h + 10)).toBe(f)
  })
  it('returns null on bare wall or floor', () => {
    const f = hall.frames.find((x) => x.id === 'projects')
    expect(frameAt(hall, f.x - 20, f.y + 5)).toBe(null)
    expect(frameAt(hall, f.x + 5, 160)).toBe(null)
  })
  it('works in section rooms too', () => {
    const f = projects.frames[2]
    expect(frameAt(projects, f.x + 3, f.y + 3)).toBe(f)
  })
})
