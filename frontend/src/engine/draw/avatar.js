import { drawPixelArt } from '../sprites/pixelArt.js'
import { AVATAR_PALETTE, AVATAR_W, AVATAR_H, avatarFrame } from '../sprites/avatar.js'
import { AVATAR_FEET_Y } from '../../scenes/rooms.js'

export function drawAvatar(ctx, avatar, camX) {
  const { rows, yOffset } = avatarFrame(avatar)
  const x = Math.round(avatar.x - camX - AVATAR_W / 2)
  ctx.fillStyle = 'rgba(0,0,0,0.3)'
  ctx.fillRect(x + 2, AVATAR_FEET_Y - 1, AVATAR_W - 4, 2)
  drawPixelArt(ctx, rows, AVATAR_PALETTE, x, AVATAR_FEET_Y - AVATAR_H + yOffset, { flip: avatar.facing < 0 })
}

export function drawSparkle(ctx, x, y, t) {
  ctx.fillStyle = '#f6d743'
  const r = 6 + Math.floor(t * 20) % 4
  for (const [dx, dy] of [[0, -r], [r, 0], [0, r], [-r, 0]]) ctx.fillRect(Math.round(x + dx), Math.round(y + dy), 1, 1)
}
