export const PAINT_FULL = { x: 16, y: 0, w: 288, h: 180 }

// Pixel-by-pixel reveal into an offscreen canvas. Newly revealed pixels flash white for one frame.
export function createIntroReveal(painting, order) {
  const { width, height, pixels } = painting
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const c = canvas.getContext('2d')
  const img = c.createImageData(width, height)
  const d = img.data
  const state = { canvas, order, shown: 0, flashing: [] }

  const copy = (i) => {
    d[i * 4] = pixels[i * 4]
    d[i * 4 + 1] = pixels[i * 4 + 1]
    d[i * 4 + 2] = pixels[i * 4 + 2]
    d[i * 4 + 3] = 255
  }

  state.reset = () => {
    d.fill(0)
    state.shown = 0
    state.flashing = []
    c.putImageData(img, 0, 0)
  }
  state.step = (target) => {
    for (const i of state.flashing) copy(i)
    state.flashing = []
    while (state.shown < target) {
      const i = order[state.shown++]
      d[i * 4] = 255
      d[i * 4 + 1] = 255
      d[i * 4 + 2] = 240
      d[i * 4 + 3] = 255
      state.flashing.push(i)
    }
    c.putImageData(img, 0, 0)
    return state.flashing.length
  }
  state.fill = () => {
    for (let i = 0; i < order.length; i++) copy(i)
    state.shown = order.length
    state.flashing = []
    c.putImageData(img, 0, 0)
  }
  return state
}

export function drawWelcome(ctx, alpha, t) {
  if (alpha <= 0) return
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.font = '16px "Press Start 2P"'
  ctx.textBaseline = 'top'
  const text = 'Welcome!'
  const w = ctx.measureText(text).width
  const x = Math.round(160 - w / 2)
  const y = 34
  ctx.fillStyle = '#0b1e4a'
  for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [2, 2]]) ctx.fillText(text, x + dx, y + dy)
  ctx.fillStyle = '#f6d743'
  ctx.fillText(text, x, y)
  ctx.fillStyle = '#ffffff'
  for (let i = 0; i < 6; i++) {
    if (Math.sin(t * 6 + i * 1.7) > 0.6) ctx.fillRect(x - 6 + ((i * 29) % (w + 12)), y - 6 + ((i * 11) % 28), 1, 1)
  }
  ctx.restore()
}
