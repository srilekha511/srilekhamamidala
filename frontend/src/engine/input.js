export const KEYMAP = {
  ArrowLeft: 'left', a: 'left', A: 'left',
  ArrowRight: 'right', d: 'right', D: 'right',
  Enter: 'interact', ArrowUp: 'interact',
  ' ': 'jump', w: 'jump', W: 'jump',
  Escape: 'back',
}

const TEXT_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT'])
const CLICKABLE_TAGS = new Set(['BUTTON', 'A'])
const isTextEntry = (t) => !!t && (TEXT_TAGS.has(t.tagName) || t.isContentEditable)
// Buttons and links keep Enter/Space for themselves; walking keys still reach the game.
const ownsKey = (t, action) => isTextEntry(t) || (!!t && CLICKABLE_TAGS.has(t.tagName) && (action === 'interact' || action === 'jump'))

export function createInput() {
  const held = { left: false, right: false, interact: false, back: false, jump: false }
  const presses = new Set()
  let enabled = true

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
    if (!enabled || !action || ownsKey(e.target, action)) return
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
    setEnabled(v) {
      enabled = !!v
      if (!enabled) reset()
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
