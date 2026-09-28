// Resolves a public/ file against the deploy base path (e.g. /srilekhamamidala/).
export function asset(path) {
  const base = (import.meta.env.BASE_URL || '/').replace(/\/?$/, '/')
  return base + String(path).replace(/^\/+/, '')
}
