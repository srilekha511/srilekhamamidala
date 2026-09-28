import { describe, it, expect } from 'vitest'
import * as data from '../data.js'
import { buildRooms } from './rooms.js'
import { spawnFor } from './spawn.js'

const rooms = buildRooms(data)

describe('spawnFor', () => {
  it('returning home puts the avatar in front of the room you left', () => {
    const f = rooms.hall.frames.find((x) => x.id === 'projects')
    expect(spawnFor('projects', rooms.hall)).toEqual({ x: f.x + f.w / 2, facing: 1 })
  })
  it('entering a section starts at its entrance', () => {
    expect(spawnFor('hall', rooms.about)).toEqual({ x: rooms.about.spawnX, facing: 1 })
    expect(spawnFor('projects', rooms.contact)).toEqual({ x: rooms.contact.spawnX, facing: 1 })
  })
  it('falls back to the room spawn for unknown origins', () => {
    expect(spawnFor('nowhere', rooms.hall)).toEqual({ x: rooms.hall.spawnX, facing: 1 })
  })
})
