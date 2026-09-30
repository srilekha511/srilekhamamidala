const walkKeys = (touch) => (touch ? '◀ ▶' : '← →')
const jumpKey = (touch) => (touch ? 'B' : '↑ or Space')
const action = (touch) => (touch ? 'Tap A' : 'Press Enter')

export const welcomeText = (touch) =>
  `Hi, I'm Srilekha! Welcome to my gallery ✨ Use ${walkKeys(touch)} to walk, ${jumpKey(touch)} to jump, and step up to a painting to go inside.`
export const enterFrameText = (label, touch) => `${action(touch)} to step into the ${label} page!`
export const tileText = (label, touch) =>
  label === 'Home' ? `${action(touch)} to go to Home!` : `${action(touch)} to go to the ${label} page!`
export const openLinkText = (label, touch) => `${action(touch)} to open ${label}!`
export const STARRY_TEXT = "The Starry Night by Van Gogh, pixel edition!"
