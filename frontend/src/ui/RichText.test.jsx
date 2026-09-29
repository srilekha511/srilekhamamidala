import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import RichText, { parseBold } from './RichText.jsx'

describe('parseBold', () => {
  it('splits **bold** spans from plain text', () => {
    expect(parseBold('Built a **pipeline** for **RCTs**.')).toEqual([
      { text: 'Built a ', bold: false }, { text: 'pipeline', bold: true }, { text: ' for ', bold: false },
      { text: 'RCTs', bold: true }, { text: '.', bold: false },
    ])
  })
  it('leaves text without markers alone, including a stray **', () => {
    expect(parseBold('plain')).toEqual([{ text: 'plain', bold: false }])
    expect(parseBold('a ** b')).toEqual([{ text: 'a ** b', bold: false }])
  })
})

describe('RichText', () => {
  it('renders bold spans as <strong>', () => {
    const { container } = render(<p><RichText text="a **b** c" /></p>)
    expect(container.querySelector('strong').textContent).toBe('b')
    expect(container.textContent).toBe('a b c')
  })
})
