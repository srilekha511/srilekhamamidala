import { useEffect, useRef } from 'react'
import { generateStarryNight } from '../engine/paintings/starryNight.js'

// The pixel Starry Night in a gold frame: a button that steps into the museum.
export default function PortalPainting({ onEnter }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext?.('2d') // null in jsdom
    if (!ctx) return
    const painting = generateStarryNight()
    canvas.width = painting.width
    canvas.height = painting.height
    ctx.putImageData(new ImageData(painting.pixels, painting.width, painting.height), 0, 0)
  }, [])

  return (
    <button className="portal" onClick={onEnter} aria-label="Step inside the gallery">
      <span className="portal__frame">
        <canvas ref={canvasRef} className="portal__canvas" aria-hidden="true" />
      </span>
      <span className="portal__caption" aria-hidden="true">step inside the gallery →</span>
    </button>
  )
}
