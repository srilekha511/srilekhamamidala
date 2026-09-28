import { asset } from '../asset.js'

const isExternal = (href) => /^https?:/.test(href)

export default function InfoCard({ card, onClose }) {
  if (!card) return null
  return (
    <article className="info-card pixel-border" aria-labelledby="info-card-title">
      <button className="info-card__close" onClick={onClose} aria-label="Close card">✕</button>
      {card.image && <img className="info-card__image" src={asset(card.image)} alt="" />}
      <h2 id="info-card-title" className="info-card__title">{card.title}</h2>
      {card.subtitle && <p className="info-card__subtitle">{card.subtitle}</p>}
      {card.meta && <p className="info-card__meta">{card.meta}</p>}
      {card.body.map((p) => <p key={p}>{p}</p>)}
      {card.bullets.length > 0 && <ul>{card.bullets.map((b) => <li key={b}>{b}</li>)}</ul>}
      {card.tags.length > 0 && (
        <ul className="info-card__tags">{card.tags.map((t) => <li key={t} className="tag">{t}</li>)}</ul>
      )}
      {card.links.map((l) => (
        <a key={l.href} className="pixel-button" href={l.href} {...(isExternal(l.href) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
          {l.label}
        </a>
      ))}
    </article>
  )
}
