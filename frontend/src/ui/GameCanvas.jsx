import { useEffect, useRef } from 'react'
import { createEmitter } from '../engine/events.js'
import { createGame } from '../engine/game.js'
import { computeScale, VIEW_W, VIEW_H } from '../engine/renderer.js'

export const CARD_RESERVE = 220
const GUTTER = 16

export default function GameCanvas({ options, handlers, onReady, children }) {
  const canvasRef = useRef(null)
  const boxRef = useRef(null)
  const handlersRef = useRef(handlers)
  const gameRef = useRef(null)
  handlersRef.current = handlers

  useEffect(() => {
    const emitter = createEmitter()
    const names = ['bubble', 'card', 'avatar', 'room', 'introDone', 'back']
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

  useEffect(() => {
    const fit = () => {
      const s = computeScale(window.innerWidth - GUTTER * 2, window.innerHeight - CARD_RESERVE)
      boxRef.current.style.width = `${VIEW_W * s}px`
      boxRef.current.style.height = `${VIEW_H * s}px`
    }
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [])

  const onPointerDown = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    gameRef.current?.walkToScreen((e.clientX - rect.left) / rect.width)
  }

  return (
    <div className="canvas-box" ref={boxRef}>
      <canvas
        ref={canvasRef}
        className="game-canvas"
        role="img"
        aria-label="A pixel-art gallery. Srilekha's avatar walks past framed paintings. Use the Quick view button for a text version."
        onPointerDown={onPointerDown}
      />
      {children}
    </div>
  )
}
