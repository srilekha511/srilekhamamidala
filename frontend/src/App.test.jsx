import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'

const fakeGame = { skipIntro: vi.fn(), replayIntro: vi.fn(() => true), setPaused: vi.fn(), setSoundOn: vi.fn(), goTo: vi.fn(), press: vi.fn(), release: vi.fn(), walkToScreen: vi.fn() }
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
    act(() => handlers.bubble({ text: 'Press Enter to step into Projects!' }))
    expect(screen.getByRole('status').textContent).toContain('Press Enter to step into Projects!')
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
})
