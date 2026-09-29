import { describe, it, expect } from 'vitest'
import { parseHash, hashFor } from './routing.js'

describe('routing', () => {
  it('parses known rooms', () => {
    expect(parseHash('#/projects')).toEqual({ room: 'projects', quick: false })
    expect(parseHash('#/research')).toEqual({ room: 'research', quick: false })
    expect(parseHash('#/about/')).toEqual({ room: 'about', quick: false })
    expect(parseHash('#/Experience')).toEqual({ room: 'experience', quick: false })
  })
  it('treats empty and unknown hashes as the main hall', () => {
    for (const h of ['', '#', '#/', '#/foo', '#/awards', '#/projects/2', undefined]) {
      expect(parseHash(h)).toEqual({ room: 'hall', quick: false })
    }
  })
  it('recognises the quick view', () => {
    expect(parseHash('#/quick')).toEqual({ room: 'hall', quick: true })
  })
  it('builds hashes', () => {
    expect(hashFor('hall')).toBe('') // main hall keeps a clean URL
    expect(hashFor('contact')).toBe('#/contact')
    expect(hashFor('projects', true)).toBe('#/quick')
  })
})
