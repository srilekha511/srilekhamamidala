import { drawIcon } from '../sprites/icons.js'
import { AVATAR_FEET_Y } from '../../scenes/rooms.js'

export const STAMP_ICONS = { hall: 'house', about: 'person', research: 'flask', projects: 'laptop', experience: 'briefcase', contact: 'envelope' }

// A glowing, gently bobbing postage stamp hovering `height` px above the floor.
export function drawStamp(ctx, stamp, camX, t) {
  const bob = Math.round(Math.sin(t * 3) * 1.5)
  const x = Math.round(stamp.x - camX - 6)
  const y = AVATAR_FEET_Y - stamp.height - 16 + bob
  ctx.globalAlpha = 0.25 + 0.15 * Math.sin(t * 5)
  ctx.fillStyle = '#f6d743'
  ctx.fillRect(x - 2, y - 2, 16, 18) // glow
  ctx.globalAlpha = 1
  ctx.fillStyle = '#fbf3e0'
  ctx.fillRect(x, y, 12, 14)
  ctx.fillStyle = '#d9c9a8'
  for (let i = 1; i < 12; i += 2) { // perforated edges
    ctx.fillRect(x + i, y, 1, 1)
    ctx.fillRect(x + i, y + 13, 1, 1)
  }
  for (let j = 1; j < 14; j += 2) {
    ctx.fillRect(x, y + j, 1, 1)
    ctx.fillRect(x + 11, y + j, 1, 1)
  }
  drawIcon(ctx, STAMP_ICONS[stamp.id] ?? 'star', x + 2, y + 3, '#8a1f2b')
}
