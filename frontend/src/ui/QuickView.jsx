import { useEffect, useRef } from 'react'
import { asset } from '../asset.js'

const inResearch = (x) => x.room === 'research'

const role = (e) => (
  <article key={e.id} className="quick-view__entry">
    <h3>{e.company}</h3>
    <p className="quick-view__meta">{[e.role, e.location, e.dates].filter(Boolean).join(' · ')}</p>
    <ul>{e.bullets.map((b) => <li key={b}>{b}</li>)}</ul>
  </article>
)

const project = (p) => (
  <article key={p.id} className="quick-view__entry">
    <h3>{p.title}</h3>
    <p className="quick-view__meta">{p.category}</p>
    <p>{p.description}</p>
    {p.technologies?.length > 0 && <p className="quick-view__meta">{p.technologies.join(' · ')}</p>}
    {p.link && <a href={p.link} target="_blank" rel="noopener noreferrer">{p.linkText ?? 'View project'}</a>}
  </article>
)

export default function QuickView({ data, onClose }) {
  const closeRef = useRef(null)
  const { profile, education, skills, interests, experience, projects } = data

  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="quick-view" role="dialog" aria-modal="true" aria-labelledby="qv-title">
      <div className="quick-view__paper">
        <button ref={closeRef} className="pixel-button quick-view__close" onClick={onClose}>✕ Close brochure</button>
        <header className="quick-view__header">
          <img src={asset(profile.headshot)} alt={profile.fullName} className="quick-view__headshot" />
          <div>
            <h1 id="qv-title">{profile.fullName}</h1>
            <p>{profile.fullRole}</p>
          </div>
        </header>

        <section>
          <h2>About</h2>
          <p>{profile.bio}</p>
          <p><strong>Academic & Research interests:</strong> {interests.academic.join(' · ')}</p>
          <p><strong>Beyond the Classroom:</strong> {interests.personal.join(' · ')}</p>
          <ul>{skills.map((g) => <li key={g.group}><strong>{g.group}:</strong> {g.items.join(', ')}</li>)}</ul>
        </section>

        <section>
          <h2>Education</h2>
          <h3>{education.school}</h3>
          <p>{education.degree} · {education.location} · Expected {education.graduation}</p>
          <p><strong>Relevant coursework:</strong> {education.coursework.join(', ')}</p>
          <ul>{education.honors.map((h) => <li key={h}>{h}</li>)}</ul>
        </section>

        <section>
          <h2>Research</h2>
          {experience.filter(inResearch).map(role)}
          {projects.filter(inResearch).map(project)}
        </section>

        <section>
          <h2>Experience</h2>
          {experience.filter((e) => !inResearch(e)).map(role)}
        </section>

        <section>
          <h2>Projects</h2>
          {projects.filter((p) => !inResearch(p)).map(project)}
        </section>

        <section>
          <h2>Contact</h2>
          <ul>
            <li><a href={`mailto:${profile.email}`}>{profile.email}</a></li>
            <li><a href={profile.social.github} target="_blank" rel="noopener noreferrer">GitHub</a></li>
            <li><a href={profile.social.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
          </ul>
        </section>
      </div>
    </div>
  )
}
