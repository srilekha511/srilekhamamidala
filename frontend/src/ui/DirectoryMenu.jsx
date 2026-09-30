import { useState } from 'react'
import PixelIcon from './PixelIcon.jsx'
import { SECTIONS } from '../scenes/rooms.js'

const DESTINATIONS = [{ id: 'hall', label: 'Home', icon: 'house' }, ...SECTIONS]

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
