export const ROOM_IDS = ['hall', 'about', 'research', 'projects', 'experience', 'contact']

// The bare URL is the landing page; the museum lives under #/hall and #/<room>.
export const LANDING_HASH = ''

export function parseHash(hash) {
  const m = /^#?\/?([a-z]*)\/?$/.exec(String(hash ?? '').toLowerCase())
  const seg = m ? m[1] : null
  if (seg === 'quick') return { view: 'landing', room: 'hall', quick: true }
  if (seg && ROOM_IDS.includes(seg)) return { view: 'museum', room: seg, quick: false }
  return { view: 'landing', room: 'hall', quick: false }
}

export function hashFor(room, quick = false) {
  if (quick) return '#/quick'
  return `#/${room}`
}

// Full same-page URL for a hash from hashFor ('' drops the # entirely).
export const urlWithHash = (hash) => window.location.pathname + window.location.search + hash

export const urlMatchesHash = (hash) => (hash === '' ? !window.location.href.includes('#') : window.location.hash === hash)
