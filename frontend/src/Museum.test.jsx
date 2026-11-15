import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'

const fakeGame = { setNight: vi.fn(), skipIntro: vi.fn(), replayIntro: vi.fn(() => true), setPaused: vi.fn(), setSoundOn: vi.fn(), goTo: vi.fn(), press: vi.fn(), release: vi.fn(), clickAt: vi.fn(), isClickableAt: vi.fn(() => false) }
let handlers
let lastGameOptions
vi.mock('./ui/GameCanvas.jsx', () => ({
  default: (props) => {
    handlers = props.handlers
    lastGameOptions = props.options
    props.onReady(fakeGame)
    return <div data-testid="game">{props.children}</div>
  },
}))

import Museum from './Museum.jsx'

const renderMuseum = (props = {}) =>
  render(
    <Museum
      initialRoom="hall"
      intro="none"
      theme="light"
      onToggleTheme={() => {}}
      quickOpen={false}
      onOpenQuick={() => {}}
      onHome={() => {}}
      onRoomChange={() => {}}
      {...props}
    />,
  )

beforeEach(() => {
  window.localStorage.clear()
  window.history.replaceState(null, '', '/#/hall')
  Object.values(fakeGame).forEach((f) => f.mockClear())
})

describe('Museum', () => {
  it('shows Skip during the full intro and skips it', () => {
    renderMuseum({ intro: 'full' })
    expect(lastGameOptions).toMatchObject({ playIntro: true, introFrom: 'start' })
    fireEvent.click(screen.getByRole('button', { name: /skip/i }))
    expect(fakeGame.skipIntro).toHaveBeenCalled()
  })
  it('a zoom-only intro starts the game at the zoom', () => {
    renderMuseum({ intro: 'zoom' })
    expect(lastGameOptions).toMatchObject({ playIntro: true, introFrom: 'zoom' })
  })
  it('does not offer Skip without an intro', () => {
    renderMuseum({ intro: 'none' })
    expect(lastGameOptions.playIntro).toBe(false)
    expect(screen.queryByRole('button', { name: /skip/i })).toBe(null)
  })
  it('starts in the room it was given', () => {
    window.history.replaceState(null, '', '/#/projects')
    renderMuseum({ initialRoom: 'projects' })
    expect(lastGameOptions.initialRoom).toBe('projects')
  })
  it('the Quick view button asks the app to open the brochure', () => {
    const onOpenQuick = vi.fn()
    renderMuseum({ onOpenQuick })
    fireEvent.click(screen.getByRole('button', { name: /quick view/i }))
    expect(onOpenQuick).toHaveBeenCalledTimes(1)
  })
  it('pauses the game while the brochure is open', () => {
    renderMuseum({ quickOpen: true })
    expect(fakeGame.setPaused).toHaveBeenLastCalledWith(true)
  })
  it('the site title goes home to the landing page', () => {
    const onHome = vi.fn()
    renderMuseum({ onHome })
    fireEvent.click(screen.getByRole('link', { name: "Srilekha's Gallery" }))
    expect(onHome).toHaveBeenCalledTimes(1)
  })
  it('sound starts off and toggles on', () => {
    renderMuseum()
    fireEvent.click(screen.getByRole('button', { name: /sound off/i }))
    expect(fakeGame.setSoundOn).toHaveBeenLastCalledWith(true)
    expect(screen.getByRole('button', { name: /sound on/i })).toBeTruthy()
  })
  it('announces bubbles and cards in a live region', () => {
    renderMuseum()
    act(() => handlers.bubble({ text: 'Press Enter to step into the Projects page!' }))
    expect(screen.getByRole('status').textContent).toContain('Press Enter to step into the Projects page!')
  })
  it('records that the intro was seen', () => {
    renderMuseum({ intro: 'full' })
    act(() => handlers.introDone())
    expect(window.localStorage.getItem('rg.introSeen')).toBe('true')
  })
  it('applies a Back/Forward that arrived mid-transition once the game settles', () => {
    renderMuseum()
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
  it('ignores the quick view and landing hashes, which the app handles', () => {
    renderMuseum()
    act(() => {
      window.history.replaceState(null, '', '#/quick')
      window.dispatchEvent(new HashChangeEvent('hashchange'))
      window.history.replaceState(null, '', '/')
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    expect(fakeGame.goTo).not.toHaveBeenCalled()
  })
  it('normalising the startup hash does not add a history entry', () => {
    window.history.replaceState(null, '', '/#/Projects')
    renderMuseum({ initialRoom: 'projects' })
    const before = window.history.length
    act(() => handlers.room('projects'))
    expect(window.location.hash).toBe('#/projects')
    expect(window.history.length).toBe(before)
  })
  it('walking into a new room adds a history entry so Back works', () => {
    const onRoomChange = vi.fn()
    renderMuseum({ onRoomChange })
    act(() => handlers.room('hall'))
    const before = window.history.length
    act(() => handlers.room('about'))
    expect(window.location.hash).toBe('#/about')
    expect(window.history.length).toBe(before + 1)
    expect(onRoomChange).toHaveBeenLastCalledWith('about')
  })
  it('walking back into the hall adds a #/hall history entry', () => {
    window.history.replaceState(null, '', '/#/about')
    renderMuseum({ initialRoom: 'about' })
    act(() => handlers.room('about'))
    const before = window.history.length
    act(() => handlers.room('hall'))
    expect(window.location.hash).toBe('#/hall')
    expect(window.history.length).toBe(before + 1)
  })
  it('the directory travels to a room and is hidden during the intro', () => {
    renderMuseum({ intro: 'full' })
    expect(screen.queryByRole('navigation', { name: /gallery directory/i })).toBe(null)
    act(() => handlers.introDone())
    fireEvent.click(screen.getByRole('button', { name: 'Projects' }))
    expect(fakeGame.goTo).toHaveBeenLastCalledWith('projects')
  })
  it('the directory highlights the room the game reports', () => {
    renderMuseum()
    act(() => handlers.room('about'))
    expect(screen.getByRole('button', { name: 'About' }).getAttribute('aria-current')).toBe('page')
  })
  it('collecting a stamp updates the passport count and is remembered', () => {
    renderMuseum()
    expect(screen.getByRole('button', { name: 'Passport: 0 of 6 stamps' })).toBeTruthy()
    act(() => handlers.stamp('about'))
    expect(screen.getByRole('button', { name: 'Passport: 1 of 6 stamps' })).toBeTruthy()
    expect(JSON.parse(window.localStorage.getItem('rg.stamps'))).toEqual(['about'])
  })
  it('opening the passport pauses the game', () => {
    renderMuseum()
    fireEvent.click(screen.getByRole('button', { name: /passport/i }))
    expect(screen.getByRole('dialog', { name: /museum passport/i })).toBeTruthy()
    expect(fakeGame.setPaused).toHaveBeenLastCalledWith(true)
  })
  it('follows the theme it is given and asks the app to toggle it', () => {
    const onToggleTheme = vi.fn()
    const { rerender } = renderMuseum({ theme: 'dark', onToggleTheme })
    expect(lastGameOptions.night).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: 'Switch to light mode' }))
    expect(onToggleTheme).toHaveBeenCalledTimes(1)
    rerender(<Museum initialRoom="hall" intro="none" theme="light" onToggleTheme={onToggleTheme} quickOpen={false} onOpenQuick={() => {}} onHome={() => {}} onRoomChange={() => {}} />)
    expect(fakeGame.setNight).toHaveBeenLastCalledWith(false)
  })
})
