import { createProximityTracker } from '../engine/proximity.js'

export const WALK_SPEED = 64
export const AVATAR_MARGIN = 10
export const JUMP_VELOCITY = 200 // px/s; peak ≈ 36px, about 1.5 avatar heights
export const GRAVITY = 560 // px/s²
const LANDING_SQUASH = 0.12 // seconds

export function createHallScene(room, { spawnX = room.spawnX, facing = 1 } = {}) {
  const frameTracker = createProximityTracker()
  const tileTracker = createProximityTracker({ enter: 10, exit: 14 })
  const clampX = (x) => Math.max(AVATAR_MARGIN, Math.min(room.width - AVATAR_MARGIN, x))
  const avatar = { x: clampX(spawnX), facing, walking: false, animT: 0, y: 0, vy: 0, airborne: false, landing: 0 }
  let walkTarget = null
  let hasMoved = false

  function update(dt, input) {
    const events = []
    let dir = input.direction()
    if (dir !== 0) {
      walkTarget = null
    } else if (walkTarget !== null) {
      const d = walkTarget - avatar.x
      if (Math.abs(d) <= WALK_SPEED * dt) {
        avatar.x = walkTarget
        walkTarget = null
      } else {
        dir = Math.sign(d)
      }
    }

    avatar.walking = dir !== 0
    if (dir !== 0) {
      avatar.facing = dir
      avatar.x = clampX(avatar.x + dir * WALK_SPEED * dt)
      if (!hasMoved) {
        hasMoved = true
        events.push({ type: 'firstMove' })
      }
    }
    avatar.animT += dt

    avatar.landing = Math.max(0, avatar.landing - dt)
    if (input.consume('jump') && !avatar.airborne) {
      avatar.airborne = true
      avatar.vy = JUMP_VELOCITY
      events.push({ type: 'jump' })
    }
    if (avatar.airborne) {
      avatar.vy -= GRAVITY * dt
      avatar.y += avatar.vy * dt
      if (avatar.y <= 0) {
        avatar.y = 0
        avatar.vy = 0
        avatar.airborne = false
        avatar.landing = LANDING_SQUASH
        events.push({ type: 'land' })
      }
    }

    const f = frameTracker.update(avatar.x, room.frames)
    if (f.changed) events.push({ type: 'frame', frame: f.active })
    const t = tileTracker.update(avatar.x, room.tiles)
    if (t.changed) events.push({ type: 'tile', tile: t.active })

    // Portals and paintings only open with both feet on the floor.
    if (input.consume('interact') && !avatar.airborne) {
      if (tileTracker.active) {
        events.push({ type: 'go', target: tileTracker.active.target, origin: tileTracker.active })
      } else if (frameTracker.active?.target) {
        events.push({ type: 'go', target: frameTracker.active.target, origin: frameTracker.active })
      }
    }
    return events
  }

  return {
    room,
    avatar,
    update,
    walkTo(x) {
      walkTarget = clampX(x)
    },
    get activeFrame() {
      return frameTracker.active
    },
    get activeTile() {
      return tileTracker.active
    },
  }
}
