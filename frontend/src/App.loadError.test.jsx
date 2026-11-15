import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

// The museum's code fails to download (stale deploy, flaky connection).
vi.mock('./Museum.jsx', () => {
  throw new Error('Failed to fetch dynamically imported module')
})

import App from './App.jsx'

let consoleError
beforeAll(() => {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null) // jsdom has no 2D canvas
  consoleError = vi.spyOn(console, 'error').mockImplementation(() => {}) // React logs caught render errors
})
afterAll(() => consoleError.mockRestore())

describe('App when the museum fails to load', () => {
  it('shows a message instead of a blank page, with a way back to the landing', async () => {
    window.history.replaceState(null, '', '/#/hall')
    render(<App />)
    const alert = await screen.findByRole('alert')
    expect(alert.textContent).toMatch(/couldn't load/i)
    expect(screen.getByRole('button', { name: /reload/i })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /back to the landing page/i }))
    expect(screen.getByRole('heading', { level: 1, name: "hi, i'm srilekha" })).toBeTruthy()
    expect(window.location.hash).toBe('')
  })
})
