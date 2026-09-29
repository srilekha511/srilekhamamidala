// Content strings can mark key words as **bold**.
export function parseBold(text) {
  const parts = String(text).split(/\*\*(.+?)\*\*/g)
  return parts.map((t, i) => ({ text: t, bold: i % 2 === 1 })).filter((p) => p.text !== '')
}

export default function RichText({ text }) {
  return parseBold(text).map((p, i) => (p.bold ? <strong key={i}>{p.text}</strong> : <span key={i}>{p.text}</span>))
}
