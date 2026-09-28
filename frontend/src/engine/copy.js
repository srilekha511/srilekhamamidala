const walkKeys = (touch) => (touch ? '◀ ▶' : '← →')
const action = (touch) => (touch ? 'Tap A' : 'Press Enter')

export const welcomeText = (touch) =>
  `Hi, I'm Srilekha! Welcome to my gallery ✨ Use ${walkKeys(touch)} to walk, and step up to a painting to go inside.`
export const enterFrameText = (label, touch) => `${action(touch)} to step into ${label}!`
export const tileText = (label, touch) => `${action(touch)} to go to ${label}!`
export const STARRY_TEXT = "It's The Starry Night by Van Gogh — pixel edition!"
