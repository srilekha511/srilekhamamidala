import { useEffect, useRef, useState } from 'react'
import RichText from './RichText.jsx'
import PortalWormhole, { ENTER_MS } from './PortalWormhole.jsx'
import useMediaQuery from './useMediaQuery.js'
import { featuredItems } from '../featured.js'
import '../styles/landing.css'

const externalProps = { target: '_blank', rel: 'noopener noreferrer' }

// The front door: a short, readable page, with the museum one click away through the portal.
export default function Landing({ data, dark = false, onToggleTheme, onEnter }) {
  const { profile, now } = data
  const work = featuredItems(data)
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const [entering, setEntering] = useState(false)
  const enteringRef = useRef(false)
  const timerRef = useRef(0)
  useEffect(() => () => clearTimeout(timerRef.current), [])

  // The wormhole pulls you in and the screen goes dark, then the museum's intro takes over.
  const enter = () => {
    if (enteringRef.current) return
    enteringRef.current = true
    if (reducedMotion) {
      onEnter()
      return
    }
    setEntering(true)
    timerRef.current = setTimeout(onEnter, ENTER_MS)
  }

  return (
    <div className={`landing ${entering ? 'landing--entering' : ''}`}>
      <header className="landing__top">
        <span className="landing__name">{profile.fullName.toLowerCase()}</span>
        <button className="landing__theme" onClick={onToggleTheme} aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}>
          {dark ? '☀️' : '🌙'}
        </button>
      </header>

      <main className="landing__main">
        <section className="landing__intro">
          <h1 className="landing__hi">
            hi, i'm <span className="landing__first">{profile.firstName.toLowerCase()}</span>
          </h1>
          <p className="landing__lede">i study cs, data science &amp; econ at mit. currently, i'm:</p>
          <ul className="landing__list">
            {now.items.map((item) => (
              <li key={item}>
                <RichText text={item} />
              </li>
            ))}
          </ul>
        </section>

        <div className="landing__portal">
          <PortalWormhole onEnter={enter} entering={entering} still={reducedMotion} />
        </div>

        <section className="landing__work" aria-labelledby="landing-work">
          <h2 id="landing-work" className="landing__label">selected work</h2>
          <ul className="landing__list">
            {work.map((w) => (
              <li key={w.key}>
                <a href={w.href} {...(w.external ? externalProps : {})}>{w.title}</a>
                <span className="landing__note"> · {w.note}</span>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="landing__footer">
        <a href={`mailto:${profile.email}`}>email</a>
        <a href={profile.social.github} {...externalProps}>github</a>
        <a href={profile.social.linkedin} {...externalProps}>linkedin</a>
        {profile.resume && <a href={profile.resume} {...externalProps}>resume</a>}
        <a href="#/quick">full text version</a>
      </footer>
      {entering && <div className="landing__veil" aria-hidden="true" />}
    </div>
  )
}
