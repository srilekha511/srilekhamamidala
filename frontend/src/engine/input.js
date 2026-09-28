export const KEYMAP = {
  ArrowLeft: 'left', a: 'left', A: 'left',
  ArrowRight: 'right', d: 'right', D: 'right',
  Enter: 'interact', ArrowUp: 'interact', ' ': 'interact',
  Escape: 'back',
}

const INTERACTIVE_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'A'])
const isInteractive = (t) => !!t && (INTERACTIVE_TAGS.has(t.tagName) || t.isContentEditable)

export function createInput() {
  const held = { left: false, right: false, interact: false, back: false }
  const presses = new Set()

  function press(action) {
    if (!held[action]) presses.add(action)
    held[action] = true
  }
  function release(action) {
    held[action] = false
  }
  function reset() {
    for (const k of Object.keys(held)) held[k] = false
    presses.clear()
  }
  function onKeyDown(e) {
    const action = KEYMAP[e.key]
    if (!action || isInteractive(e.target)) return
    e.preventDefault()
    press(action)
  }
  function onKeyUp(e) {
    const action = KEYMAP[e.key]
    if (action) release(action)
  }

  return {
    held,
    press,
    release,
    reset,
    consume(action) {
      const had = presses.has(action)
      presses.delete(action)
      return had
    },
    direction() {
      return (held.right ? 1 : 0) - (held.left ? 1 : 0)
    },
    endFrame() {
      presses.clear()
    },
    attach(target = window) {
      target.addEventListener('keydown', onKeyDown)
      target.addEventListener('keyup', onKeyUp)
      target.addEventListener('blur', reset)
      return () => {
        target.removeEventListener('keydown', onKeyDown)
        target.removeEventListener('keyup', onKeyUp)
        target.removeEventListener('blur', reset)
      }
    },
  }
}
