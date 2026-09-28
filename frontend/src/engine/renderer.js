// World width follows the window's shape (height stays 180), so the game can fill the screen.
// `let` exports are live bindings: every module reading VIEW_W sees updates from setViewSize.
export let VIEW_W = 320
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

export const MIN_VIEW_W = 240
export const MAX_VIEW_W = 560

export function setViewSize(w) {
  VIEW_W = w
}

// World width and CSS scale that fill the window. Portrait screens fill the width
// (with a minimum world width); ultra-wide screens are capped and centred.
export function fitView(windowW, windowH) {
  let scale = windowH / VIEW_H
  let viewW = Math.floor(windowW / scale)
  if (viewW < MIN_VIEW_W) {
    viewW = MIN_VIEW_W
    scale = windowW / MIN_VIEW_W
  } else if (viewW > MAX_VIEW_W) {
    viewW = MAX_VIEW_W
  }
  return { viewW, scale }
}
