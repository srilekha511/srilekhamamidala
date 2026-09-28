const GOLD = '#d4a93a'
const GOLD_LIGHT = '#f2d27a'
const GOLD_DARK = '#8a6420'

// Gold picture frame. The drawable inner area is (x+3, y+3, w-6, h-6).
export function drawFrame(ctx, x, y, w, h, borderScale = 1) {
  const b = Math.max(1, Math.round(3 * borderScale))
  ctx.fillStyle = 'rgba(0,0,0,0.35)'
  ctx.fillRect(x + 2, y + 2, w, h) // drop shadow on the wall
  ctx.fillStyle = GOLD_DARK
  ctx.fillRect(x, y, w, h)
  ctx.fillStyle = GOLD
  ctx.fillRect(x + 1, y + 1, w - 2, h - 2)
  ctx.fillStyle = GOLD_LIGHT
  ctx.fillRect(x + 1, y + 1, w - 2, 1)
  ctx.fillRect(x + 1, y + 1, 1, h - 2)
  ctx.fillStyle = GOLD_DARK
  ctx.fillRect(x + b - 1, y + b - 1, w - 2 * b + 2, h - 2 * b + 2)
}

export function drawNameplate(ctx, cx, y, text) {
  ctx.font = '8px "Press Start 2P"'
  const w = Math.ceil(ctx.measureText(text).width) + 6
  const x = Math.round(cx - w / 2)
  ctx.fillStyle = GOLD_DARK
  ctx.fillRect(x, y, w, 11)
  ctx.fillStyle = GOLD
  ctx.fillRect(x + 1, y + 1, w - 2, 9)
  ctx.fillStyle = '#3a2a10'
  ctx.textBaseline = 'top'
  ctx.fillText(text, x + 3, y + 2)
}
