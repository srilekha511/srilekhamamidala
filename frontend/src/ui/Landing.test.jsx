import { describe, it, expect, vi, beforeAll } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import * as data from '../data.js'
import Landing from './Landing.jsx'
import { ENTER_MS } from './PortalWormhole.jsx'

const noop = () => {}

// jsdom has no 2D canvas; the portal skips painting when getContext returns null.
beforeAll(() => {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
})

describe('Landing', () => {
  it('greets and lists what she is doing now', () => {
    render(<Landing data={data} onEnter={noop} onToggleTheme={noop} />)
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe("hi, i'm srilekha")
    expect(screen.getByText(/fairness in shared AI agents/)).toBeTruthy()
  })
  it('lists selected work with working links', () => {
    render(<Landing data={data} onEnter={noop} onToggleTheme={noop} />)
    const hub = screen.getByRole('link', { name: 'HackMIT Hardware Hub' })
    expect(hub.getAttribute('href')).toBe('https://hardware.hackmit.org/')
    expect(hub.getAttribute('target')).toBe('_blank')
    expect(screen.getByRole('link', { name: 'Disney Streaming' }).getAttribute('href')).toBe('#/experience')
    expect(screen.getByRole('link', { name: 'full text version' }).getAttribute('href')).toBe('#/quick')
  })
  it('the portal is a keyboard-reachable button that enters after the wormhole pulls you in', () => {
    vi.useFakeTimers()
    const onEnter = vi.fn()
    render(<Landing data={data} onEnter={onEnter} onToggleTheme={noop} />)
    const portal = screen.getByRole('button', { name: 'Step inside the gallery' })
    portal.focus()
    expect(document.activeElement).toBe(portal)
    fireEvent.click(portal)
    fireEvent.click(portal) // a double-click still enters once
    expect(onEnter).not.toHaveBeenCalled()
    expect(document.querySelector('.landing--entering')).toBeTruthy()
    act(() => vi.advanceTimersByTime(ENTER_MS))
    expect(onEnter).toHaveBeenCalledTimes(1)
    vi.useRealTimers()
  })
  it('enters straight away for visitors who prefer reduced motion', () => {
    vi.stubGlobal('matchMedia', (q) => ({ matches: q.includes('reduce'), media: q, addEventListener() {}, removeEventListener() {} }))
    const onEnter = vi.fn()
    render(<Landing data={data} onEnter={onEnter} onToggleTheme={noop} />)
    fireEvent.click(screen.getByRole('button', { name: 'Step inside the gallery' }))
    expect(onEnter).toHaveBeenCalledTimes(1)
    vi.unstubAllGlobals()
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
