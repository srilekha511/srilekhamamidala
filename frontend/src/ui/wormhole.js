// A pixel-art wormhole in the site's colours: deep violet arms around a dark void,
// a gold rim catching the light, and cream stars falling in.
export const WH_SIZE = 96

// Dark void → plum → indigo → violet.
export const WH_PALETTE = [
  [8, 5, 16],
  [26, 14, 44],
  [44, 24, 84],
  [70, 38, 128],
  [100, 60, 168],
  [132, 92, 200],
]
export const WH_RIM = [212, 169, 58] // --gold
export const WH_STAR = [251, 243, 224] // --paper cream

const STARS = 14
const VOID = 0.16 // radius of the dark centre, as a fraction of the hole's radius
const frac = (x) => x - Math.floor(x)
const rand = (k) => frac(Math.sin(k * 12.9898 + 78.233) * 43758.5453) // fixed per-star scatter

// RGBA pixels of the wormhole at time t (seconds). Pure and deterministic, so it can be tested and cached.
export function wormholePixels(t) {
  const n = WH_SIZE
  const data = new Uint8ClampedArray(n * n * 4)
  const c = (n - 1) / 2
  const R = n / 2
  const top = WH_PALETTE.length - 1

  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const dx = x - c
      const dy = y - c
      const r = Math.hypot(dx, dy) / R
      if (r > 1) continue // outside the hole stays transparent
      let level = 0
      if (r > VOID) {
        const theta = Math.atan2(dy, dx)
        // Logarithmic spiral arms that rotate inward over time.
        const arms = 0.5 + 0.5 * Math.sin(3 * theta - 9 * Math.log(r) + t * 2.6)
        const depth = (r - VOID) / (1 - VOID) // 0 at the void, 1 at the rim
        // The rim catches gold light where a spiral arm reaches the edge.
        if (r > 0.92 && arms > 0.45) level = -1
        else {
          const rim = r > 0.88 ? (r - 0.88) / 0.12 : 0
          const v = arms * Math.pow(depth, 1.1) * 0.8 + rim * 0.35
          level = Math.min(top, Math.floor(v * top + 0.5))
        }
      }
      const [cr, cg, cb] = level < 0 ? WH_RIM : WH_PALETTE[level]
      const i = (y * n + x) * 4
      data[i] = cr
      data[i + 1] = cg
      data[i + 2] = cb
      data[i + 3] = 255
    }
  }

  // Stars spiralling into the void.
  for (let k = 0; k < STARS; k++) {
    const life = frac(t * 0.18 + rand(k))
    const r = (1 - life) * 0.92 + VOID * life
    const theta = rand(k + 100) * Math.PI * 2 + life * 4.5 // each star spirals in on its own path
    const x = Math.round(c + Math.cos(theta) * r * R)
    const y = Math.round(c + Math.sin(theta) * r * R)
    if (x < 0 || y < 0 || x >= n || y >= n) continue
    const i = (y * n + x) * 4
    if (!data[i + 3]) continue
    data[i] = WH_STAR[0]
    data[i + 1] = WH_STAR[1]
    data[i + 2] = WH_STAR[2]
  }
  return data
}
