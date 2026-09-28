import { describe, it, expect, vi } from 'vitest'
import { openLink } from './openLink.js'

describe('openLink', () => {
  it('opens web links in a new, isolated tab', () => {
    const win = { open: vi.fn(), location: { href: 'here' } }
    openLink('https://github.com/srilekha511', win)
    expect(win.open).toHaveBeenCalledWith('https://github.com/srilekha511', '_blank', 'noopener,noreferrer')
    expect(win.location.href).toBe('here')
  })
  it('hands mailto links to the mail app in place', () => {
    const win = { open: vi.fn(), location: { href: 'here' } }
    openLink('mailto:a@b.c', win)
    expect(win.open).not.toHaveBeenCalled()
    expect(win.location.href).toBe('mailto:a@b.c')
  })
  it('ignores anything that is not http(s) or mailto', () => {
    const win = { open: vi.fn(), location: { href: 'here' } }
    openLink('javascript:alert(1)', win)
    expect(win.open).not.toHaveBeenCalled()
    expect(win.location.href).toBe('here')
  })
})
