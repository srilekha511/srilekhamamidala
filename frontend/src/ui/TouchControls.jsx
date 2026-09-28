function HoldButton({ action, label, children, className, onPress, onRelease }) {
  const release = () => onRelease(action)
  return (
    <button
      className={`pixel-button touch-button ${className}`}
      aria-label={label}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture?.(e.pointerId)
        onPress(action)
      }}
      onPointerUp={release}
      onPointerLeave={release}
      onPointerCancel={release}
      onContextMenu={(e) => e.preventDefault()}
    >
      {children}
    </button>
  )
}

export default function TouchControls({ onPress, onRelease }) {
  const common = { onPress, onRelease }
  return (
    <div className="touch-controls">
      <div className="touch-controls__dpad">
        <HoldButton action="left" label="Walk left" className="touch-button--dir" {...common}>◀</HoldButton>
        <HoldButton action="right" label="Walk right" className="touch-button--dir" {...common}>▶</HoldButton>
      </div>
      <HoldButton action="interact" label="Interact (A)" className="touch-button--a" {...common}>A</HoldButton>
    </div>
  )
}
