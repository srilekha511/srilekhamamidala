import { useState } from 'react'
import { ICONS } from '../engine/sprites/icons.js'
import { SECTIONS } from '../scenes/rooms.js'

const DESTINATIONS = [{ id: 'hall', label: 'Home', icon: 'house' }, ...SECTIONS]

// The same 8×8 pixel icons the portal tiles use, as crisp SVG.
function PixelIcon({ name }) {
  const rows = ICONS[name] ?? []
  return (
    <svg className="pixel-icon" viewBox="0 0 8 8" aria-hidden="true" shapeRendering="crispEdges">
      {rows.flatMap((row, y) => [...row].map((ch, x) => (ch === 'x' ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" /> : null)))}
    </svg>
  )
}

// Wooden "Gallery Directory" sign for jumping straight to a room.
export default function DirectoryMenu({ room, onGo }) {
  const [open, setOpen] = useState(false)
  return (
    <nav className={`directory ${open ? 'directory--open' : ''}`} aria-label="Gallery directory">
      <button className="pixel-button directory__toggle" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        🗺 Map
      </button>
      <div className="directory__sign">
        <p className="directory__title">Gallery</p>
        <ul>
          {DESTINATIONS.map((d) => (
            <li key={d.id}>
              <button
                className="directory__plaque"
                aria-current={d.id === room ? 'page' : undefined}
                onClick={() => {
                  setOpen(false)
                  onGo(d.id)
                }}
              >
                <PixelIcon name={d.icon} />
                {d.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
