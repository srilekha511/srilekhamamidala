import { describe, it, expect } from 'vitest'
import { createInput } from './input.js'

const key = (type, k, target = document.body) => {
  const e = new KeyboardEvent(type, { key: k, bubbles: true, cancelable: true })
  target.dispatchEvent(e)
  return e
}

describe('input', () => {
  it('maps arrows and WASD to direction', () => {
    const i = createInput(); const off = i.attach(window)
    key('keydown', 'ArrowRight'); expect(i.direction()).toBe(1)
    key('keyup', 'ArrowRight'); key('keydown', 'a'); expect(i.direction()).toBe(-1)
    off()
  })
  it('holding left and right together cancels out', () => {
    const i = createInput(); i.press('left'); i.press('right')
    expect(i.direction()).toBe(0)
  })
  it('interact is edge-triggered: one press per keydown, repeats ignored', () => {
    const i = createInput(); const off = i.attach(window)
    key('keydown', 'Enter'); key('keydown', 'Enter') // auto-repeat
    expect(i.consume('interact')).toBe(true)
    expect(i.consume('interact')).toBe(false)
    off()
  })
  it('drops unconsumed presses at the end of a frame', () => {
    const i = createInput(); i.press('interact'); i.endFrame()
    expect(i.consume('interact')).toBe(false)
  })
  it('releases everything when the window loses focus', () => {
    const i = createInput(); const off = i.attach(window)
    key('keydown', 'ArrowRight')
    window.dispatchEvent(new Event('blur'))
    expect(i.direction()).toBe(0)
    off()
  })
  it('ignores keys typed into buttons, links, and inputs', () => {
    const i = createInput(); const off = i.attach(window)
    const btn = document.createElement('button'); document.body.appendChild(btn)
    const e = key('keydown', 'Enter', btn)
    expect(i.consume('interact')).toBe(false)
    expect(e.defaultPrevented).toBe(false)
    btn.remove(); off()
  })
  it('still walks with arrows while a button has focus', () => {
    const i = createInput(); const off = i.attach(window)
    const btn = document.createElement('button'); document.body.appendChild(btn)
    key('keydown', 'ArrowRight', btn)
    expect(i.direction()).toBe(1)
    btn.remove(); off()
  })
  it('ignores every game key while typing in a text field', () => {
    const i = createInput(); const off = i.attach(window)
    const field = document.createElement('input'); document.body.appendChild(field)
    key('keydown', 'ArrowRight', field)
    expect(i.direction()).toBe(0)
    field.remove(); off()
  })
  it('when disabled, neither records keys nor blocks page scrolling', () => {
    const i = createInput(); const off = i.attach(window)
    i.setEnabled(false)
    expect(key('keydown', ' ').defaultPrevented).toBe(false)
    expect(i.consume('interact')).toBe(false)
    i.setEnabled(true)
    expect(key('keydown', 'ArrowRight').defaultPrevented).toBe(true)
    off()
  })
  it('prevents page scroll for game keys', () => {
    const i = createInput(); const off = i.attach(window)
    expect(key('keydown', ' ').defaultPrevented).toBe(true)
    off()
  })
})
