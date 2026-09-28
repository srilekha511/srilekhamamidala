import { drawPixelArt } from '../sprites/pixelArt.js'
import { AVATAR_FRAMES, AVATAR_PALETTE } from '../sprites/avatar.js'
import { drawIcon } from '../sprites/icons.js'

// Cover paintings for the main-hall section frames. Everything stays inside (x, y, w, h).
const COVERS = {
  about(ctx, x, y, w, h) {
    ctx.fillStyle = '#f2d0a9'
    ctx.fillRect(x, y, w, h)
    ctx.fillStyle = '#e8b98a'
    ctx.fillRect(x, y + h - 8, w, 8)
    const portrait = AVATAR_FRAMES.idle.slice(0, 16) // head + shoulders
    const size = 32
    drawPixelArt(ctx, portrait, AVATAR_PALETTE, x + Math.floor((w - size) / 2), y + h - size, { scale: 2 })
  },
  projects(ctx, x, y, w, h, t) {
    ctx.fillStyle = '#1d3f8c'
    ctx.fillRect(x, y, w, h)
    const sx = x + Math.floor(w * 0.2), sy = y + Math.floor(h * 0.15)
    const sw = Math.floor(w * 0.6), sh = Math.floor(h * 0.5)
    ctx.fillStyle = '#c9c9d6'
    ctx.fillRect(sx, sy, sw, sh)
    ctx.fillStyle = '#10131f'
    ctx.fillRect(sx + 1, sy + 1, sw - 2, sh - 2)
    const lineColors = ['#9ee6c1', '#f2c94c', '#f4a6c8', '#7fb2e5']
    for (let i = 0; i < 4 && 3 + i * 4 < sh - 2; i++) {
      ctx.fillStyle = lineColors[i]
      ctx.fillRect(sx + 3 + (i % 2) * 3, sy + 3 + i * 4, Math.floor(sw * 0.5) - (i % 2) * 3, 2)
    }
    if (Math.floor(t * 2) % 2 === 0) {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(sx + sw - 6, sy + sh - 5, 2, 3)
    }
    ctx.fillStyle = '#c9c9d6'
    ctx.fillRect(x + Math.floor(w * 0.1), sy + sh, Math.floor(w * 0.8), 3)
  },
  experience(ctx, x, y, w, h) {
    ctx.fillStyle = '#f2a93b'
    ctx.fillRect(x, y, w, h)
    ctx.fillStyle = '#f6d743'
    ctx.fillRect(x + w - 14, y + 4, 8, 8)
    const n = 6
    const bw = Math.floor(w / n)
    for (let i = 0; i < n; i++) {
      const bh = Math.floor(h * (0.35 + 0.12 * (i % 3)))
      const bx = x + i * bw, by = y + h - bh
      ctx.fillStyle = i % 2 ? '#34466b' : '#223055'
      ctx.fillRect(bx, by, bw, bh)
      ctx.fillStyle = '#f2c94c'
      for (let wy = by + 3; wy + 1 < y + h - 2; wy += 4) ctx.fillRect(bx + 2, wy, 1, 1)
    }
  },
  contact(ctx, x, y, w, h) {
    ctx.fillStyle = '#f4d6e0'
    ctx.fillRect(x, y, w, h)
    drawIcon(ctx, 'envelope', x + Math.floor((w - 24) / 2), y + Math.floor((h - 24) / 2), '#8a1f2b', 3)
    drawIcon(ctx, 'heart', x + w - 10, y + 2, '#e05a7a', 1)
  },
}

export function drawCover(ctx, id, x, y, w, h, t = 0) {
  const draw = COVERS[id]
  if (draw) {
    draw(ctx, x, y, w, h, t)
    return
  }
  ctx.fillStyle = '#2a2438'
  ctx.fillRect(x, y, w, h)
}
