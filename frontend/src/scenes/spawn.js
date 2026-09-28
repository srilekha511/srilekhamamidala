// Where the avatar appears after a room change.
export function spawnFor(fromRoomId, toRoom) {
  if (toRoom.id === 'hall') {
    const frame = toRoom.frames.find((f) => f.target === fromRoomId)
    if (frame) return { x: frame.x + frame.w / 2, facing: 1 }
  }
  return { x: toRoom.spawnX, facing: 1 }
}
