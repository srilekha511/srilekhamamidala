import { VIEW_W } from '../engine/renderer.js'

export const WAINSCOT_Y = 120
export const FLOOR_Y = 150
export const AVATAR_FEET_Y = 162
export const TILE_Y = 158
export const TILE_H = 6

export const SECTIONS = [
  { id: 'about', label: 'About', icon: 'person' },
  { id: 'research', label: 'Research', icon: 'flask' },
  { id: 'projects', label: 'Projects', icon: 'laptop' },
  { id: 'experience', label: 'Experience', icon: 'briefcase' },
  { id: 'contact', label: 'Contact', icon: 'envelope' },
]

// Light pastel galleries. accent = tile glow + labels, ink = icons on cream thumbnails.
export const THEMES = {
  hall: { wall: '#efe4d2', wallDark: '#e3d5bf', trim: '#9a7650', floor: '#c49a6c', floorLine: '#ad8457', accent: '#6a3f8a', ink: '#4a3a2a' },
  about: { wall: '#d6e9f2', wallDark: '#c5dde9', trim: '#7896ab', floor: '#c9a276', floorLine: '#b08b60', accent: '#1f4e6e', ink: '#1f4e6e' },
  research: { wall: '#f6efcc', wallDark: '#ebe2b8', trim: '#a08850', floor: '#c49a6c', floorLine: '#ad8457', accent: '#6a4a10', ink: '#5a3e0e' },
  projects: { wall: '#d9eedf', wallDark: '#c7e2cf', trim: '#6f9a7b', floor: '#c49a6c', floorLine: '#ad8457', accent: '#1e5a3e', ink: '#1e5a3e' },
  experience: { wall: '#f7e2cf', wallDark: '#ecd2bb', trim: '#a87a62', floor: '#b3a6c2', floorLine: '#9c8eae', accent: '#8a3a12', ink: '#6a3a22' },
  contact: { wall: '#eee0f2', wallDark: '#e1cfe7', trim: '#9278a8', floor: '#c9a3b1', floorLine: '#b28a99', accent: '#7a2560', ink: '#5a2a6a' },
}

const HALL_FRAME = { w: 56, h: 44, y: 44 }
const STARRY_FRAME = { w: 38, h: 26, y: 54 }
const ITEM_FRAME = { w: 48, h: 38, y: 50 }
const HALL_GAP = 50
const ITEM_GAP = 48
const TILE_W = 24
const TILE_GAP = 32
const START_TILE_X = 16 // Home portal just inside the entrance
const SECTION_SPAWN_X = 64 // arrive clear of that portal
const FIRST_ITEM_X = 100

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
    plaque: p.plaque ?? p.title,
    thumb: { type: 'art', art: p.art ?? 'idea' },
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
    plaque: e.plaque ?? e.company,
    thumb: { type: 'art', art: e.art ?? 'idea' },
    card: card({
      title: e.company,
      subtitle: e.role,
      meta: [e.location, e.dates].filter(Boolean).join(' · '),
      body: e.paper ? [`**Paper:** ${e.paper}`] : [],
      bullets: e.bullets,
      tags: e.tags ?? [],
      image: e.image ?? null,
    }),
  }))
}

export function aboutItems({ profile, education, skills, interests }) {
  return [
    {
      id: 'about-me',
      plaque: profile.firstName,
      thumb: { type: 'art', art: 'avatar' },
      card: card({ title: profile.fullName, subtitle: profile.fullRole, body: [profile.bio], image: profile.headshot }),
    },
    {
      id: 'about-education',
      plaque: 'Education',
      thumb: { type: 'art', art: 'mit' },
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
      plaque: 'Skills',
      thumb: { type: 'art', art: 'inventory' },
      card: card({ title: 'Skills', bullets: skills.map((g) => ({ label: g.group, text: g.items.join(', ') })) }),
    },
    {
      id: 'about-interests',
      plaque: 'Interests',
      thumb: { type: 'art', art: 'interests' },
      card: card({
        title: 'Interests',
        bullets: [
          { label: 'Academic & Research', text: interests.academic.join(', ') },
          { label: 'For Fun', text: interests.personal.join(', ') },
        ],
      }),
    },
  ]
}

export function contactItems(profile) {
  return [
    {
      id: 'contact-email',
      plaque: 'Email',
      href: `mailto:${profile.email}`,
      thumb: { type: 'art', art: 'email' },
      card: card({ title: 'Email', body: ['Say hi!'], links: [{ href: `mailto:${profile.email}`, label: profile.email }] }),
    },
    {
      id: 'contact-github',
      plaque: 'GitHub',
      href: profile.social.github,
      thumb: { type: 'art', art: 'github' },
      card: card({ title: 'GitHub', body: ['Code for my projects.'], links: [{ href: profile.social.github, label: 'github.com/srilekha511' }] }),
    },
    {
      id: 'contact-linkedin',
      plaque: 'LinkedIn',
      href: profile.social.linkedin,
      thumb: { type: 'art', art: 'linkedin' },
      card: card({ title: 'LinkedIn', body: ["Let's connect!"], links: [{ href: profile.social.linkedin, label: 'linkedin.com/in/srilekha-mamidala' }] }),
    },
  ]
}

function sectionRoom(section, items) {
  const frames = items.map((item, i) => ({
    id: item.id,
    kind: 'item',
    label: item.card.title,
    plaque: item.plaque,
    ...(item.href ? { href: item.href } : {}),
    x: FIRST_ITEM_X + i * (ITEM_FRAME.w + ITEM_GAP),
    ...ITEM_FRAME,
    thumb: item.thumb,
    card: item.card,
  }))
  const lastEnd = frames.length ? frames.at(-1).x + ITEM_FRAME.w : 40
  const destinations = [{ id: 'hall', label: 'Home', icon: 'house' }, ...SECTIONS.filter((s) => s.id !== section.id)]
  const startTile = { id: 'tile-hall-start', target: 'hall', label: 'Home', icon: 'house', x: START_TILE_X, w: TILE_W }
  const endTiles = destinations.map((d, i) => ({
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
    tiles: [startTile, ...endTiles],
    width: Math.max(VIEW_W, endTiles.at(-1).x + TILE_W + 12),
    spawnX: SECTION_SPAWN_X,
  }
}

export function buildRooms(data) {
  const section = (id) => SECTIONS.find((s) => s.id === id)
  const inResearch = (x) => x.room === 'research'
  return {
    hall: buildHall(),
    about: sectionRoom(section('about'), aboutItems(data)),
    // Research: roles first, then papers, so the CSAIL role sits next to its paper.
    research: sectionRoom(section('research'), [
      ...experienceItems(data.experience.filter(inResearch)),
      ...projectItems(data.projects.filter(inResearch)),
    ]),
    projects: sectionRoom(section('projects'), projectItems(data.projects.filter((p) => !inResearch(p)))),
    experience: sectionRoom(section('experience'), experienceItems(data.experience.filter((e) => !inResearch(e)))),
    contact: sectionRoom(section('contact'), contactItems(data.profile)),
  }
}
