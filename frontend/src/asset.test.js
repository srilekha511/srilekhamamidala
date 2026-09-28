import { describe, it, expect } from 'vitest'
import { asset } from './asset.js'

describe('asset', () => {
  it('prefixes the base url and strips a leading slash', () => {
    expect(asset('/project1img1.png')).toBe(import.meta.env.BASE_URL + 'project1img1.png')
    expect(asset('project1img1.png')).toBe(import.meta.env.BASE_URL + 'project1img1.png')
  })
  it('never produces a double slash', () => {
    expect(asset('//x.png')).not.toMatch(/[^:]\/\//)
  })
})
