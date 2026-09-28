import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import InfoCard from './InfoCard.jsx'

const card = {
  title: 'dermalab', subtitle: 'Hackathon', meta: 'Philadelphia · 2023', body: ['Won PennApps.'],
  bullets: ['Built a thing'], tags: ['PyTorch'], links: [{ href: 'https://devpost.com/software/dermalab', label: 'View on DevPost' }], image: null,
}

describe('InfoCard', () => {
  it('renders nothing without a card', () => {
    const { container } = render(<InfoCard card={null} onClose={() => {}} />)
    expect(container.firstChild).toBe(null)
  })
  it('renders all card fields and safe external links', () => {
    render(<InfoCard card={card} onClose={() => {}} />)
    expect(screen.getByRole('heading', { name: 'dermalab' })).toBeTruthy()
    for (const text of ['Hackathon', 'Philadelphia · 2023', 'Won PennApps.', 'Built a thing', 'PyTorch']) expect(screen.getByText(text)).toBeTruthy()
    const link = screen.getByRole('link', { name: 'View on DevPost' })
    expect(link.getAttribute('target')).toBe('_blank')
    expect(link.getAttribute('rel')).toBe('noopener noreferrer')
  })
  it('opens mailto links in the same tab', () => {
    render(<InfoCard card={{ ...card, links: [{ href: 'mailto:a@b.c', label: 'a@b.c' }] }} onClose={() => {}} />)
    expect(screen.getByRole('link', { name: 'a@b.c' }).getAttribute('target')).toBe(null)
  })
})
