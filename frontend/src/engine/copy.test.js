import { describe, it, expect } from 'vitest'
import { welcomeText, enterFrameText, tileText, openLinkText } from './copy.js'

describe('speech copy', () => {
  it('matches the spec wording on keyboard devices', () => {
    expect(welcomeText(false)).toBe("Hi, I'm Srilekha! Welcome to my gallery ✨ Use ← → to walk, ↑ or Space to jump, and step up to a painting to go inside.")
    expect(enterFrameText('Projects', false)).toBe('Press Enter to step into the Projects page!')
    expect(tileText('Experience', false)).toBe('Press Enter to go to the Experience page!')
  })
  it('uses touch wording on touch devices', () => {
    expect(welcomeText(true)).toContain('Use ◀ ▶ to walk, B to jump')
    expect(enterFrameText('About', true)).toBe('Tap A to step into the About page!')
    expect(tileText('Home', true)).toBe('Tap A to go to Home!')
  })
  it('invites opening a linked frame', () => {
    expect(openLinkText('GitHub', false)).toBe('Press Enter to open GitHub!')
    expect(openLinkText('Email', true)).toBe('Tap A to open Email!')
  })
})
