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

describe('RichText links', () => {
  it('renders [text](url) as an external link that opens in a new tab', () => {
    const { container } = render(<p><RichText text="Building **evals** at [Acronym](https://goacronym.com/)." /></p>)
    const a = container.querySelector('a')
    expect(a.textContent).toBe('Acronym')
    expect(a.getAttribute('href')).toBe('https://goacronym.com/')
    expect(a.getAttribute('target')).toBe('_blank')
    expect(a.getAttribute('rel')).toBe('noopener noreferrer')
    expect(container.querySelector('strong').textContent).toBe('evals')
    expect(container.textContent).toBe('Building evals at Acronym.')
  })
  it('leaves brackets that are not links alone', () => {
    const { container } = render(<p><RichText text="a [note] (aside) and [x](javascript:alert(1))" /></p>)
    expect(container.querySelector('a')).toBe(null)
    expect(container.textContent).toBe('a [note] (aside) and [x](javascript:alert(1))')
  })
})
