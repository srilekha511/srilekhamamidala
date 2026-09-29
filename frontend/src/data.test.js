import { describe, it, expect } from 'vitest'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import * as data from './data.js'

const publicDir = resolve(__dirname, '../public')
const exists = (p) => existsSync(resolve(publicDir, p.replace(/^\/+/, '')))

describe('content', () => {
  it('has every project field the gallery needs and the images exist', () => {
    expect(data.projects.length).toBeGreaterThan(0)
    for (const p of data.projects) {
      expect(p.id).toBeDefined()
      for (const f of ['title', 'category', 'description', 'image']) expect(typeof p[f]).toBe('string')
      expect(Array.isArray(p.technologies)).toBe(true)
      expect(exists(p.image), p.image).toBe(true)
    }
  })
  it('has 8 experience entries with required fields and unique ids', () => {
    expect(data.experience).toHaveLength(8)
    const ids = new Set()
    for (const e of data.experience) {
      for (const f of ['id', 'company', 'role', 'dates', 'plaque', 'art']) expect(typeof e[f]).toBe('string')
      expect(typeof e.location).toBe('string')
      expect(e.bullets.length).toBeGreaterThan(0)
      ids.add(e.id)
    }
    expect(ids.size).toBe(8)
  })
  it('has about-room content', () => {
    expect(data.education.school).toMatch(/Massachusetts Institute of Technology/)
    expect(data.education.coursework.length).toBeGreaterThan(0)
    expect(data.skills.every((g) => g.group && g.items.length)).toBe(true)
    expect(data.interests.academic.length).toBeGreaterThan(0)
    expect(data.interests.personal).toEqual(['Classical Dance', 'Traveling/Backpacking', 'Cooking', 'Philadelphia Eagles', 'Painting', 'Singing'])
    expect(exists(data.profile.headshot)).toBe(true)
  })
  it('files every project and role into a room', () => {
    for (const p of data.projects) expect(['research', 'projects'], p.title).toContain(p.room)
    for (const e of data.experience) expect(['research', 'experience'], e.company).toContain(e.room)
  })
  it('never exposes a GPA', () => {
    const all = JSON.stringify(data)
    expect(all).not.toMatch(/GPA/i)
    expect(all).not.toMatch(/4\.7/)
  })
})
