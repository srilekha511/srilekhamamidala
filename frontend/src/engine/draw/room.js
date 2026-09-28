import { VIEW_W, VIEW_H } from '../renderer.js'
import { drawFrame, drawNameplate } from '../sprites/frame.js'
import { drawTile } from '../sprites/tiles.js'
import { drawIcon } from '../sprites/icons.js'
import { drawCover } from '../paintings/covers.js'
import { drawFrameArt } from '../paintings/frameArt.js'
import { drawPlaque } from '../sprites/tinyFont.js'
import { WAINSCOT_Y, FLOOR_Y, TILE_Y, TILE_H } from '../../scenes/rooms.js'

export const frameInnerScreenRect = (f, camX) => ({ x: f.x - camX + 3, y: f.y + 3, w: f.w - 6, h: f.h - 6 })

function drawBackground(ctx, theme, camX, t) {
  ctx.fillStyle = theme.wall
  ctx.fillRect(0, 0, VIEW_W, WAINSCOT_Y)
  ctx.fillStyle = theme.wallDark
  const stripeOffset = -(Math.floor(camX * 0.5) % 16)
  for (let x = stripeOffset; x < VIEW_W; x += 16) if (x >= 0) ctx.fillRect(x, 0, 2, WAINSCOT_Y)
  ctx.fillStyle = theme.trim
  ctx.fillRect(0, WAINSCOT_Y, VIEW_W, FLOOR_Y - WAINSCOT_Y)
  ctx.fillStyle = theme.floorLine
  ctx.fillRect(0, WAINSCOT_Y, VIEW_W, 2)
  ctx.fillStyle = theme.floor
  ctx.fillRect(0, FLOOR_Y, VIEW_W, VIEW_H - FLOOR_Y)
  ctx.fillStyle = theme.floorLine
  for (let y = FLOOR_Y + 6; y < VIEW_H; y += 8) ctx.fillRect(0, y, VIEW_W, 1)
  const seamOffset = -(Math.floor(camX) % 32)
  for (let x = seamOffset; x < VIEW_W; x += 32) if (x >= 0) ctx.fillRect(x, FLOOR_Y, 1, VIEW_H - FLOOR_Y)
  // sconces every 120 world px, flickering slightly
  const firstSconce = Math.ceil((camX - 20) / 120) * 120 + 20
  for (let wx = firstSconce; wx - camX < VIEW_W; wx += 120) {
    const sx = Math.round(wx - camX)
    if (sx < 0 || sx + 4 > VIEW_W) continue
    ctx.fillStyle = '#8a6420'
    ctx.fillRect(sx, 22, 4, 6)
    ctx.fillStyle = Math.sin(t * 9 + wx) > 0 ? '#f6d743' : '#f2a93b'
    ctx.fillRect(sx + 1, 18, 2, 4)
  }
}

export function drawRoom(ctx, room, camX, t, assets, activeTileId) {
  const cam = Math.round(camX)
  drawBackground(ctx, room.theme, cam, t)
  for (const f of room.frames) {
    const sx = f.x - cam
    if (sx + f.w < 0 || sx > VIEW_W) continue
    drawFrame(ctx, sx, f.y, f.w, f.h)
    const inner = frameInnerScreenRect(f, cam)
    if (f.kind === 'starry') ctx.drawImage(assets.starry, inner.x, inner.y, inner.w, inner.h)
    else if (f.kind === 'section') drawCover(ctx, f.cover, inner.x, inner.y, inner.w, inner.h, t)
    else drawFrameArt(ctx, f.thumb?.art, inner.x, inner.y, inner.w, inner.h, t)
    if (f.kind === 'section') drawNameplate(ctx, sx + f.w / 2, f.y + f.h + 5, f.label.toUpperCase())
    if (f.plaque) drawPlaque(ctx, sx + f.w / 2, f.y + f.h + 4, f.plaque)
  }
  for (const tile of room.tiles) {
    const sx = tile.x - cam
    if (sx + tile.w < 0 || sx > VIEW_W) continue
    const active = tile.id === activeTileId
    drawTile(ctx, sx, TILE_Y, tile.w, TILE_H, t, active, room.theme.accent)
    drawIcon(ctx, tile.icon, sx + (tile.w - 8) / 2, WAINSCOT_Y + 8, '#fbf3e0')
    ctx.font = '8px "Press Start 2P"'
    ctx.textBaseline = 'top'
    ctx.fillStyle = room.theme.accent
    const label = tile.label.toUpperCase()
    const lw = ctx.measureText(label).width
    const lx = Math.round(sx + tile.w / 2 - lw / 2)
    if (lx >= 0 && lx + lw <= VIEW_W) ctx.fillText(label, lx, WAINSCOT_Y - 12)
  }
}
