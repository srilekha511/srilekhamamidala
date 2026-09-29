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
  '+': ['...', '.x.', 'xxx', '.x.', '...'],
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
const LINE_H = 7
const MAX_LINE = 20

// "Topic @ Lab" becomes a topic line and a lab line (shown in maroon, no @);
// any line over 20 characters wraps at a space. Each line is tagged with whether it's the lab.
export function plaqueLayout(text) {
  const at = text.indexOf(' @ ')
  const parts = at < 0 ? [[text, false]] : [[text.slice(0, at), false], [text.slice(at + 3), true]]
  const lines = []
  for (const [part, lab] of parts) {
    let line = ''
    for (const word of part.split(' ')) {
      if (line && (line + ' ' + word).length > MAX_LINE) {
        lines.push({ text: line, lab })
        line = word
      } else {
        line = line ? `${line} ${word}` : word
      }
    }
    lines.push({ text: line, lab })
  }
  return lines
}

export const plaqueLines = (text) => plaqueLayout(text).map((l) => l.text)

export const plaqueWidth = (text) => Math.max(...plaqueLines(text).map(textWidth)) + PAD_X * 2 + 2

// Brass museum plaque centred on cx, one row per line.
export function drawPlaque(ctx, cx, y, text) {
  const lines = plaqueLayout(text)
  const w = plaqueWidth(text)
  const h = lines.length * LINE_H + 4
  const x = Math.round(cx - w / 2)
  ctx.fillStyle = '#8a6420'
  ctx.fillRect(x, y, w, h)
  ctx.fillStyle = '#d4a93a'
  ctx.fillRect(x + 1, y + 1, w - 2, h - 2)
  ctx.fillStyle = '#f2d27a'
  ctx.fillRect(x + 1, y + 1, w - 2, 1)
  lines.forEach((line, i) =>
    drawTinyText(ctx, line.text, Math.round(cx - textWidth(line.text) / 2), y + 3 + i * LINE_H, line.lab ? '#8a1f2b' : '#3a2a10'),
  )
}
