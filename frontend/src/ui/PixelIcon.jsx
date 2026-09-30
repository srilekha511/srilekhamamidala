import { ICONS } from '../engine/sprites/icons.js'

// The engine's 8×8 pixel icons as crisp SVG, for DOM overlays.
export default function PixelIcon({ name }) {
  const rows = ICONS[name] ?? []
  return (
    <svg className="pixel-icon" viewBox="0 0 8 8" aria-hidden="true" shapeRendering="crispEdges">
      {rows.flatMap((row, y) => [...row].map((ch, x) => (ch === 'x' ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" /> : null)))}
    </svg>
  )
}
