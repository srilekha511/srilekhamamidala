import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as data from './data.js'
import { createStorage, KEYS } from './storage.js'
import { parseHash, hashFor, urlWithHash, urlMatchesHash, LANDING_HASH } from './routing.js'
import GameCanvas from './ui/GameCanvas.jsx'
import SpeechBubble from './ui/SpeechBubble.jsx'
import InfoCard from './ui/InfoCard.jsx'
import CornerMenu from './ui/CornerMenu.jsx'
import SkipButton from './ui/SkipButton.jsx'
import TouchControls from './ui/TouchControls.jsx'
import DirectoryMenu from './ui/DirectoryMenu.jsx'
import useMediaQuery from './ui/useMediaQuery.js'
import { openLink } from './ui/openLink.js'
import PassportPanel from './ui/PassportPanel.jsx'
import { createPassport } from './passport.js'

// The pixel museum. Loaded lazily by App when a visitor steps through the portal or deep-links to a room.
// intro: 'full' (painting reveal + zoom), 'zoom' (zoom into the hall only) or 'none'.
export default function Museum({ initialRoom = 'hall', intro = 'none', theme, onToggleTheme, quickOpen, onOpenQuick, onHome, onRoomChange }) {
  const storage = useMemo(() => createStorage(), [])
  const passport = useMemo(() => createPassport(storage), [storage])
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const isTouch = useMediaQuery('(pointer: coarse)')

  const [introPlaying, setIntroPlaying] = useState(intro !== 'none')
  const [soundOn, setSoundOn] = useState(() => storage.get(KEYS.soundOn, false))
  const [bubble, setBubble] = useState(null)
  const [card, setCard] = useState(null)
  const [avatarPos, setAvatarPos] = useState(null)
  const [room, setRoom] = useState(initialRoom)
  const [stamps, setStamps] = useState(() => passport.list())
  const [passportOpen, setPassportOpen] = useState(false)

  const gameRef = useRef(null)
  const roomRef = useRef(initialRoom)
  const pendingRoomRef = useRef(null) // Back/Forward that arrived while the game was busy

  const options = useMemo(
    () => ({
      data, initialRoom, playIntro: intro !== 'none', introFrom: intro === 'zoom' ? 'zoom' : 'start',
      reducedMotion, isTouch, soundOn, collectedStamps: stamps, night: theme === 'dark',
    }),
    // read once at mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const handlers = {
    bubble: (b) => setBubble(b?.text ?? null),
    card: setCard,
    avatar: setAvatarPos,
    room: (room) => {
      roomRef.current = room
      setRoom(room)
      onRoomChange?.(room)
      const current = parseHash(window.location.hash)
      const target = hashFor(room)
      if (current.quick || current.view !== 'museum' || urlMatchesHash(target)) return
      // Same room, different spelling ('#/Projects'): tidy the URL without a history entry.
      if (current.room === room) window.history.replaceState(null, '', urlWithHash(target))
      else window.history.pushState(null, '', urlWithHash(target))
    },
    settled: () => {
      const pending = pendingRoomRef.current
      pendingRoomRef.current = null
      if (pending && pending !== roomRef.current) gameRef.current?.goTo(pending, { kind: 'crossfade' })
    },
    introDone: () => {
      storage.set(KEYS.introSeen, true)
      setIntroPlaying(false)
    },
    back: () => setCard(null),
    open: (href) => openLink(href),
    stamp: (id) => {
      passport.collect(id)
      setStamps(passport.list())
    },
  }

  const onReady = useCallback((game) => {
    gameRef.current = game
  }, [])

  // Back/Forward between rooms. The landing page and the brochure belong to App.
  useEffect(() => {
    const onHash = () => {
      const { view, room, quick } = parseHash(window.location.hash)
      if (quick || view !== 'museum') return
      if (room === roomRef.current) {
        pendingRoomRef.current = null
      } else if (!gameRef.current?.goTo(room, { kind: 'crossfade' })) {
        pendingRoomRef.current = room // last one wins once the current transition/intro finishes
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
    gameRef.current?.setNight(theme === 'dark')
  }, [theme])

  useEffect(() => {
    gameRef.current?.setPaused(quickOpen || passportOpen)
  }, [quickOpen, passportOpen])

  const closePassport = useCallback(() => setPassportOpen(false), [])
  const toggleSound = () => {
    const next = !soundOn
    setSoundOn(next)
    storage.set(KEYS.soundOn, next)
    gameRef.current?.setSoundOn(next)
  }
  const travel = (target) => {
    if (target === roomRef.current) return
    if (!gameRef.current?.goTo(target)) pendingRoomRef.current = target // busy: go once it settles
  }
  const replayIntro = () => {
    if (gameRef.current?.replayIntro()) setIntroPlaying(true)
  }
  const goHome = (e) => {
    e.preventDefault()
    onHome()
  }

  return (
    <div className="app">
      <a className="skip-link" href="#/quick">Skip to text version</a>
      <header className="top-bar">
        <h1 className="site-title">
          <a className="site-title__link" href={urlWithHash(LANDING_HASH)} onClick={goHome}>Srilekha's Gallery</a>
        </h1>
        <CornerMenu
          soundOn={soundOn}
          onToggleSound={toggleSound}
          onReplayIntro={replayIntro}
          onQuickView={onOpenQuick}
          stampCount={stamps.length}
          onPassport={() => setPassportOpen(true)}
          dark={theme === 'dark'}
          onToggleTheme={onToggleTheme}
        />
        {/* Floats on the left on big screens; collapses into a Map dropdown in the header on phones. */}
        {!introPlaying && <DirectoryMenu room={room} onGo={travel} />}
      </header>

      <main className="stage">
        <GameCanvas options={options} handlers={handlers} onReady={onReady}>
          <SpeechBubble text={bubble} pos={avatarPos} />
          {introPlaying && <SkipButton onSkip={() => gameRef.current?.skipIntro()} />}
        </GameCanvas>
        <div className="card-slot">
          <InfoCard card={card} onClose={() => setCard(null)} />
          {/* Shown only on portrait touch screens, where the card area sits empty under the game. */}
          {!card && !introPlaying && isTouch && (
            <p className="card-hint">Walk up to a painting and its story appears here. In a hurry? Tap 📜 up top for the text version.</p>
          )}
        </div>
      </main>

      {isTouch && <TouchControls onPress={(a) => gameRef.current?.press(a)} onRelease={(a) => gameRef.current?.release(a)} />}

      <div role="status" aria-live="polite" className="visually-hidden">
        {bubble}
        {card ? ` ${card.title}. ${card.subtitle}` : ''}
      </div>

      {passportOpen && <PassportPanel stamps={stamps} onClose={closePassport} />}
    </div>
  )
}
