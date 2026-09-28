import { drawPixelArt } from '../sprites/pixelArt.js'
import { AVATAR_PALETTE, AVATAR_W, AVATAR_H, avatarFrame } from '../sprites/avatar.js'
import { AVATAR_FEET_Y } from '../../scenes/rooms.js'

export function drawAvatar(ctx, avatar, camX) {
  const { rows, yOffset } = avatarFrame(avatar)
  const x = Math.round(avatar.x - camX - AVATAR_W / 2)
  const lift = Math.round(avatar.y ?? 0)
  const shrink = Math.min(4, Math.floor(lift / 8)) // shadow shrinks as the avatar rises
  ctx.fillStyle = 'rgba(0,0,0,0.3)'
  ctx.fillRect(x + 2 + shrink, AVATAR_FEET_Y - 1, AVATAR_W - 4 - shrink * 2, 2)
  drawPixelArt(ctx, rows, AVATAR_PALETTE, x, AVATAR_FEET_Y - AVATAR_H + yOffset - lift, { flip: avatar.facing < 0 })
}

// Little dust puff at the feet on landing; p runs 0 → 1.
export function drawDust(ctx, x, y, p) {
  ctx.fillStyle = `rgba(160,140,120,${1 - p})`
  const spread = 4 + Math.round(p * 6)
  for (const dx of [-spread, -spread + 2, spread - 2, spread]) ctx.fillRect(Math.round(x + dx), Math.round(y - Math.round(p * 2)), 1, 1)
}

export function drawSparkle(ctx, x, y, t) {
  ctx.fillStyle = '#f6d743'
  const r = 6 + Math.floor(t * 20) % 4
  for (const [dx, dy] of [[0, -r], [r, 0], [0, r], [-r, 0]]) ctx.fillRect(Math.round(x + dx), Math.round(y + dy), 1, 1)
}
