export function drawPixelArt(ctx, rows, palette, x, y, { flip = false, scale = 1 } = {}) {
  const w = rows[0]?.length ?? 0
  const ox = Math.round(x)
  const oy = Math.round(y)
  for (let r = 0; r < rows.length; r++) {
    const row = rows[r]
    for (let c = 0; c < w; c++) {
      const color = palette[row[c]]
      if (!color) continue
      const cx = flip ? w - 1 - c : c
      ctx.fillStyle = color
      ctx.fillRect(ox + cx * scale, oy + r * scale, scale, scale)
    }
  }
}
