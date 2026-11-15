// Content strings can mark key words as **bold** and link with [text](https://…).
export function parseBold(text) {
  const parts = String(text).split(/\*\*(.+?)\*\*/g)
  return parts.map((t, i) => ({ text: t, bold: i % 2 === 1 })).filter((p) => p.text !== '')
}

// Only web links: anything else (javascript:, data:) stays as plain text.
const LINK = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g

const Bold = ({ text, prefix }) =>
  parseBold(text).map((p, i) => (p.bold ? <strong key={`${prefix}-${i}`}>{p.text}</strong> : <span key={`${prefix}-${i}`}>{p.text}</span>))

export default function RichText({ text }) {
  const s = String(text)
  const out = []
  let last = 0
  for (const m of s.matchAll(LINK)) {
    if (m.index > last) out.push(<Bold key={`t${last}`} prefix={`t${last}`} text={s.slice(last, m.index)} />)
    out.push(
      <a key={`a${m.index}`} href={m[2]} target="_blank" rel="noopener noreferrer">
        {m[1]}
      </a>,
    )
    last = m.index + m[0].length
  }
  if (last < s.length) out.push(<Bold key={`t${last}`} prefix={`t${last}`} text={s.slice(last)} />)
  return out
}
