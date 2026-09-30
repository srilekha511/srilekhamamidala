import { useEffect, useRef } from 'react'
import PixelIcon from './PixelIcon.jsx'
import { STAMP_IDS } from '../passport.js'

const PAGES = {
  hall: { label: 'Main Hall', icon: 'house' },
  about: { label: 'About', icon: 'person' },
  research: { label: 'Research', icon: 'flask' },
  projects: { label: 'Projects', icon: 'laptop' },
  experience: { label: 'Experience', icon: 'briefcase' },
  contact: { label: 'Contact', icon: 'envelope' },
}

export default function PassportPanel({ stamps, onClose }) {
  const closeRef = useRef(null)
  const complete = stamps.length === STAMP_IDS.length

  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="passport" role="dialog" aria-modal="true" aria-labelledby="passport-title">
      <div className="passport__book">
        <button ref={closeRef} className="pixel-button passport__close" onClick={onClose} aria-label="Close passport">✕</button>
        <h2 id="passport-title" className="passport__title">Museum Passport</h2>
        <p className="passport__count">{stamps.length} / {STAMP_IDS.length} stamps</p>
        <ul className="passport__grid">
          {STAMP_IDS.map((id) => {
            const got = stamps.includes(id)
            const { label, icon } = PAGES[id]
            return (
              <li key={id} className={`passport__slot ${got ? 'passport__slot--stamped' : ''}`} aria-label={`${label}: ${got ? 'stamped' : 'not found yet'}`}>
                <PixelIcon name={icon} />
                <span>{label}</span>
              </li>
            )
          })}
        </ul>
        <p className="passport__hint">
          {complete
            ? 'You found all 6 stamps! Visit the Starry Night in the Main Hall for fireworks 🎆'
            : 'Every room hides one glowing stamp floating above the floor. Jump (↑ or Space) to grab it!'}
        </p>
      </div>
    </div>
  )
}
