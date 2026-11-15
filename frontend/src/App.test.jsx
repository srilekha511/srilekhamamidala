import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'

const fakeGame = { setNight: vi.fn(), skipIntro: vi.fn(), replayIntro: vi.fn(() => true), setPaused: vi.fn(), setSoundOn: vi.fn(), goTo: vi.fn(), press: vi.fn(), release: vi.fn(), clickAt: vi.fn(), isClickableAt: vi.fn(() => false) }
let lastGameOptions
vi.mock('./ui/GameCanvas.jsx', () => ({
  default: (props) => {
    lastGameOptions = props.options
    props.onReady(fakeGame)
    return <div data-testid="game">{props.children}</div>
  },
}))

import App from './App.jsx'
import { ENTER_MS } from './ui/PortalWormhole.jsx'

const HI = { level: 1, name: "hi, i'm srilekha" }
// Click the portal and wait out the wormhole's pull-in animation.
const enter = async () => {
  fireEvent.click(screen.getByRole('button', { name: 'Step inside the gallery' }))
  await act(() => new Promise((r) => setTimeout(r, ENTER_MS)))
}
const navigate = (url, Event = PopStateEvent) =>
  act(() => {
    window.history.replaceState(null, '', url)
    window.dispatchEvent(new Event(Event === PopStateEvent ? 'popstate' : 'hashchange'))
  })

beforeAll(() => {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null) // jsdom has no 2D canvas
})

beforeEach(() => {
  window.localStorage.clear()
  window.history.replaceState(null, '', '/')
  lastGameOptions = undefined
  Object.values(fakeGame).forEach((f) => f.mockClear())
})

describe('App', () => {
  it('the bare URL shows the landing, not the game', () => {
    render(<App />)
    expect(screen.getByRole('heading', HI)).toBeTruthy()
    expect(screen.queryByTestId('game')).toBe(null)
  })
  it('the portal enters the museum at #/hall with the full intro on a first visit', async () => {
    render(<App />)
    await enter()
    expect(await screen.findByTestId('game')).toBeTruthy()
    expect(window.location.hash).toBe('#/hall')
    expect(lastGameOptions).toMatchObject({ initialRoom: 'hall', playIntro: true, introFrom: 'start' })
    expect(screen.queryByRole('heading', HI)).toBe(null)
  })
  it('every portal visit plays the full painting reveal, even after the intro was seen', async () => {
    window.localStorage.setItem('rg.introSeen', 'true')
    render(<App />)
    await enter()
    await screen.findByTestId('game')
    expect(lastGameOptions).toMatchObject({ playIntro: true, introFrom: 'start' })
  })
  it('deep links open the museum room with no intro', async () => {
    window.history.replaceState(null, '', '/#/projects')
    render(<App />)
    await screen.findByTestId('game')
    expect(lastGameOptions).toMatchObject({ initialRoom: 'projects', playIntro: false })
  })
  it('Back from the museum returns to the landing, and Forward re-enters with no intro', async () => {
    render(<App />)
    await enter()
    await screen.findByTestId('game')
    navigate('/')
    expect(screen.getByRole('heading', HI)).toBeTruthy()
    expect(screen.queryByTestId('game')).toBe(null)
    navigate('/#/hall')
    await screen.findByTestId('game')
    expect(lastGameOptions.playIntro).toBe(false)
  })
  it('the museum title goes back to the landing page', async () => {
    render(<App />)
    await enter()
    await screen.findByTestId('game')
    fireEvent.click(screen.getByRole('link', { name: "Srilekha's Gallery" }))
    expect(screen.getByRole('heading', HI)).toBeTruthy()
    expect(window.location.hash).toBe('')
  })
  it('the front-page button in the museum returns to the landing', async () => {
    render(<App />)
    await enter()
    await screen.findByTestId('game')
    fireEvent.click(screen.getByRole('button', { name: 'Back to the front page' }))
    expect(screen.getByRole('heading', HI)).toBeTruthy()
    expect(window.location.hash).toBe('')
  })
  it('#/quick from the landing opens the brochure without loading the museum, and closing returns to the landing', () => {
    render(<App />)
    const back = vi.spyOn(window.history, 'back').mockImplementation(() => {})
    navigate('/#/quick', HashChangeEvent)
    expect(screen.getByRole('dialog')).toBeTruthy()
    expect(screen.queryByTestId('game')).toBe(null)
    fireEvent.click(screen.getByRole('button', { name: /close brochure/i }))
    expect(screen.queryByRole('dialog')).toBe(null)
    expect(screen.getByRole('heading', HI)).toBeTruthy()
    expect(back).toHaveBeenCalledTimes(1)
    back.mockRestore()
  })
  it('opening #/quick directly shows the brochure over the landing; closing tidies the URL', () => {
    window.history.replaceState(null, '', '/#/quick')
    render(<App />)
    expect(screen.getByRole('dialog')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /close brochure/i }))
    expect(screen.getByRole('heading', HI)).toBeTruthy()
    expect(window.location.hash).toBe('')
  })
  it('the brochure opened from the museum pauses the game and closing steps back', async () => {
    window.history.replaceState(null, '', '/#/hall')
    render(<App />)
    await screen.findByTestId('game')
    fireEvent.click(screen.getByRole('button', { name: /quick view/i }))
    expect(screen.getByRole('dialog')).toBeTruthy()
    expect(fakeGame.setPaused).toHaveBeenLastCalledWith(true)
    const back = vi.spyOn(window.history, 'back').mockImplementation(() => {})
    fireEvent.click(screen.getByRole('button', { name: /close brochure/i }))
    expect(back).toHaveBeenCalledTimes(1)
    expect(screen.getByTestId('game')).toBeTruthy()
    back.mockRestore()
  })
  it('a theme chosen on the landing carries into the museum and is remembered', async () => {
    render(<App />)
    expect(document.documentElement.dataset.theme).toBe('light')
    fireEvent.click(screen.getByRole('button', { name: 'Switch to dark mode' }))
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(JSON.parse(window.localStorage.getItem('rg.theme'))).toBe('dark')
    await enter()
    await screen.findByTestId('game')
    expect(lastGameOptions.night).toBe(true)
    expect(screen.getByRole('button', { name: 'Switch to light mode' })).toBeTruthy()
  })
  it('starts dark when the visitor chose dark before', () => {
    window.localStorage.setItem('rg.theme', '"dark"')
    render(<App />)
    expect(document.documentElement.dataset.theme).toBe('dark')
  })
})
