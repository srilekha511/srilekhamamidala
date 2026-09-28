export const clamp01 = (p) => Math.max(0, Math.min(1, p))
export const lerp = (a, b, p) => a + (b - a) * p
export const easeInOut = (p) => {
  const x = clamp01(p)
  return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2
}
export const lerpRect = (a, b, p) => ({
  x: lerp(a.x, b.x, p),
  y: lerp(a.y, b.y, p),
  w: lerp(a.w, b.w, p),
  h: lerp(a.h, b.h, p),
})
