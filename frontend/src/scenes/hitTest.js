const LABEL_H = 18 // nameplate / plaque hanging under each frame

// The frame (or its nameplate) under a world-space point, if any.
export function frameAt(room, x, y) {
  for (const f of room.frames) {
    if (x >= f.x && x < f.x + f.w && y >= f.y && y < f.y + f.h + LABEL_H) return f
  }
  return null
}
