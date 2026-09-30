import { useEffect, useRef } from 'react'
import { createEmitter } from '../engine/events.js'
import { createGame } from '../engine/game.js'
import { fitView, setViewSize, VIEW_H } from '../engine/renderer.js'

export default function GameCanvas({ options, handlers, onReady, children }) {
  const canvasRef = useRef(null)
  const boxRef = useRef(null)
  const handlersRef = useRef(handlers)
  const gameRef = useRef(null)
  handlersRef.current = handlers

  // Declared first so the world width is set before the game is created.
  useEffect(() => {
    const fit = () => {
      const { viewW, scale } = fitView(window.innerWidth, window.innerHeight)
      setViewSize(viewW)
      boxRef.current.style.width = `${viewW * scale}px`
      boxRef.current.style.height = `${VIEW_H * scale}px`
      gameRef.current?.resize(viewW)
    }
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [])

  useEffect(() => {
    const emitter = createEmitter()
    const names = ['bubble', 'card', 'avatar', 'room', 'introDone', 'back', 'settled', 'open', 'stamp']
    const offs = names.map((n) => emitter.on(n, (p) => handlersRef.current[n]?.(p)))
    const game = createGame({ canvas: canvasRef.current, emitter, ...options })
    gameRef.current = game
    onReady(game)
    return () => {
      offs.forEach((off) => off())
      game.destroy()
    }
    // options are read once at mount by design
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Scrolling over the gallery walks the avatar (native listener so it can stop the page from scrolling).
  useEffect(() => {
    const box = boxRef.current
    const onWheel = (e) => {
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
      if (!delta) return
      e.preventDefault()
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? box.clientWidth : 1
      gameRef.current?.scrollBy((delta * unit) / box.clientWidth)
    }
    box.addEventListener('wheel', onWheel, { passive: false })
    return () => box.removeEventListener('wheel', onWheel)
  }, [])

  const at = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    return [(e.clientX - rect.left) / rect.width, (e.clientY - rect.top) / rect.height]
  }
  const onPointerDown = (e) => gameRef.current?.clickAt(...at(e))
  const onPointerMove = (e) => {
    e.currentTarget.style.cursor = gameRef.current?.isClickableAt(...at(e)) ? 'pointer' : ''
  }

  return (
    <div className="canvas-box" ref={boxRef}>
      <canvas
        ref={canvasRef}
        className="game-canvas"
        role="img"
        aria-label="A pixel-art gallery. Srilekha's avatar walks past framed paintings. Use the Quick view button for a text version."
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
      />
      {children}
    </div>
  )
}
