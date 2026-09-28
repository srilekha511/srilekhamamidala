import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import * as data from '../data.js'
import QuickView from './QuickView.jsx'

describe('QuickView', () => {
  it('lists every section, project and role', () => {
    render(<QuickView data={data} onClose={() => {}} />)
    for (const h of ['About', 'Education', 'Experience', 'Projects', 'Contact']) {
      expect(screen.getByRole('heading', { name: h })).toBeTruthy()
    }
    for (const p of data.projects) expect(screen.getByText(p.title)).toBeTruthy()
    for (const e of data.experience) expect(screen.getByText(e.company)).toBeTruthy()
  })
  it('never shows a GPA', () => {
    const { container } = render(<QuickView data={data} onClose={() => {}} />)
    expect(container.textContent).not.toMatch(/GPA|4\.7/)
  })
  it('closes on Esc and on the close button, and focuses the close button', () => {
    const onClose = vi.fn()
    render(<QuickView data={data} onClose={onClose} />)
    const btn = screen.getByRole('button', { name: /close/i })
    expect(document.activeElement).toBe(btn)
    fireEvent.keyDown(window, { key: 'Escape' })
    fireEvent.click(btn)
    expect(onClose).toHaveBeenCalledTimes(2)
  })
})
