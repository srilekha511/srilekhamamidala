import { useEffect, useRef } from 'react'
import { wormholePixels, WH_SIZE } from './wormhole.js'

// How long the wormhole pulls you in before the museum takes over.
export const ENTER_MS = 650
const FPS = 15 // choppy on purpose: it reads as pixel art, and it's light on phone batteries

// A swirling pixel wormhole: the button that steps into the museum.
export default function PortalWormhole({ onEnter, entering = false, still = false }) {
  const canvasRef = useRef(null)
  const speedRef = useRef(1)
  speedRef.current = entering ? 5 : 1

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext?.('2d') // null in jsdom
    if (!ctx) return
    canvas.width = WH_SIZE
    canvas.height = WH_SIZE
    const image = ctx.createImageData(WH_SIZE, WH_SIZE)
    const draw = (t) => {
      image.data.set(wormholePixels(t))
      ctx.putImageData(image, 0, 0)
    }
    if (still) {
      draw(0)
      return
    }
    let raf = 0
    let last = performance.now()
    let acc = 0
    let t = 0
    const tick = (now) => {
      const dt = Math.min(0.1, (now - last) / 1000)
      last = now
      acc += dt
      t += dt * speedRef.current
      if (acc >= 1 / FPS) {
        acc = 0
        draw(t)
      }
      raf = requestAnimationFrame(tick)
    }
    draw(0)
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [still])

  return (
    <button className={`portal ${entering ? 'portal--entering' : ''}`} onClick={onEnter} aria-label="Step inside the gallery">
      <span className="portal__hole">
        <canvas ref={canvasRef} className="portal__canvas" aria-hidden="true" />
      </span>
      <span className="portal__caption" aria-hidden="true">step inside the gallery →</span>
    </button>
  )
}
