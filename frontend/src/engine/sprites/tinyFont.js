// 3×5 pixel font for plaques (M and W are 5 wide so they don't read as H): crisp at any scale, no web fonts.
export const GLYPHS = {
  A: ['.x.', 'x.x', 'xxx', 'x.x', 'x.x'], B: ['xx.', 'x.x', 'xx.', 'x.x', 'xx.'], C: ['.xx', 'x..', 'x..', 'x..', '.xx'],
  D: ['xx.', 'x.x', 'x.x', 'x.x', 'xx.'], E: ['xxx', 'x..', 'xx.', 'x..', 'xxx'], F: ['xxx', 'x..', 'xx.', 'x..', 'x..'],
  G: ['.xx', 'x..', 'x.x', 'x.x', '.xx'], H: ['x.x', 'x.x', 'xxx', 'x.x', 'x.x'], I: ['xxx', '.x.', '.x.', '.x.', 'xxx'],
  J: ['..x', '..x', '..x', 'x.x', '.x.'], K: ['x.x', 'x.x', 'xx.', 'x.x', 'x.x'], L: ['x..', 'x..', 'x..', 'x..', 'xxx'],
  M: ['x...x', 'xx.xx', 'x.x.x', 'x...x', 'x...x'], N: ['xx.', 'x.x', 'x.x', 'x.x', 'x.x'], O: ['.x.', 'x.x', 'x.x', 'x.x', '.x.'],
  P: ['xx.', 'x.x', 'xx.', 'x..', 'x..'], Q: ['.x.', 'x.x', 'x.x', 'xx.', '.xx'], R: ['xx.', 'x.x', 'xx.', 'x.x', 'x.x'],
  S: ['.xx', 'x..', '.x.', '..x', 'xx.'], T: ['xxx', '.x.', '.x.', '.x.', '.x.'], U: ['x.x', 'x.x', 'x.x', 'x.x', 'xxx'],
  V: ['x.x', 'x.x', 'x.x', 'x.x', '.x.'], W: ['x...x', 'x...x', 'x.x.x', 'xx.xx', 'x...x'], X: ['x.x', 'x.x', '.x.', 'x.x', 'x.x'],
  Y: ['x.x', 'x.x', '.x.', '.x.', '.x.'], Z: ['xxx', '..x', '.x.', 'x..', 'xxx'],
  0: ['xxx', 'x.x', 'x.x', 'x.x', 'xxx'], 1: ['.x.', 'xx.', '.x.', '.x.', 'xxx'], 2: ['xx.', '..x', '.x.', 'x..', 'xxx'],
  3: ['xx.', '..x', '.x.', '..x', 'xx.'], 4: ['x.x', 'x.x', 'xxx', '..x', '..x'], 5: ['xxx', 'x..', 'xx.', '..x', 'xx.'],
  6: ['.xx', 'x..', 'xxx', 'x.x', 'xxx'], 7: ['xxx', '..x', '.x.', '.x.', '.x.'], 8: ['xxx', 'x.x', 'xxx', 'x.x', 'xxx'],
  9: ['xxx', 'x.x', 'xxx', '..x', 'xx.'],
  ' ': ['...', '...', '...', '...', '...'], '&': ['.x.', 'x.x', '.x.', 'x.x', '.xx'], '-': ['...', '...', 'xxx', '...', '...'],
  '.': ['...', '...', '...', '...', '.x.'], "'": ['.x.', '.x.', '...', '...', '...'], '?': ['xx.', '..x', '.x.', '...', '.x.'],
}

const GAP = 1
const glyphFor = (ch) => GLYPHS[ch.toUpperCase()] ?? GLYPHS['?']

export const textWidth = (text) => {
  let w = 0
  for (const ch of text) w += glyphFor(ch)[0].length + GAP
  return Math.max(0, w - GAP)
}

export function drawTinyText(ctx, text, x, y, color) {
  ctx.fillStyle = color
  let cx = Math.round(x)
  const cy = Math.round(y)
  for (const ch of text) {
    const rows = glyphFor(ch)
    const w = rows[0].length
    for (let r = 0; r < 5; r++) for (let c = 0; c < w; c++) if (rows[r][c] === 'x') ctx.fillRect(cx + c, cy + r, 1, 1)
    cx += w + GAP
  }
}

const PAD_X = 3
export const plaqueWidth = (text) => textWidth(text) + PAD_X * 2 + 2

// Brass museum plaque centred on cx.
export function drawPlaque(ctx, cx, y, text) {
  const w = plaqueWidth(text)
  const x = Math.round(cx - w / 2)
  ctx.fillStyle = '#8a6420'
  ctx.fillRect(x, y, w, 11)
  ctx.fillStyle = '#d4a93a'
  ctx.fillRect(x + 1, y + 1, w - 2, 9)
  ctx.fillStyle = '#f2d27a'
  ctx.fillRect(x + 1, y + 1, w - 2, 1)
  drawTinyText(ctx, text, x + 1 + PAD_X, y + 3, '#3a2a10')
}
