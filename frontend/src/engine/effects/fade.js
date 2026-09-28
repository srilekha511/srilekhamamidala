import { clamp01 } from './tween.js'

export const fadeAlpha = (phase, p) => (phase === 'out' ? clamp01(p) : 1 - clamp01(p))
