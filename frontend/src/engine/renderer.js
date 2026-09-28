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

const GUTTER = 16
const CARD_RESERVE = 220

// Scale for the whole viewport: side gutters, plus room below the canvas for info cards
// (at most 30% of the height, so short/landscape screens keep a usable canvas).
export function fitScale(viewportW, viewportH) {
  const availW = viewportW - GUTTER * 2
  const reserve = Math.min(CARD_RESERVE, viewportH * 0.3)
  const s = computeScale(availW, viewportH - reserve)
  const floor = Math.min(availW / VIEW_W, 0.5)
  return Math.max(s, Math.floor(floor * 100) / 100)
}
