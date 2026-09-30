// Looping pixel fireworks: three staggered bursts (outer + inner ring) around (cx, cy).
const COLORS = ['#e05a7a', '#f2a93b', '#1f6fb3', '#2d9a5f', '#8a1f2b', '#6a3f8a']
const BURSTS = [[-14, -6], [12, -10], [0, 4]]
const CYCLE = 2.4
const LIFE = 1.2
const SPARKS = 12

export function fireworkPixels(t, cx, cy) {
  const pixels = []
  BURSTS.forEach(([dx, dy], b) => {
    const age = (((t - b * 0.8) % CYCLE) + CYCLE) % CYCLE
    if (age > LIFE) return
    const p = age / LIFE
    const radius = 22 * (1 - (1 - p) * (1 - p))
    for (const ring of [1, 0.55]) {
      for (let i = 0; i < SPARKS; i++) {
        const angle = (i / SPARKS) * Math.PI * 2 + b + ring
        pixels.push({
          x: Math.round(cx + dx + Math.cos(angle) * radius * ring),
          y: Math.round(cy + dy + Math.sin(angle) * radius * ring + p * p * 4), // a little gravity
          color: COLORS[(i + b * 2) % COLORS.length],
          alpha: Math.max(0.05, 1 - p * p),
          size: 2,
        })
      }
    }
  })
  return pixels
}
