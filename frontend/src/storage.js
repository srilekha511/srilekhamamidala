export const KEYS = { introSeen: 'rg.introSeen', soundOn: 'rg.soundOn' }

function defaultBackend() {
  try {
    const ls = window.localStorage
    ls.setItem('__rg_probe__', '1')
    ls.removeItem('__rg_probe__')
    return ls
  } catch {
    return null
  }
}

// localStorage wrapper that never throws (private mode, blocked site data, thumbnails).
export function createStorage(backend = defaultBackend()) {
  const memory = new Map()
  return {
    get(key, fallback) {
      if (memory.has(key)) return memory.get(key)
      try {
        const raw = backend ? backend.getItem(key) : null
        if (raw !== null && raw !== undefined) return JSON.parse(raw)
      } catch {
        // fall through to fallback
      }
      return fallback
    },
    set(key, value) {
      memory.set(key, value)
      try {
        backend?.setItem(key, JSON.stringify(value))
      } catch {
        // memory copy still serves this session
      }
    },
  }
}
