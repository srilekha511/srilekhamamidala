import { describe, it, expect, vi, beforeAll } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import * as data from '../data.js'
import Landing from './Landing.jsx'

const noop = () => {}

// jsdom has no 2D canvas; the portal skips painting when getContext returns null.
beforeAll(() => {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
})

describe('Landing', () => {
  it('greets and lists what she is doing now', () => {
    render(<Landing data={data} onEnter={noop} onToggleTheme={noop} />)
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe("hi, i'm srilekha")
    expect(screen.getByText(/LLM memory/)).toBeTruthy()
  })
  it('lists selected work with working links', () => {
    render(<Landing data={data} onEnter={noop} onToggleTheme={noop} />)
    const hub = screen.getByRole('link', { name: 'HackMIT Hardware Hub' })
    expect(hub.getAttribute('href')).toBe('https://hardware.hackmit.org/')
    expect(hub.getAttribute('target')).toBe('_blank')
    expect(screen.getByRole('link', { name: 'Disney Streaming' }).getAttribute('href')).toBe('#/experience')
    expect(screen.getByRole('link', { name: 'full text version' }).getAttribute('href')).toBe('#/quick')
  })
  it('the portal is a keyboard-reachable button that enters the gallery', () => {
    const onEnter = vi.fn()
    render(<Landing data={data} onEnter={onEnter} onToggleTheme={noop} />)
    const portal = screen.getByRole('button', { name: 'Step inside the gallery' })
    portal.focus()
    expect(document.activeElement).toBe(portal)
    fireEvent.click(portal)
    expect(onEnter).toHaveBeenCalledTimes(1)
  })
  it('shows a resume link only when one is configured', () => {
    const noResume = { ...data, profile: { ...data.profile, resume: undefined } }
    const { rerender } = render(<Landing data={noResume} onEnter={noop} onToggleTheme={noop} />)
    expect(screen.queryByRole('link', { name: 'resume' })).toBe(null)
    rerender(<Landing data={{ ...data, profile: { ...data.profile, resume: '/resume.pdf' } }} onEnter={noop} onToggleTheme={noop} />)
    expect(screen.getByRole('link', { name: 'resume' }).getAttribute('href')).toBe('/resume.pdf')
  })
  it('toggles the theme', () => {
    const onToggleTheme = vi.fn()
    render(<Landing data={data} dark={false} onEnter={noop} onToggleTheme={onToggleTheme} />)
    fireEvent.click(screen.getByRole('button', { name: 'Switch to dark mode' }))
    expect(onToggleTheme).toHaveBeenCalledTimes(1)
  })
})
