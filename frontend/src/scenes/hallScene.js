import { createProximityTracker } from '../engine/proximity.js'

export const WALK_SPEED = 64
export const AVATAR_MARGIN = 10

export function createHallScene(room, { spawnX = room.spawnX, facing = 1 } = {}) {
  const frameTracker = createProximityTracker()
  const tileTracker = createProximityTracker({ enter: 10, exit: 14 })
  const clampX = (x) => Math.max(AVATAR_MARGIN, Math.min(room.width - AVATAR_MARGIN, x))
  const avatar = { x: clampX(spawnX), facing, walking: false, animT: 0 }
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

    const f = frameTracker.update(avatar.x, room.frames)
    if (f.changed) events.push({ type: 'frame', frame: f.active })
    const t = tileTracker.update(avatar.x, room.tiles)
    if (t.changed) events.push({ type: 'tile', tile: t.active })

    if (input.consume('interact')) {
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
