export default function SpeechBubble({ text, pos }) {
  if (!text || !pos) return null
  const left = Math.min(Math.max(pos.x * 100, 12), 88)
  return (
    <div className="speech-bubble pixel-border" style={{ left: `${left}%`, top: `${pos.y * 100}%` }}>
      {text}
    </div>
  )
}
