export const ROOM_IDS = ['hall', 'about', 'projects', 'experience', 'contact']

export function parseHash(hash) {
  const m = /^#?\/?([a-z]*)\/?$/.exec(String(hash ?? '').toLowerCase())
  const seg = m ? m[1] : null
  if (seg === 'quick') return { room: 'hall', quick: true }
  if (seg && seg !== 'hall' && ROOM_IDS.includes(seg)) return { room: seg, quick: false }
  return { room: 'hall', quick: false }
}

// The main hall has a clean URL (no #); other rooms get #/room.
export function hashFor(room, quick = false) {
  if (quick) return '#/quick'
  return room === 'hall' ? '' : `#/${room}`
}

// Full same-page URL for a hash from hashFor ('' drops the # entirely).
export const urlWithHash = (hash) => window.location.pathname + window.location.search + hash

export const urlMatchesHash = (hash) => (hash === '' ? !window.location.href.includes('#') : window.location.hash === hash)
