// Procedural pixel homage to Van Gogh's The Starry Night. Region 0 = sky, 1 = ground/foreground.
export const SN_W = 144
export const SN_H = 90

const C = {
  night: [11, 30, 74], deep: [29, 63, 140], mid: [58, 111, 196], light: [127, 178, 229], pale: [232, 227, 176],
  starCore: [255, 247, 168], star: [242, 201, 76], moon: [246, 215, 67], moonGlow: [242, 169, 59],
  hill: [27, 47, 94], hillLight: [39, 64, 111], house: [52, 70, 107], roof: [34, 48, 85], window: [242, 201, 76],
  cypress: [26, 42, 26], cypressLight: [45, 63, 34],
}
// [u, v, radius] in painting-relative units
const STARS = [[0.14, 0.16, 0.035], [0.31, 0.1, 0.028], [0.61, 0.12, 0.03], [0.8, 0.24, 0.035], [0.4, 0.42, 0.025], [0.7, 0.45, 0.022], [0.24, 0.44, 0.028]]
// [u, v, falloff, strength]
const VORTICES = [[0.5, 0.3, 0.16, 1.6], [0.74, 0.36, 0.1, -1.2]]

export const horizonAt = (u) => 0.66 + 0.05 * Math.sin(u * 7) + 0.025 * Math.sin(u * 19)

function skyColor(u, v, aspect) {
  const md = Math.hypot((u - 0.9) * aspect, v - 0.14)
  if (md < 0.1) return md < 0.07 ? C.moon : C.moonGlow
  for (const [sx, sy, r] of STARS) {
    const d = Math.hypot((u - sx) * aspect, v - sy)
    if (d < r * 0.45) return C.starCore
    if (d < r) return C.star
    if (d < r * 1.5) return C.pale
  }
  let swirl = 0
  for (const [vx, vy, falloff, strength] of VORTICES) {
    const dx = (u - vx) * aspect
    const dy = v - vy
    swirl += strength * Math.exp(-Math.hypot(dx, dy) / falloff) * Math.atan2(dy, dx)
  }
  const wave = Math.sin(u * 9 + v * 14 + swirl * 2.2) * 0.5 + Math.sin(v * 22 - u * 5) * 0.25
  const t = (wave + 0.75) / 1.5
  if (t < 0.28) return C.night
  if (t < 0.55) return C.deep
  if (t < 0.78) return C.mid
  if (t < 0.92) return C.light
  return C.pale
}

function groundColor(u, v) {
  if (u > 0.4 && u < 0.9 && v > 0.74 && v < 0.92) {
    const cell = (u - 0.4) / 0.05
    const col = Math.floor(cell)
    const cellU = cell - col
    const roofV = 0.76 + (col % 3) * 0.03
    if (cellU < 0.8 && v >= roofV && v < roofV + 0.03) return C.roof
    if (cellU < 0.8 && v >= roofV + 0.03) return cellU > 0.3 && cellU < 0.5 && v < roofV + 0.08 ? C.window : C.house
  }
  return Math.sin(u * 25 + v * 40) > 0.3 ? C.hillLight : C.hill
}

export function generateStarryNight(width = SN_W, height = SN_H) {
  const pixels = new Uint8ClampedArray(width * height * 4)
  const regions = new Uint8Array(width * height)
  const aspect = width / height
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const u = x / (width - 1)
      const v = y / (height - 1)
      const cypressCentre = 0.16 + 0.015 * Math.sin(v * 12)
      const cypressHalf = Math.max(0, v - 0.12) * 0.11 * (1 + 0.3 * Math.sin(v * 30))
      const horizon = horizonAt(u)
      let color
      let region = 1
      if (v > 0.12 && Math.abs(u - cypressCentre) < cypressHalf) {
        color = (x + y) % 3 === 0 ? C.cypressLight : C.cypress
      } else if (Math.abs(u - 0.63) < 0.006 && v > 0.58 && v < horizon) {
        color = C.roof // church steeple
      } else if (v >= horizon) {
        color = groundColor(u, v)
      } else {
        color = skyColor(u, v, aspect)
        region = 0
      }
      const i = y * width + x
      regions[i] = region
      pixels[i * 4] = color[0]
      pixels[i * 4 + 1] = color[1]
      pixels[i * 4 + 2] = color[2]
      pixels[i * 4 + 3] = 255
    }
  }
  return { width, height, pixels, regions }
}
