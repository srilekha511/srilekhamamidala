import { KEYS } from './storage.js'

// One hidden stamp per room; collecting all six unlocks the fireworks.
export const STAMP_IDS = ['hall', 'about', 'research', 'projects', 'experience', 'contact']

export function createPassport(storage) {
  const saved = storage.get(KEYS.stamps, [])
  const have = new Set(Array.isArray(saved) ? saved.filter((id) => STAMP_IDS.includes(id)) : [])
  const list = () => STAMP_IDS.filter((id) => have.has(id))
  return {
    list,
    has: (id) => have.has(id),
    collect(id) {
      if (!STAMP_IDS.includes(id) || have.has(id)) return { added: false, complete: have.size === STAMP_IDS.length }
      have.add(id)
      storage.set(KEYS.stamps, list())
      return { added: true, complete: have.size === STAMP_IDS.length }
    },
  }
}
