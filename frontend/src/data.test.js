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
      for (const f of ['title', 'category', 'description']) expect(typeof p[f]).toBe('string')
      expect(Array.isArray(p.technologies)).toBe(true)
      if (p.image) expect(exists(p.image), p.image).toBe(true)
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
  it('research cards are trimmed and bold their key words', () => {
    for (const e of data.experience.filter((x) => x.room === 'research')) for (const b of e.bullets) expect(b, e.company).toContain('**')
    for (const p of data.projects.filter((x) => x.room === 'research')) expect(p.description, p.title).toContain('**')
  })
  it('the formality paper lives on the CSAIL role, and projects are titled by topic', () => {
    expect(data.projects.some((p) => /Subjective Qualities/.test(p.title))).toBe(false)
    expect(data.experience.find((e) => e.id === 'csail').paper).toBe('An Empirical Evaluation of LLMs for the Assessment of Subjective Qualities')
    const titles = data.projects.map((p) => p.title)
    expect(titles).toContain('LLMs for Legal Code')
    expect(titles).toContain('ML + Drug Repurposing for Epilepsy')
    expect(titles.join(' ')).not.toMatch(/^WhartonMunicode|NeuroCADR:/)
  })
  it('links no code repositories', () => {
    for (const p of data.projects) expect(p.link ?? '', p.title).not.toMatch(/github\.com|gitlab\.com/)
  })
  it('opens the Projects room with the three new projects', () => {
    const builds = data.projects.filter((p) => p.room === 'projects')
    expect(builds.slice(0, 3).map((p) => p.title)).toEqual(['HackMIT Hardware Hub', 'PRISM', 'Investment Memo Generator'])
    const hub = builds[0]
    expect(hub.link).toBe('https://hardware.hackmit.org/')
    expect(hub.description).toMatch(/700\+ hackers/)
    expect(hub.description).toMatch(/200\+ types of hardware/)
    expect(builds[1].description).toMatch(/~20 students/)
  })
  it('titles the projects room plaques as short overviews', () => {
    expect(data.projects.filter((p) => p.room === 'projects').map((p) => p.plaque)).toEqual([
      'HackMIT Hardware Hub', 'AI Stock-Move Analyst', 'AI Deal Memo Generator',
      'AI Insurance Chatbot', 'ML for Skin Diagnosis', 'ML-Based Food Expiry Predictor', 'AI Ad Campaign Manager',
    ])
  })
})
