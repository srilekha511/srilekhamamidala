import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'

const fakeGame = { setNight: vi.fn(), skipIntro: vi.fn(), replayIntro: vi.fn(() => true), setPaused: vi.fn(), setSoundOn: vi.fn(), goTo: vi.fn(), press: vi.fn(), release: vi.fn(), clickAt: vi.fn(), isClickableAt: vi.fn(() => false) }
let handlers
vi.mock('./ui/GameCanvas.jsx', () => ({
  default: (props) => {
    handlers = props.handlers
    props.onReady(fakeGame)
    return <div data-testid="game">{props.children}</div>
  },
}))

import App from './App.jsx'

beforeEach(() => {
  window.localStorage.clear()
  window.location.hash = ''
  Object.values(fakeGame).forEach((f) => f.mockClear())
})

describe('App', () => {
  it('shows Skip on a first visit and skips the intro', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /skip/i }))
    expect(fakeGame.skipIntro).toHaveBeenCalled()
  })
  it('does not offer Skip once the intro has been seen', () => {
    window.localStorage.setItem('rg.introSeen', 'true')
    render(<App />)
    expect(screen.queryByRole('button', { name: /skip/i })).toBe(null)
  })
  it('does not play the intro for deep links', () => {
    window.location.hash = '#/projects'
    render(<App />)
    expect(screen.queryByRole('button', { name: /skip/i })).toBe(null)
  })
  it('opens the Quick view from the menu and pauses the game', () => {
    window.localStorage.setItem('rg.introSeen', 'true')
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /quick view/i }))
    expect(screen.getByRole('dialog')).toBeTruthy()
    expect(fakeGame.setPaused).toHaveBeenLastCalledWith(true)
  })
  it('opens the Quick view directly from #/quick', () => {
    window.location.hash = '#/quick'
    render(<App />)
    expect(screen.getByRole('dialog')).toBeTruthy()
  })
  it('sound starts off and toggles on', () => {
    window.localStorage.setItem('rg.introSeen', 'true')
    render(<App />)
    const btn = screen.getByRole('button', { name: /sound off/i })
    fireEvent.click(btn)
    expect(fakeGame.setSoundOn).toHaveBeenLastCalledWith(true)
    expect(screen.getByRole('button', { name: /sound on/i })).toBeTruthy()
  })
  it('announces bubbles and cards in a live region', () => {
    window.localStorage.setItem('rg.introSeen', 'true')
    render(<App />)
    act(() => handlers.bubble({ text: 'Press Enter to step into the Projects page!' }))
    expect(screen.getByRole('status').textContent).toContain('Press Enter to step into the Projects page!')
  })
  it('records that the intro was seen', () => {
    render(<App />)
    act(() => handlers.introDone())
    expect(window.localStorage.getItem('rg.introSeen')).toBe('true')
  })
  it('applies a Back/Forward that arrived mid-transition once the game settles', () => {
    window.localStorage.setItem('rg.introSeen', 'true')
    render(<App />)
    fakeGame.goTo.mockReturnValueOnce(false)
    act(() => {
      window.history.replaceState(null, '', '#/about')
      window.dispatchEvent(new HashChangeEvent('hashchange'))
    })
    expect(fakeGame.goTo).toHaveBeenLastCalledWith('about', { kind: 'crossfade' })
    fakeGame.goTo.mockClear()
    act(() => handlers.settled())
    expect(fakeGame.goTo).toHaveBeenCalledWith('about', { kind: 'crossfade' })
  })
  it('normalising the startup hash does not add a history entry', () => {
    window.localStorage.setItem('rg.introSeen', 'true')
    window.history.replaceState(null, '', '#/Projects')
    render(<App />)
    const before = window.history.length
    act(() => handlers.room('projects'))
    expect(window.location.hash).toBe('#/projects')
    expect(window.history.length).toBe(before)
  })
  it('walking into a new room adds a history entry so Back works', () => {
    window.localStorage.setItem('rg.introSeen', 'true')
    render(<App />)
    act(() => handlers.room('hall'))
    const before = window.history.length
    act(() => handlers.room('about'))
    expect(window.location.hash).toBe('#/about')
    expect(window.history.length).toBe(before + 1)
  })
  it('closing a brochure opened from the menu steps back instead of stacking history', () => {
    window.localStorage.setItem('rg.introSeen', 'true')
    render(<App />)
    const back = vi.spyOn(window.history, 'back').mockImplementation(() => {})
    fireEvent.click(screen.getByRole('button', { name: /quick view/i }))
    fireEvent.click(screen.getByRole('button', { name: /close brochure/i }))
    expect(back).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('dialog')).toBe(null)
    back.mockRestore()
  })
  it('the main hall has a clean URL with no #', () => {
    window.localStorage.setItem('rg.introSeen', 'true')
    window.history.replaceState(null, '', '#/')
    render(<App />)
    act(() => handlers.room('hall'))
    expect(window.location.href).not.toContain('#')
  })
  it('walking back into the hall adds a clean history entry', () => {
    window.localStorage.setItem('rg.introSeen', 'true')
    window.history.replaceState(null, '', '#/about')
    render(<App />)
    act(() => handlers.room('about'))
    const before = window.history.length
    act(() => handlers.room('hall'))
    expect(window.location.href).not.toContain('#')
    expect(window.history.length).toBe(before + 1)
  })
  it('the directory travels to a room and is hidden during the intro', () => {
    render(<App />)
    expect(screen.queryByRole('navigation', { name: /gallery directory/i })).toBe(null)
    act(() => handlers.introDone())
    fireEvent.click(screen.getByRole('button', { name: 'Projects' }))
    expect(fakeGame.goTo).toHaveBeenLastCalledWith('projects')
  })
  it('the directory highlights the room the game reports', () => {
    window.localStorage.setItem('rg.introSeen', 'true')
    render(<App />)
    act(() => handlers.room('about'))
    expect(screen.getByRole('button', { name: 'About' }).getAttribute('aria-current')).toBe('page')
  })
  it('collecting a stamp updates the passport count and is remembered', () => {
    window.localStorage.setItem('rg.introSeen', 'true')
    render(<App />)
    expect(screen.getByRole('button', { name: 'Passport: 0 of 6 stamps' })).toBeTruthy()
    act(() => handlers.stamp('about'))
    expect(screen.getByRole('button', { name: 'Passport: 1 of 6 stamps' })).toBeTruthy()
    expect(JSON.parse(window.localStorage.getItem('rg.stamps'))).toEqual(['about'])
  })
  it('opening the passport pauses the game', () => {
    window.localStorage.setItem('rg.introSeen', 'true')
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /passport/i }))
    expect(screen.getByRole('dialog', { name: /museum passport/i })).toBeTruthy()
    expect(fakeGame.setPaused).toHaveBeenLastCalledWith(true)
  })
  it('follows the system theme until the visitor picks one, then remembers it', () => {
    window.localStorage.setItem('rg.introSeen', 'true')
    render(<App />)
    expect(document.documentElement.dataset.theme).toBe('light')
    fireEvent.click(screen.getByRole('button', { name: 'Switch to dark mode' }))
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(fakeGame.setNight).toHaveBeenLastCalledWith(true)
    expect(JSON.parse(window.localStorage.getItem('rg.theme'))).toBe('dark')
    expect(screen.getByRole('button', { name: 'Switch to light mode' })).toBeTruthy()
  })
  it('starts dark when the visitor chose dark before', () => {
    window.localStorage.setItem('rg.introSeen', 'true')
    window.localStorage.setItem('rg.theme', '"dark"')
    render(<App />)
    expect(document.documentElement.dataset.theme).toBe('dark')
  })
})
