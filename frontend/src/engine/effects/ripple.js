import { clamp01, easeInOut } from './tween.js'

export const rippleAmplitude = (p) => Math.sin(Math.PI * clamp01(p)) * 6
export const rippleFlash = (p) => (p < 0.55 ? 0 : p >= 1 ? 1 : clamp01((p - 0.55) / 0.45))
export const zoomScale = (p) => 1 + 1.4 * easeInOut(p)

// Concentric sine displacement around (cx, cy). src/dst are RGBA byte arrays of w*h pixels.
export function applyRipple(src, dst, w, h, cx, cy, p) {
  const amp = rippleAmplitude(p)
  if (amp === 0) {
    dst.set(src)
    return
  }
  const phase = p * 18
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = x - cx
      const dy = y - cy
      const d = Math.hypot(dx, dy) || 1
      const off = Math.sin(d * 0.35 - phase) * amp
      const sx = Math.max(0, Math.min(w - 1, Math.round(x + (dx / d) * off)))
      const sy = Math.max(0, Math.min(h - 1, Math.round(y + (dy / d) * off)))
      const si = (sy * w + sx) * 4
      const di = (y * w + x) * 4
      dst[di] = src[si]
      dst[di + 1] = src[si + 1]
      dst[di + 2] = src[si + 2]
      dst[di + 3] = src[si + 3]
    }
  }
}
