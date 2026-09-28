import { VIEW_W } from '../engine/renderer.js'

export const WAINSCOT_Y = 120
export const FLOOR_Y = 150
export const AVATAR_FEET_Y = 162
export const TILE_Y = 158
export const TILE_H = 6

export const SECTIONS = [
  { id: 'about', label: 'About', icon: 'person' },
  { id: 'projects', label: 'Projects', icon: 'laptop' },
  { id: 'experience', label: 'Experience', icon: 'briefcase' },
  { id: 'contact', label: 'Contact', icon: 'envelope' },
]

export const THEMES = {
  hall: { wall: '#3b2f4a', wallDark: '#33283f', trim: '#6b4a32', floor: '#5a3d2b', floorLine: '#4a3122', accent: '#e0b44c' },
  about: { wall: '#2f4a5a', wallDark: '#28404e', trim: '#4a3a2a', floor: '#6b4a32', floorLine: '#573b27', accent: '#f2c94c' },
  projects: { wall: '#2f5a45', wallDark: '#284e3c', trim: '#3a2f25', floor: '#5a4632', floorLine: '#4a3927', accent: '#9ee6c1' },
  experience: { wall: '#5a3a2f', wallDark: '#4e3228', trim: '#2f2a3a', floor: '#4a4058', floorLine: '#3c3448', accent: '#f2a93b' },
  contact: { wall: '#4a2f5a', wallDark: '#40284e', trim: '#2f3a4a', floor: '#5a3d4a', floorLine: '#4a313c', accent: '#f4a6c8' },
}

const HALL_FRAME = { w: 56, h: 44, y: 44 }
const STARRY_FRAME = { w: 38, h: 26, y: 54 }
const ITEM_FRAME = { w: 48, h: 38, y: 50 }
const HALL_GAP = 50
const ITEM_GAP = 40
const TILE_W = 24
const TILE_GAP = 14

export function buildHall() {
  const frames = []
  let x = 60
  frames.push({ id: 'starry', kind: 'starry', label: 'The Starry Night', x, ...STARRY_FRAME })
  x += STARRY_FRAME.w + HALL_GAP
  for (const s of SECTIONS) {
    frames.push({ id: s.id, kind: 'section', label: s.label, target: s.id, cover: s.id, x, ...HALL_FRAME })
    x += HALL_FRAME.w + HALL_GAP
  }
  return {
    id: 'hall',
    label: 'Main Hall',
    theme: THEMES.hall,
    frames,
    tiles: [],
    width: Math.max(VIEW_W, x),
    spawnX: frames[0].x + frames[0].w + 16,
  }
}

const card = (c) => ({ subtitle: '', meta: '', body: [], bullets: [], tags: [], links: [], image: null, ...c })

export function projectItems(projects) {
  return projects.map((p) => ({
    id: `project-${p.id}`,
    thumb: { type: 'image', src: p.image },
    card: card({
      title: p.title,
      subtitle: p.category,
      body: [p.description, p.whatILearned && `What I learned: ${p.whatILearned}`].filter(Boolean),
      tags: p.technologies ?? [],
      links: p.link ? [{ href: p.link, label: p.linkText ?? 'View project' }] : [],
      image: p.image,
    }),
  }))
}

export function experienceItems(experience) {
  return experience.map((e) => ({
    id: `exp-${e.id}`,
    thumb: { type: 'monogram', text: e.monogram, color: e.color },
    card: card({
      title: e.company,
      subtitle: e.role,
      meta: [e.location, e.dates].filter(Boolean).join(' · '),
      bullets: e.bullets,
    }),
  }))
}

export function aboutItems({ profile, education, skills, interests }) {
  return [
    {
      id: 'about-me',
      thumb: { type: 'image', src: profile.headshot },
      card: card({ title: profile.fullName, subtitle: profile.fullRole, body: [profile.bio], image: profile.headshot }),
    },
    {
      id: 'about-education',
      thumb: { type: 'icon', icon: 'book' },
      card: card({
        title: education.school,
        subtitle: education.degree,
        meta: `${education.location} · Expected ${education.graduation}`,
        body: [`Relevant coursework: ${education.coursework.join(', ')}`],
        bullets: education.honors,
      }),
    },
    {
      id: 'about-skills',
      thumb: { type: 'icon', icon: 'star' },
      card: card({ title: 'Skills', bullets: skills.map((g) => `${g.group}: ${g.items.join(', ')}`) }),
    },
    {
      id: 'about-interests',
      thumb: { type: 'icon', icon: 'heart' },
      card: card({ title: 'Interests', bullets: interests }),
    },
  ]
}

export function contactItems(profile) {
  return [
    {
      id: 'contact-email',
      thumb: { type: 'icon', icon: 'envelope' },
      card: card({ title: 'Email', body: ['Say hi!'], links: [{ href: `mailto:${profile.email}`, label: profile.email }] }),
    },
    {
      id: 'contact-github',
      thumb: { type: 'icon', icon: 'code' },
      card: card({ title: 'GitHub', body: ['Code for my projects.'], links: [{ href: profile.social.github, label: 'github.com/srilekha511' }] }),
    },
    {
      id: 'contact-linkedin',
      thumb: { type: 'icon', icon: 'link' },
      card: card({ title: 'LinkedIn', body: ["Let's connect."], links: [{ href: profile.social.linkedin, label: 'linkedin.com/in/srilekha-mamidala' }] }),
    },
  ]
}

function sectionRoom(section, items) {
  const frames = items.map((item, i) => ({
    id: item.id,
    kind: 'item',
    label: item.card.title,
    x: 70 + i * (ITEM_FRAME.w + ITEM_GAP),
    ...ITEM_FRAME,
    thumb: item.thumb,
    card: item.card,
  }))
  const lastEnd = frames.length ? frames.at(-1).x + ITEM_FRAME.w : 40
  const destinations = [{ id: 'hall', label: 'Home', icon: 'house' }, ...SECTIONS.filter((s) => s.id !== section.id)]
  const tiles = destinations.map((d, i) => ({
    id: `tile-${d.id}`,
    target: d.id,
    label: d.label,
    icon: d.icon,
    x: lastEnd + 70 + i * (TILE_W + TILE_GAP),
    w: TILE_W,
  }))
  return {
    id: section.id,
    label: section.label,
    theme: THEMES[section.id],
    frames,
    tiles,
    width: Math.max(VIEW_W, tiles.at(-1).x + TILE_W + 40),
    spawnX: 24,
  }
}

export function buildRooms(data) {
  const [about, projects, experience, contact] = SECTIONS
  return {
    hall: buildHall(),
    about: sectionRoom(about, aboutItems(data)),
    projects: sectionRoom(projects, projectItems(data.projects)),
    experience: sectionRoom(experience, experienceItems(data.experience)),
    contact: sectionRoom(contact, contactItems(data.profile)),
  }
}
