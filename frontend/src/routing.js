export const ROOM_IDS = ['hall', 'about', 'projects', 'experience', 'contact']

export function parseHash(hash) {
  const m = /^#?\/?([a-z]*)\/?$/.exec(String(hash ?? '').toLowerCase())
  const seg = m ? m[1] : null
  if (seg === 'quick') return { room: 'hall', quick: true }
  if (seg && seg !== 'hall' && ROOM_IDS.includes(seg)) return { room: seg, quick: false }
  return { room: 'hall', quick: false }
}

export function hashFor(room, quick = false) {
  if (quick) return '#/quick'
  return room === 'hall' ? '#/' : `#/${room}`
}
