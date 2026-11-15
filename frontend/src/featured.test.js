import { describe, it, expect } from 'vitest'
import { featuredItems } from './featured.js'

const data = {
  featured: ['disney', 10, 'nope', 99, 7],
  experience: [{ id: 'disney', room: 'experience', company: 'Disney Streaming', role: 'Software Engineering Intern' }],
  projects: [
    { id: 10, room: 'projects', title: 'HackMIT Hardware Hub', category: 'Full Stack', link: 'https://hardware.hackmit.org/' },
    { id: 7, room: 'research', title: 'Epilepsy ML', category: 'ML Research' },
  ],
}

describe('featuredItems', () => {
  it('resolves experience and projects in the listed order, skipping unknown ids', () => {
    expect(featuredItems(data)).toEqual([
      { key: 'disney', title: 'Disney Streaming', note: 'Software Engineering Intern', href: '#/experience', external: false },
      { key: '10', title: 'HackMIT Hardware Hub', note: 'Full Stack', href: 'https://hardware.hackmit.org/', external: true },
      { key: '7', title: 'Epilepsy ML', note: 'ML Research', href: '#/research', external: false },
    ])
  })
  it('every id in the real data resolves', async () => {
    const real = await import('./data.js')
    expect(real.featured.length).toBeGreaterThan(0)
    expect(featuredItems(real)).toHaveLength(real.featured.length)
  })
})
