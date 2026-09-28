import { VIEW_W } from './renderer.js'

export function clampCamera(x, roomWidth, viewW = VIEW_W) {
  return Math.max(0, Math.min(x, Math.max(0, roomWidth - viewW)))
}

export function followCamera(camX, targetX, roomWidth, dt, viewW = VIEW_W) {
  const desired = clampCamera(targetX - viewW / 2, roomWidth, viewW)
  const k = 1 - Math.exp(-8 * dt)
  return camX + (desired - camX) * k
}
