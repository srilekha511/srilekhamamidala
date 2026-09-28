export const VIEW_W = 320
export const VIEW_H = 180

// Integer scale when >= 2x fits (crisp pixels); otherwise fill the space fractionally.
export function computeScale(availW, availH) {
  const fit = Math.min(availW / VIEW_W, availH / VIEW_H)
  if (fit >= 2) return Math.floor(fit)
  return Math.max(Math.floor(fit * 100) / 100, 0.01)
}

export function setupCanvas(canvas) {
  canvas.width = VIEW_W
  canvas.height = VIEW_H
  const ctx = canvas.getContext('2d')
  ctx.imageSmoothingEnabled = false
  return ctx
}
