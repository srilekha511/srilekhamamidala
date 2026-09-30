import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import PassportPanel from './PassportPanel.jsx'

describe('PassportPanel', () => {
  it('shows all six rooms with the collected ones stamped', () => {
    render(<PassportPanel stamps={['hall', 'research']} onClose={() => {}} />)
    expect(screen.getByRole('dialog', { name: /museum passport/i })).toBeTruthy()
    expect(screen.getByText('2 / 6 stamps')).toBeTruthy()
    expect(screen.getByLabelText('Main Hall: stamped')).toBeTruthy()
    expect(screen.getByLabelText('Research: stamped')).toBeTruthy()
    expect(screen.getByLabelText('Contact: not found yet')).toBeTruthy()
  })
  it('hints how to find stamps, and celebrates a full passport', () => {
    const { rerender } = render(<PassportPanel stamps={[]} onClose={() => {}} />)
    expect(screen.getByText(/jump/i)).toBeTruthy()
    rerender(<PassportPanel stamps={['hall', 'about', 'research', 'projects', 'experience', 'contact']} onClose={() => {}} />)
    expect(screen.getByText(/all 6 stamps/i)).toBeTruthy()
  })
  it('closes on Esc and the close button', () => {
    const onClose = vi.fn()
    render(<PassportPanel stamps={[]} onClose={onClose} />)
    fireEvent.keyDown(window, { key: 'Escape' })
    fireEvent.click(screen.getByRole('button', { name: /close/i }))
    expect(onClose).toHaveBeenCalledTimes(2)
  })
})
