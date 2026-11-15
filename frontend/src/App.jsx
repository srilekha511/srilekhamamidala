import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as data from './data.js'
import { createStorage, KEYS } from './storage.js'
import { parseHash, hashFor, urlWithHash, LANDING_HASH } from './routing.js'
import Landing from './ui/Landing.jsx'
import QuickView from './ui/QuickView.jsx'
import MuseumErrorBoundary from './ui/MuseumErrorBoundary.jsx'
import useMediaQuery from './ui/useMediaQuery.js'

// The game engine only downloads when someone enters the museum.
const Museum = lazy(() => import('./Museum.jsx'))

// Shell: the landing page or the museum, plus the theme and the text brochure shared by both.
export default function App() {
  const storage = useMemo(() => createStorage(), [])
  const initial = useMemo(() => parseHash(window.location.hash), [])
  const systemDark = useMediaQuery('(prefers-color-scheme: dark)')
  const [themeChoice, setThemeChoice] = useState(() => storage.get(KEYS.theme, null)) // null = follow the system
  const theme = themeChoice === 'dark' || themeChoice === 'light' ? themeChoice : systemDark ? 'dark' : 'light'

  const [view, setView] = useState(initial.view)
  const [museum, setMuseum] = useState({ room: initial.room, intro: 'none', key: 0 })
  const [quickOpen, setQuickOpen] = useState(initial.quick)

  const viewRef = useRef(initial.view)
  const roomRef = useRef(initial.room) // the museum's current room, for tidying the URL
  const quickPushedRef = useRef(false) // brochure reached by a new history entry, so closing steps back

  const show = (next, museumState) => {
    if (museumState) setMuseum((m) => ({ ...museumState, key: m.key + 1 }))
    viewRef.current = next
    setView(next)
    document.documentElement.scrollTop = 0
  }

  useEffect(() => {
    const onHash = () => {
      const r = parseHash(window.location.hash)
      if (r.quick) {
        quickPushedRef.current = true
        setQuickOpen(true)
        return
      }
      setQuickOpen(false)
      quickPushedRef.current = false
      if (r.view === viewRef.current) return
      if (r.view === 'museum') {
        roomRef.current = r.room
        show('museum', { room: r.room, intro: 'none' })
      } else {
        show('landing')
      }
    }
    window.addEventListener('hashchange', onHash)
    window.addEventListener('popstate', onHash)
    return () => {
      window.removeEventListener('hashchange', onHash)
      window.removeEventListener('popstate', onHash)
    }
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setThemeChoice(next)
    storage.set(KEYS.theme, next)
  }

  const enterMuseum = () => {
    // Every trip through the wormhole plays the full painting reveal (Skip is always there).
    window.history.pushState(null, '', urlWithHash(hashFor('hall')))
    roomRef.current = 'hall'
    show('museum', { room: 'hall', intro: 'full' })
  }
  const goHome = () => {
    window.history.pushState(null, '', urlWithHash(LANDING_HASH))
    show('landing')
  }

  const openQuick = () => {
    window.location.hash = hashFor(roomRef.current, true) // hashchange opens it
    quickPushedRef.current = true
    setQuickOpen(true)
  }
  const closeQuick = useCallback(() => {
    setQuickOpen(false)
    if (quickPushedRef.current) {
      quickPushedRef.current = false
      window.history.back()
    } else {
      const hash = viewRef.current === 'museum' ? hashFor(roomRef.current) : LANDING_HASH
      window.history.replaceState(null, '', urlWithHash(hash))
    }
  }, [])

  return (
    <>
      {view === 'landing' ? (
        <Landing data={data} dark={theme === 'dark'} onToggleTheme={toggleTheme} onEnter={enterMuseum} />
      ) : (
        <MuseumErrorBoundary onHome={goHome}>
          <Suspense fallback={<div className="museum-loading" />}>
            <Museum
              key={museum.key}
              initialRoom={museum.room}
              intro={museum.intro}
              theme={theme}
              onToggleTheme={toggleTheme}
              quickOpen={quickOpen}
              onOpenQuick={openQuick}
              onHome={goHome}
              onRoomChange={(room) => {
                roomRef.current = room
              }}
            />
          </Suspense>
        </MuseumErrorBoundary>
      )}
      {quickOpen && <QuickView data={data} onClose={closeQuick} />}
    </>
  )
}
