import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as data from './data.js'
import { createStorage, KEYS } from './storage.js'
import { parseHash, hashFor, urlWithHash, urlMatchesHash } from './routing.js'
import GameCanvas from './ui/GameCanvas.jsx'
import SpeechBubble from './ui/SpeechBubble.jsx'
import InfoCard from './ui/InfoCard.jsx'
import QuickView from './ui/QuickView.jsx'
import CornerMenu from './ui/CornerMenu.jsx'
import SkipButton from './ui/SkipButton.jsx'
import TouchControls from './ui/TouchControls.jsx'
import DirectoryMenu from './ui/DirectoryMenu.jsx'
import useMediaQuery from './ui/useMediaQuery.js'
import { openLink } from './ui/openLink.js'
import PassportPanel from './ui/PassportPanel.jsx'
import { createPassport } from './passport.js'

export default function App() {
  const storage = useMemo(() => createStorage(), [])
  const passport = useMemo(() => createPassport(storage), [storage])
  const initial = useMemo(() => parseHash(window.location.hash), [])
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const isTouch = useMediaQuery('(pointer: coarse)')
  const systemDark = useMediaQuery('(prefers-color-scheme: dark)')
  const [themeChoice, setThemeChoice] = useState(() => storage.get(KEYS.theme, null)) // null = follow the system
  const theme = themeChoice === 'dark' || themeChoice === 'light' ? themeChoice : systemDark ? 'dark' : 'light'

  const isDeepLink = initial.room !== 'hall' || initial.quick
  const [introPlaying, setIntroPlaying] = useState(() => !isDeepLink && !storage.get(KEYS.introSeen, false))
  const [quickOpen, setQuickOpen] = useState(initial.quick)
  const [soundOn, setSoundOn] = useState(() => storage.get(KEYS.soundOn, false))
  const [bubble, setBubble] = useState(null)
  const [card, setCard] = useState(null)
  const [avatarPos, setAvatarPos] = useState(null)
  const [room, setRoom] = useState(initial.room)
  const [stamps, setStamps] = useState(() => passport.list())
  const [passportOpen, setPassportOpen] = useState(false)

  const gameRef = useRef(null)
  const roomRef = useRef(initial.room)
  const pendingRoomRef = useRef(null) // Back/Forward that arrived while the game was busy
  const quickPushedRef = useRef(false) // brochure opened by us, so closing can step back

  const options = useMemo(
    () => ({ data, initialRoom: initial.room, playIntro: introPlaying, reducedMotion, isTouch, soundOn, collectedStamps: stamps, night: theme === 'dark' }),
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
      const current = parseHash(window.location.hash)
      const target = hashFor(room)
      if (current.quick || urlMatchesHash(target)) return
      // Same room, different spelling ('#/', '#/Projects', '#/foo'): tidy the URL without a history entry.
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

  useEffect(() => {
    const onHash = () => {
      const { room, quick } = parseHash(window.location.hash)
      if (quick) {
        setQuickOpen(true)
        return
      }
      setQuickOpen(false)
      quickPushedRef.current = false
      if (room === roomRef.current) {
        pendingRoomRef.current = null
      } else if (!gameRef.current?.goTo(room, { kind: 'crossfade' })) {
        pendingRoomRef.current = room // last one wins once the current transition/intro finishes
      }
    }
    // Back/Forward between pushState entries fires popstate (and hashchange when the # changes); onHash is idempotent.
    window.addEventListener('hashchange', onHash)
    window.addEventListener('popstate', onHash)
    return () => {
      window.removeEventListener('hashchange', onHash)
      window.removeEventListener('popstate', onHash)
    }
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    gameRef.current?.setNight(theme === 'dark')
  }, [theme])

  useEffect(() => {
    gameRef.current?.setPaused(quickOpen || passportOpen)
  }, [quickOpen, passportOpen])

  const openQuick = () => {
    setQuickOpen(true)
    quickPushedRef.current = true
    window.location.hash = hashFor(roomRef.current, true)
  }
  const closeQuick = useCallback(() => {
    setQuickOpen(false)
    if (quickPushedRef.current) {
      quickPushedRef.current = false
      window.history.back()
    } else {
      window.history.replaceState(null, '', urlWithHash(hashFor(roomRef.current)))
    }
  }, [])
  const closePassport = useCallback(() => setPassportOpen(false), [])
  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setThemeChoice(next)
    storage.set(KEYS.theme, next)
  }
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

  return (
    <div className="app">
      <a className="skip-link" href="#/quick">Skip to text version</a>
      <header className="top-bar">
        <h1 className="site-title">Srilekha's Gallery</h1>
        <CornerMenu
          soundOn={soundOn}
          onToggleSound={toggleSound}
          onReplayIntro={replayIntro}
          onQuickView={openQuick}
          stampCount={stamps.length}
          onPassport={() => setPassportOpen(true)}
          dark={theme === 'dark'}
          onToggleTheme={toggleTheme}
        />
      </header>

      {!introPlaying && <DirectoryMenu room={room} onGo={travel} />}

      <main className="stage">
        <GameCanvas options={options} handlers={handlers} onReady={onReady}>
          <SpeechBubble text={bubble} pos={avatarPos} />
          {introPlaying && <SkipButton onSkip={() => gameRef.current?.skipIntro()} />}
        </GameCanvas>
        <div className="card-slot">
          <InfoCard card={card} onClose={() => setCard(null)} />
        </div>
      </main>

      {isTouch && <TouchControls onPress={(a) => gameRef.current?.press(a)} onRelease={(a) => gameRef.current?.release(a)} />}

      <div role="status" aria-live="polite" className="visually-hidden">
        {bubble}
        {card ? ` ${card.title}. ${card.subtitle}` : ''}
      </div>

      {quickOpen && <QuickView data={data} onClose={closeQuick} />}
      {passportOpen && <PassportPanel stamps={stamps} onClose={closePassport} />}
    </div>
  )
}
