import { describe, it, expect } from 'vitest'
import * as data from '../data.js'
import { buildRooms, SECTIONS, THEMES } from './rooms.js'
import { plaqueWidth, textWidth } from '../engine/sprites/tinyFont.js'

const rooms = buildRooms(data)
const sectionIds = SECTIONS.map((s) => s.id)
const researchRoles = data.experience.filter((e) => e.room === 'research')
const jobs = data.experience.filter((e) => e.room !== 'research')
const researchProjects = data.projects.filter((p) => p.room === 'research')
const builds = data.projects.filter((p) => p.room !== 'research')

describe('rooms', () => {
  it('main hall has its six frames in order and no tiles', () => {
    expect(rooms.hall.frames.map((f) => f.id)).toEqual(['starry', 'about', 'research', 'projects', 'experience', 'contact'])
    expect(rooms.hall.tiles).toEqual([])
    const [starry, about] = rooms.hall.frames
    expect(starry.w).toBeLessThan(about.w)
    expect(starry.h).toBeLessThan(about.h)
    for (const f of rooms.hall.frames.slice(1)) expect(f.target).toBe(f.id)
  })
  it('shows every project and role exactly once across the three work rooms', () => {
    const work = ['research', 'projects', 'experience'].flatMap((id) => rooms[id].frames)
    expect(work).toHaveLength(data.projects.length + data.experience.length)
    expect(new Set(work.map((f) => f.id)).size).toBe(work.length)
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
      expect(targets).toHaveLength(SECTIONS.length)
      expect(targets).not.toContain(id)
      expect(new Set(targets)).toEqual(new Set(['hall', ...sectionIds.filter((s) => s !== id)]))
      const lastFrame = room.frames.at(-1)
      expect(end[0].x).toBeGreaterThan(lastFrame.x + lastFrame.w)
      expect(room.width).toBeGreaterThanOrEqual(end.at(-1).x + end.at(-1).w)
    }
  })
  it('tile labels (tiny plaque font) never overlap', () => {
    for (const id of sectionIds) {
      const tiles = rooms[id].tiles.slice(1)
      tiles.forEach((t, i) => {
        if (i === 0) return
        const prev = tiles[i - 1]
        const gap = (t.x + t.w / 2) - (prev.x + prev.w / 2)
        expect(gap).toBeGreaterThanOrEqual((textWidth(t.label) + textWidth(prev.label)) / 2 + 6)
      })
    }
  })
  it('the whole row of end portals fits on a laptop-width view', () => {
    for (const id of sectionIds) {
      const end = rooms[id].tiles.slice(1)
      const span = rooms[id].width - (end[0].x + end[0].w / 2 - textWidth(end[0].label) / 2)
      expect(span, id).toBeLessThanOrEqual(288)
    }
  })
  it('neighbouring plaques keep breathing room', () => {
    for (const id of sectionIds) {
      const frames = rooms[id].frames
      frames.forEach((f, i) => {
        if (i === 0) return
        const prev = frames[i - 1]
        const gap = (f.x + f.w / 2) - (prev.x + prev.w / 2)
        expect(gap - (plaqueWidth(f.plaque) + plaqueWidth(prev.plaque)) / 2, `${prev.plaque} | ${f.plaque}`).toBeGreaterThanOrEqual(8)
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
      expect(f.thumb).toEqual({ type: 'art', art: builds[i].art })
      expect(f.card.image).toBe(builds[i].image) // screenshot still in the card
    })
  })
  it('splits work into Research (roles then papers), Experience (jobs) and Projects (builds)', () => {
    expect(researchRoles.map((e) => e.plaque)).toEqual(['MIT Media Lab', 'MIT Economics', 'MIT CSAIL'])
    expect(researchProjects.map((p) => p.plaque)).toEqual(['LLM Formality Study', 'Election Law Graphs', 'WhartonMunicode', 'Dementia Risk ML', 'NeuroCADR'])
    expect(rooms.research.frames.map((f) => f.plaque)).toEqual([...researchRoles, ...researchProjects].map((x) => x.plaque))
    expect(rooms.experience.frames.map((f) => f.plaque)).toEqual(jobs.map((e) => e.plaque))
    expect(rooms.projects.frames.map((f) => f.plaque)).toEqual(builds.map((p) => p.plaque))
    const csail = rooms.research.frames.findIndex((f) => f.plaque === 'MIT CSAIL')
    expect(rooms.research.frames[csail + 1].plaque).toBe('LLM Formality Study') // role next to its paper
  })
  it('every section frame has a short plaque title, and neighbouring plaques never touch', () => {
    const expected = {
      about: ['Srilekha', 'Education', 'Skills', 'Interests'],
      contact: ['Email', 'GitHub', 'LinkedIn'],
      projects: builds.map((p) => p.plaque),
      experience: jobs.map((e) => e.plaque),
      research: [...researchRoles, ...researchProjects].map((x) => x.plaque),
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
    rooms.experience.frames.forEach((f, i) => expect(f.thumb).toEqual({ type: 'art', art: jobs[i].art }))
  })
  it('about and contact frames use drawn scenes, not photos', () => {
    expect(rooms.about.frames.map((f) => f.thumb.art)).toEqual(['avatar', 'mit', 'inventory', 'interests'])
    expect(rooms.contact.frames.map((f) => f.thumb.art)).toEqual(['email', 'github', 'linkedin'])
  })
  it('contact frames link straight to email, GitHub and LinkedIn; other frames do not', () => {
    expect(rooms.contact.frames.map((f) => f.href)).toEqual([
      `mailto:${data.profile.email}`, data.profile.social.github, data.profile.social.linkedin,
    ])
    for (const id of ['about', 'research', 'projects', 'experience']) for (const f of rooms[id].frames) expect(f.href).toBeUndefined()
  })
  it('the Skills card keeps each group name separate so it can be bold', () => {
    const skills = rooms.about.frames.find((f) => f.id === 'about-skills').card
    expect(skills.bullets).toEqual(data.skills.map((g) => ({ label: g.group, text: g.items.join(', ') })))
  })
  it('the Interests card splits academic and non-academic interests under bold headings', () => {
    const interests = rooms.about.frames.find((f) => f.id === 'about-interests').card
    expect(interests.bullets).toEqual([
      { label: 'Academic & Research', text: data.interests.academic.join(', ') },
      { label: 'For Fun', text: data.interests.personal.join(', ') },
    ])
  })
})
