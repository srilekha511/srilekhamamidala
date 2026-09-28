import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import DirectoryMenu from './DirectoryMenu.jsx'

describe('DirectoryMenu', () => {
  it('lists every room and travels on click', () => {
    const onGo = vi.fn()
    render(<DirectoryMenu room="hall" onGo={onGo} />)
    const nav = screen.getByRole('navigation', { name: /gallery directory/i })
    const names = [...nav.querySelectorAll('li button')].map((b) => b.textContent.trim())
    expect(names).toEqual(['Home', 'About', 'Projects', 'Experience', 'Contact'])
    fireEvent.click(screen.getByRole('button', { name: 'Projects' }))
    expect(onGo).toHaveBeenCalledWith('projects')
  })
  it('marks the current room', () => {
    render(<DirectoryMenu room="experience" onGo={() => {}} />)
    expect(screen.getByRole('button', { name: 'Experience' }).getAttribute('aria-current')).toBe('page')
    expect(screen.getByRole('button', { name: 'Home' }).getAttribute('aria-current')).toBe(null)
  })
  it('has a Map toggle for small screens', () => {
    render(<DirectoryMenu room="hall" onGo={() => {}} />)
    const toggle = screen.getByRole('button', { name: /map/i })
    expect(toggle.getAttribute('aria-expanded')).toBe('false')
    fireEvent.click(toggle)
    expect(toggle.getAttribute('aria-expanded')).toBe('true')
  })
})
