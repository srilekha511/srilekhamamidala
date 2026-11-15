export default function CornerMenu({ soundOn, onToggleSound, onReplayIntro, onQuickView, stampCount = 0, onPassport, dark = false, onToggleTheme }) {
  return (
    <nav className="corner-menu" aria-label="Site menu">
      <button className="pixel-button" onClick={onQuickView} aria-label="Quick view (text version)">
        📜 <span className="label-long">Quick view</span><span className="label-short">Text</span>
      </button>
      <button className="pixel-button" onClick={onPassport} aria-label={`Passport: ${stampCount} of 6 stamps`}>🎫 {stampCount}/6</button>
      <button className="pixel-button" onClick={onToggleSound} aria-label={soundOn ? 'Sound on' : 'Sound off'}>{soundOn ? '🔊' : '🔇'}</button>
      <button className="pixel-button" onClick={onToggleTheme} aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}>{dark ? '☀️' : '🌙'}</button>
      <button className="pixel-button" onClick={onReplayIntro} aria-label="Replay intro">🎬</button>
    </nav>
  )
}
