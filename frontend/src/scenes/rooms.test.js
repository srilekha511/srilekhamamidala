import { describe, it, expect } from 'vitest'
import * as data from '../data.js'
import { buildRooms, SECTIONS, THEMES } from './rooms.js'
import { plaqueWidth } from '../engine/sprites/tinyFont.js'

const rooms = buildRooms(data)
const sectionIds = SECTIONS.map((s) => s.id)

describe('rooms', () => {
  it('main hall has the five frames in spec order and no tiles', () => {
    expect(rooms.hall.frames.map((f) => f.id)).toEqual(['starry', 'about', 'projects', 'experience', 'contact'])
    expect(rooms.hall.tiles).toEqual([])
    const [starry, about] = rooms.hall.frames
    expect(starry.w).toBeLessThan(about.w)
    expect(starry.h).toBeLessThan(about.h)
    for (const f of rooms.hall.frames.slice(1)) expect(f.target).toBe(f.id)
  })
  it('has one frame per project and per experience entry', () => {
    expect(rooms.projects.frames).toHaveLength(data.projects.length)
    expect(rooms.experience.frames).toHaveLength(data.experience.length)
    expect(rooms.about.frames.map((f) => f.id)).toEqual(['about-me', 'about-education', 'about-skills', 'about-interests'])
    expect(rooms.contact.frames.map((f) => f.id)).toEqual(['contact-email', 'contact-github', 'contact-linkedin'])
  })
  it('every section room starts with a Home portal before the first painting', () => {
    for (const id of sectionIds) {
      const room = rooms[id]
      const [start] = room.tiles
      expect(start.target).toBe('hall')
      expect(start.x + start.w).toBeLessThan(room.frames[0].x)
      expect(room.spawnX).toBeGreaterThan(start.x + start.w + 14) // arrive clear of the tile
      expect(room.spawnX).toBeLessThan(room.frames[0].x)
    }
  })
  it('every section room ends with Home + the other three sections', () => {
    for (const id of sectionIds) {
      const room = rooms[id]
      const end = room.tiles.slice(1)
      const targets = end.map((t) => t.target)
      expect(targets[0]).toBe('hall')
      expect(targets).toHaveLength(4)
      expect(targets).not.toContain(id)
      expect(new Set(targets)).toEqual(new Set(['hall', ...sectionIds.filter((s) => s !== id)]))
      const lastFrame = room.frames.at(-1)
      expect(end[0].x).toBeGreaterThan(lastFrame.x + lastFrame.w)
      expect(room.width).toBeGreaterThanOrEqual(end.at(-1).x + end.at(-1).w)
    }
  })
  it('tile labels (8px pixel font) never overlap', () => {
    for (const id of sectionIds) {
      const tiles = rooms[id].tiles.slice(1)
      tiles.forEach((t, i) => {
        if (i === 0) return
        const prev = tiles[i - 1]
        const gap = (t.x + t.w / 2) - (prev.x + prev.w / 2)
        expect(gap).toBeGreaterThanOrEqual((t.label.length + prev.label.length) * 4 + 8)
      })
    }
  })
  it('frames never overlap and are sorted left to right', () => {
    for (const room of Object.values(rooms)) {
      room.frames.forEach((f, i) => {
        if (i > 0) expect(f.x).toBeGreaterThanOrEqual(room.frames[i - 1].x + room.frames[i - 1].w)
      })
    }
  })
  it('item frames carry complete cards', () => {
    for (const id of sectionIds) {
      for (const f of rooms[id].frames) {
        expect(f.kind).toBe('item')
        expect(f.card.title).toBeTruthy()
        for (const k of ['body', 'bullets', 'tags', 'links']) expect(Array.isArray(f.card[k])).toBe(true)
      }
    }
  })
  it('experience cards show role, location and dates', () => {
    const disney = rooms.experience.frames[0].card
    expect(disney.title).toBe('Disney Streaming')
    expect(disney.subtitle).toBe('Software Engineering Intern')
    expect(disney.meta).toBe('Santa Monica, CA · June 2026 – August 2026')
    const hof = rooms.experience.frames.find((f) => f.id === 'exp-hof').card
    expect(hof.meta).toBe('September 2026 – Present')
  })
  it('contact links use the profile values', () => {
    const [email, gh, li] = rooms.contact.frames.map((f) => f.card.links[0].href)
    expect(email).toBe(`mailto:${data.profile.email}`)
    expect(gh).toBe(data.profile.social.github)
    expect(li).toBe(data.profile.social.linkedin)
  })
  it('uses light walls, with readable tile labels and icons', () => {
    const lum = (hex) => {
      const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
        .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
      return 0.2126 * r + 0.7152 * g + 0.0722 * b
    }
    const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05) }
    for (const [id, t] of Object.entries(THEMES)) {
      expect(lum(t.wall), `${id} wall`).toBeGreaterThan(0.55)
      expect(contrast(t.accent, t.wall), `${id} tile label`).toBeGreaterThanOrEqual(4.5)
      expect(contrast(t.ink, '#f4e6c8'), `${id} icon`).toBeGreaterThanOrEqual(4.5)
    }
  })
  it('project frames show their pixel scene instead of a screenshot', () => {
    rooms.projects.frames.forEach((f, i) => {
      expect(f.thumb).toEqual({ type: 'art', art: data.projects[i].art })
      expect(f.card.image).toBe(data.projects[i].image) // screenshot still in the card
    })
  })
  it('every section frame has a short plaque title, and neighbouring plaques never touch', () => {
    const expected = {
      about: ['Srilekha', 'Education', 'Skills', 'Interests'],
      contact: ['Email', 'GitHub', 'LinkedIn'],
      projects: data.projects.map((p) => p.plaque),
      experience: data.experience.map((e) => e.plaque),
    }
    for (const id of sectionIds) {
      const frames = rooms[id].frames
      expect(frames.map((f) => f.plaque)).toEqual(expected[id])
      frames.forEach((f, i) => {
        expect(f.plaque.length, f.plaque).toBeLessThanOrEqual(20)
        if (i === 0) return
        const prev = frames[i - 1]
        const gap = (f.x + f.w / 2) - (prev.x + prev.w / 2)
        expect(gap).toBeGreaterThanOrEqual((plaqueWidth(f.plaque) + plaqueWidth(prev.plaque)) / 2 + 2)
      })
    }
  })
  it('experience frames show their pixel scene', () => {
    rooms.experience.frames.forEach((f, i) => expect(f.thumb).toEqual({ type: 'art', art: data.experience[i].art }))
  })
  it('about and contact frames use drawn scenes, not photos', () => {
    expect(rooms.about.frames.map((f) => f.thumb.art)).toEqual(['avatar', 'mit', 'inventory', 'interests'])
    expect(rooms.contact.frames.map((f) => f.thumb.art)).toEqual(['email', 'github', 'linkedin'])
  })
  it('contact frames link straight to email, GitHub and LinkedIn; other frames do not', () => {
    expect(rooms.contact.frames.map((f) => f.href)).toEqual([
      `mailto:${data.profile.email}`, data.profile.social.github, data.profile.social.linkedin,
    ])
    for (const id of ['about', 'projects', 'experience']) for (const f of rooms[id].frames) expect(f.href).toBeUndefined()
  })
})
