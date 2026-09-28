export default function CornerMenu({ soundOn, onToggleSound, onReplayIntro, onQuickView }) {
  return (
    <nav className="corner-menu" aria-label="Site menu">
      <button className="pixel-button" onClick={onQuickView} aria-label="Quick view (text version)">📜 Quick view</button>
      <button className="pixel-button" onClick={onToggleSound} aria-label={soundOn ? 'Sound on' : 'Sound off'}>{soundOn ? '🔊' : '🔇'}</button>
      <button className="pixel-button" onClick={onReplayIntro} aria-label="Replay intro">🎬</button>
    </nav>
  )
}
