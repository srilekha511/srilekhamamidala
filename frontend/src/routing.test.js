import { describe, it, expect } from 'vitest'
import { parseHash, hashFor, LANDING_HASH } from './routing.js'

describe('routing', () => {
  it('the bare URL and unknown hashes are the landing', () => {
    for (const h of ['', '#', '#/', '#/foo', '#/awards', '#/projects/2', undefined]) {
      expect(parseHash(h)).toEqual({ view: 'landing', room: 'hall', quick: false })
    }
  })
  it('parses the hall and rooms as the museum', () => {
    expect(parseHash('#/hall')).toEqual({ view: 'museum', room: 'hall', quick: false })
    expect(parseHash('#/projects')).toEqual({ view: 'museum', room: 'projects', quick: false })
    expect(parseHash('#/research')).toEqual({ view: 'museum', room: 'research', quick: false })
    expect(parseHash('#/about/')).toEqual({ view: 'museum', room: 'about', quick: false })
    expect(parseHash('#/Experience')).toEqual({ view: 'museum', room: 'experience', quick: false })
  })
  it('recognises the quick view', () => {
    expect(parseHash('#/quick')).toEqual({ view: 'landing', room: 'hall', quick: true })
  })
  it('builds hashes', () => {
    expect(hashFor('hall')).toBe('#/hall')
    expect(hashFor('contact')).toBe('#/contact')
    expect(hashFor('projects', true)).toBe('#/quick')
    expect(LANDING_HASH).toBe('')
  })
})
