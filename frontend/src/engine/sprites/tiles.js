// Glowing portal floor tile; brighter pulse while the avatar stands on it.
export function drawTile(ctx, x, y, w, h, t, active, accent) {
  const pulse = 0.5 + 0.5 * Math.sin(t * (active ? 8 : 3))
  ctx.fillStyle = '#1a1426'
  ctx.fillRect(x, y, w, h)
  ctx.globalAlpha = (active ? 0.6 : 0.3) + 0.3 * pulse
  ctx.fillStyle = accent
  ctx.fillRect(x + 1, y + 1, w - 2, h - 2)
  ctx.globalAlpha = 1
  ctx.fillStyle = '#ffffff'
  const sparkleX = x + 1 + Math.floor(((t * 12) % (w - 2)))
  ctx.fillRect(sparkleX, y + 1, 1, 1)
  if (active) {
    ctx.globalAlpha = 0.25 * pulse
    ctx.fillStyle = accent
    ctx.fillRect(x - 2, y - 14, w + 4, 14) // light beam
    ctx.globalAlpha = 1
  }
}
