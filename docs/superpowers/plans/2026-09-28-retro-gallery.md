# Retro Pixel Art Gallery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current React portfolio with a pixelated retro-game art gallery: a pixel Starry Night intro, a walkable main hall whose paintings portal into About / Projects / Experience / Contact rooms, info cards, portal tiles, and a plain-text Quick view.

**Architecture:** A custom Canvas 2D engine renders a 320×180 world (scaled with nearest-neighbour) and owns the game loop, input, scenes and effects. React renders everything textual (speech bubbles, info cards, Quick view, menus, touch controls) as DOM overlays. Engine and React talk only through an event emitter (engine → React) and a small command API on the game object (React → engine). All logic that can be pure is pure and unit-tested; drawing is verified manually in the browser.

**Tech Stack:** React 18, Vite 5, Canvas 2D, WebAudio, Vitest 2 + jsdom + @testing-library/react. No new runtime dependencies.

**Spec:** `docs/superpowers/specs/2026-09-28-retro-gallery-design.md`

## Global Constraints

- Static site on GitHub Pages; base path `/srilekhamamidala/`; every asset URL goes through `asset()` (`src/asset.js`), which uses `import.meta.env.BASE_URL`.
- Internal resolution exactly **320×180**; `ctx.imageSmoothingEnabled = false`; canvas CSS `image-rendering: pixelated`.
- Main hall frames in order: Starry Night (small, decorative) → About → Projects → Experience → Contact. **No Awards room. No Résumé frame. GPA never appears anywhere.**
- Portal tiles only at the **end** of section rooms: Home + the other three sections. The main hall has no tiles.
- Speech copy (verbatim): welcome `Hi, I'm Srilekha! Welcome to my gallery ✨ Use ← → to walk, and step up to a painting to go inside.` (touch: `◀ ▶`); frame `Press Enter to step into {Section}!`; tile `Press Enter to go to {Destination}!`; touch variants replace `Press Enter` with `Tap A`.
- Sound **off by default**; storage keys `rg.introSeen`, `rg.soundOn`; all storage access via `src/storage.js` (never throws).
- Intro plays on first visit only, and never when the page loads with a deep-link hash.
- Engine code never touches DOM other than its own canvas, offscreen canvases, and window key/blur listeners. React never draws on the canvas.
- Keep React 18 / Vite 5 (no upgrades). CI builds on Node 18 — no Node ≥20-only APIs in build/test config.
- Work on branch `retro-gallery`. Every commit message ends with the line `Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>` (omitted from the commit commands below for brevity — always add it).
- All commands run from `frontend/` unless stated.

## Review Focus

1. **Rapid/repeated Enter during a transition or the intro** → exactly one navigation happens; presses that arrive while busy are dropped, not replayed later. (Task 3 `endFrame` test, Task 8 busy-request test.)
2. **Keys held when the window loses focus (alt-tab, clicking devtools)** → the avatar stops instead of walking forever. (Task 3 blur-reset test.)
3. **Unknown, legacy or oddly-cased hashes** (`#/foo`, `#/Projects`, `#/about/`) → land in a sensible room without crashing. (Task 4 routing tests.)
4. **A project image that 404s under the base path** → the frame shows a fallback tile; nothing throws. (Task 10 `loadPixelated` failure test + fallback draw in Task 11.)
5. **Tiny, portrait, or resized viewports** → the canvas never exceeds the available width (no horizontal scroll). (Task 3 `computeScale` property test.)

---

## File Structure

```
.tool-versions                         nodejs 22.14.0 for local asdf
frontend/
  index.html                           fonts + title
  vite.config.js                       + vitest config, − dev proxy
  package.json                         + test deps/script, − axios, − react-router-dom
  src/
    main.jsx                           mounts App, imports styles/global.css
    App.jsx                            state hub: room, bubble, card, quick view, sound, intro; hash sync
    data.js                            all content
    asset.js                           BASE_URL-aware asset paths
    storage.js                         safe localStorage
    routing.js                         hash <-> room
    test/stubCtx.js                    canvas 2D stub for tests
    engine/
      events.js  input.js  loop.js  renderer.js  camera.js  proximity.js  rng.js
      copy.js                          all speech-bubble strings
      director.js                      intro/play/transition state machine
      pixelate.js                      image → quantised pixel thumbnail (cached)
      audio.js                         WebAudio chiptune + SFX
      game.js                          integration: loop + director + scene + drawing + commands
      sprites/pixelArt.js  sprites/avatar.js  sprites/icons.js  sprites/frame.js  sprites/tiles.js
      paintings/starryNight.js  paintings/covers.js
      effects/tween.js  effects/reveal.js  effects/ripple.js  effects/fold.js  effects/fade.js
      draw/room.js  draw/avatar.js  draw/intro.js
    scenes/
      rooms.js                         room layouts built from data.js
      hallScene.js                     walkable room logic (no drawing)
      spawn.js                         where the avatar appears after a room change
    ui/
      GameCanvas.jsx  SpeechBubble.jsx  InfoCard.jsx  QuickView.jsx  CornerMenu.jsx
      SkipButton.jsx  TouchControls.jsx  useMediaQuery.js
    styles/global.css
```

Deleted in Task 16: `backend/`, `.github/workflows/static.yml`, `frontend/src/pages/`, `frontend/src/components/`, `frontend/src/App.css`, `frontend/src/index.css`, `frontend/public/404.html`, `frontend/public/proejcts.jpg`, `frontend/public/projectsactual.*`, `frontend/public/website.webp`.

---

### Task 1: Test tooling, asset paths, safe storage

**Files:**
- Create: `.tool-versions` (repo root), `frontend/src/asset.js`, `frontend/src/storage.js`, `frontend/src/test/stubCtx.js`
- Modify: `frontend/package.json`, `frontend/vite.config.js`
- Test: `frontend/src/asset.test.js`, `frontend/src/storage.test.js`

**Interfaces:**
- Produces: `asset(path: string): string`; `createStorage(backend?): { get(key, fallback), set(key, value) }`; `KEYS = { introSeen: 'rg.introSeen', soundOn: 'rg.soundOn' }`; `stubCtx(): Proxy` whose `.calls` is an array of `[methodName, ...args]`.

- [ ] **Step 1: Pin Node locally and install test deps**

```bash
cd /Users/srilekhamamidala/srilekhamamidala
echo "nodejs 22.14.0" > .tool-versions
cd frontend
npm install
npm install -D vitest@^2.1.9 jsdom@^25.0.1 @testing-library/react@^16.1.0 @testing-library/dom@^10.4.0
```

Add to `package.json` `"scripts"`: `"test": "vitest run"`.

- [ ] **Step 2: Add Vitest config and drop the dev proxy in `vite.config.js`**

Replace the `server` block and add `test`:

```js
  base: base,
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
```

- [ ] **Step 3: Write failing tests**

`src/asset.test.js`:
```js
import { describe, it, expect } from 'vitest'
import { asset } from './asset.js'

describe('asset', () => {
  it('prefixes the base url and strips a leading slash', () => {
    expect(asset('/project1img1.png')).toBe(import.meta.env.BASE_URL + 'project1img1.png')
    expect(asset('project1img1.png')).toBe(import.meta.env.BASE_URL + 'project1img1.png')
  })
  it('never produces a double slash', () => {
    expect(asset('//x.png')).not.toMatch(/[^:]\/\//)
  })
})
```

`src/storage.test.js`:
```js
import { describe, it, expect } from 'vitest'
import { createStorage } from './storage.js'

function mapBackend() {
  const m = new Map()
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, v), m }
}
const throwing = {
  getItem() { throw new Error('blocked') },
  setItem() { throw new Error('blocked') },
}

describe('storage', () => {
  it('round-trips JSON values through the backend', () => {
    const b = mapBackend()
    createStorage(b).set('k', { a: 1 })
    expect(createStorage(b).get('k', null)).toEqual({ a: 1 })
  })
  it('returns the fallback for missing keys', () => {
    expect(createStorage(mapBackend()).get('nope', false)).toBe(false)
  })
  it('never throws when the backend throws, and remembers in memory', () => {
    const s = createStorage(throwing)
    expect(() => s.set('k', true)).not.toThrow()
    expect(s.get('k', false)).toBe(true)
    expect(s.get('other', 'fb')).toBe('fb')
  })
  it('works with no backend at all', () => {
    const s = createStorage(null)
    s.set('k', 3)
    expect(s.get('k', 0)).toBe(3)
  })
  it('falls back when stored JSON is corrupt', () => {
    const b = mapBackend(); b.m.set('k', '{oops')
    expect(createStorage(b).get('k', 'fb')).toBe('fb')
  })
})
```

- [ ] **Step 4: Run to verify failure**

Run: `npx vitest run src/asset.test.js src/storage.test.js`
Expected: FAIL — cannot resolve `./asset.js` / `./storage.js`.

- [ ] **Step 5: Implement**

`src/asset.js`:
```js
// Resolves a public/ file against the deploy base path (e.g. /srilekhamamidala/).
export function asset(path) {
  const base = (import.meta.env.BASE_URL || '/').replace(/\/?$/, '/')
  return base + String(path).replace(/^\/+/, '')
}
```

`src/storage.js`:
```js
export const KEYS = { introSeen: 'rg.introSeen', soundOn: 'rg.soundOn' }

function defaultBackend() {
  try {
    const ls = window.localStorage
    ls.setItem('__rg_probe__', '1')
    ls.removeItem('__rg_probe__')
    return ls
  } catch {
    return null
  }
}

// localStorage wrapper that never throws (private mode, blocked site data, thumbnails).
export function createStorage(backend = defaultBackend()) {
  const memory = new Map()
  return {
    get(key, fallback) {
      if (memory.has(key)) return memory.get(key)
      try {
        const raw = backend ? backend.getItem(key) : null
        if (raw !== null && raw !== undefined) return JSON.parse(raw)
      } catch {
        // fall through to fallback
      }
      return fallback
    },
    set(key, value) {
      memory.set(key, value)
      try {
        backend?.setItem(key, JSON.stringify(value))
      } catch {
        // memory copy still serves this session
      }
    },
  }
}
```

`src/test/stubCtx.js` (used by later tasks):
```js
// Minimal CanvasRenderingContext2D stand-in that records every method call.
export function stubCtx() {
  const calls = []
  const target = {
    calls,
    measureText: (s) => ({ width: String(s).length * 8 }),
  }
  return new Proxy(target, {
    get(t, key) {
      if (key in t) return t[key]
      return (...args) => { calls.push([key, ...args]) }
    },
    set(t, key, value) {
      t[key] = value
      return true
    },
  })
}
```

- [ ] **Step 6: Run to verify pass**

Run: `npx vitest run src/asset.test.js src/storage.test.js`
Expected: PASS (7 tests).

- [ ] **Step 7: Commit**

```bash
cd /Users/srilekhamamidala/srilekhamamidala
git add .tool-versions frontend/package.json frontend/package-lock.json frontend/vite.config.js frontend/src/asset.js frontend/src/asset.test.js frontend/src/storage.js frontend/src/storage.test.js frontend/src/test/stubCtx.js
git commit -m "Add Vitest tooling, base-path asset helper, and safe storage"
```

---

### Task 2: Content in data.js

**Files:**
- Modify: `frontend/src/data.js`
- Test: `frontend/src/data.test.js`

**Interfaces:**
- Produces named exports: `profile`, `education`, `skills` (`[{ group, items[] }]`), `interests` (`string[]`), `projects` (unchanged array), `experience` (`[{ id, company, role, location, dates, bullets[], monogram, color }]`).

- [ ] **Step 1: Write the failing test** — `src/data.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import * as data from './data.js'

const publicDir = resolve(__dirname, '../public')
const exists = (p) => existsSync(resolve(publicDir, p.replace(/^\/+/, '')))

describe('content', () => {
  it('has every project field the gallery needs and the images exist', () => {
    expect(data.projects.length).toBeGreaterThan(0)
    for (const p of data.projects) {
      expect(p.id).toBeDefined()
      for (const f of ['title', 'category', 'description', 'image']) expect(typeof p[f]).toBe('string')
      expect(Array.isArray(p.technologies)).toBe(true)
      expect(exists(p.image), p.image).toBe(true)
    }
  })
  it('has 8 experience entries with required fields and unique ids', () => {
    expect(data.experience).toHaveLength(8)
    const ids = new Set()
    for (const e of data.experience) {
      for (const f of ['id', 'company', 'role', 'dates', 'monogram', 'color']) expect(typeof e[f]).toBe('string')
      expect(typeof e.location).toBe('string')
      expect(e.bullets.length).toBeGreaterThan(0)
      expect(e.monogram.length).toBeLessThanOrEqual(3)
      ids.add(e.id)
    }
    expect(ids.size).toBe(8)
  })
  it('has about-room content', () => {
    expect(data.education.school).toMatch(/Massachusetts Institute of Technology/)
    expect(data.education.coursework.length).toBeGreaterThan(0)
    expect(data.skills.every((g) => g.group && g.items.length)).toBe(true)
    expect(data.interests.length).toBeGreaterThan(0)
    expect(exists(data.profile.headshot)).toBe(true)
  })
  it('never exposes a GPA', () => {
    const all = JSON.stringify(data)
    expect(all).not.toMatch(/GPA/i)
    expect(all).not.toMatch(/4\.7/)
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run src/data.test.js`
Expected: FAIL — `data.experience` is undefined.

- [ ] **Step 3: Implement** — edit `src/data.js`. Keep the existing `profile` object and `projects` array exactly as they are, remove the two header comment lines, and add these exports after `profile`:

```js
export const education = {
  school: "Massachusetts Institute of Technology (MIT)",
  location: "Cambridge, MA",
  degree: "Candidate for Bachelor of Science in Computer Science, Data Science, and Economics",
  graduation: "June 2028",
  coursework: ["Algorithms", "Machine Learning", "Econometrics", "Game Theory", "Optimization for Business Analytics"],
  honors: [
    "Jane Street Math Prize for Girls Invitee (top 250 girls, USA/Canada)",
    "3-time International Science and Engineering Fair Finalist",
    "PennApps Hackathon Winner",
    "Bridgewater Associates AI Immersion Hackathon Invitee",
  ],
};

export const skills = [
  { group: "Programming", items: ["Python", "Java", "Linux", "C/C++", "R", "SQL", "TypeScript", "JavaScript", "Swift", "C#", "React", "Git", "Shell Scripting", "Kubernetes"] },
  { group: "Systems & Infrastructure", items: ["Object-Oriented Programming", "Distributed Systems", "Docker", "CI/CD", "Databricks", "AWS", "Terraform"] },
  { group: "Quantitative & ML", items: ["Machine Learning", "Statistical Analysis", "Econometrics", "Optimization", "PyTorch", "Data Analytics"] },
  { group: "Financial", items: ["LBO Modeling", "Financial Modeling", "Financial Statement Analysis", "Equity Valuation", "Market Research", "Portfolio Analysis", "Bloomberg API"] },
  { group: "Tools & Platforms", items: ["Bloomberg Terminal", "PowerPoint", "Word", "Excel", "Tableau", "Power BI", "Databricks", "AWS"] },
];

export const interests = [
  "AI & machine learning",
  "NLP & LLM evaluation research",
  "Venture capital & startups",
  "Quantitative finance & economics",
];

export const experience = [
  {
    id: "disney", company: "Disney Streaming", role: "Software Engineering Intern",
    location: "Santa Monica, CA", dates: "June 2026 – August 2026", monogram: "DS", color: "#1f3b8a",
    bullets: [
      "Developed internal developer tooling for Disney Streaming using Databricks, Apache Spark, AWS, Linux, and Terraform, improving platform scalability and engineering productivity across distributed data pipelines, reducing latency by over 400%",
      "Architected AI-assisted knowledge retrieval system leveraging Model Context Protocols (MCPs) to automate access to technical documentation and domain expertise, reducing engineering search time by 150% and automating developer workflows",
    ],
  },
  {
    id: "acronym", company: "Acronym", role: "Machine Learning Intern",
    location: "New York, NY", dates: "September 2026 – Present", monogram: "AC", color: "#2d6a4f",
    bullets: [
      "Building an LLM evaluation pipeline that scores signal extractions against source artifacts using LLM-as-a-Judge, surfacing model and prompt failure modes across unstructured data",
      "Analyzing HDBSCAN embedding-based clustering of extracted signals to analyze cluster quality and reduce redundant themes and improve group-level synthesis, enabling more accurate classification of new signals and emerging trends",
      "Designing evaluation infrastructure to benchmark LLM models and extraction strategies across quality, cost, and latency",
    ],
  },
  {
    id: "hof", company: "HOF Capital", role: "Investment Intern",
    location: "", dates: "September 2026 – Present", monogram: "HOF", color: "#7a2e2e",
    bullets: [
      "Source and conduct market and company diligence on AI, software, and frontier technology startups, assessing founders, products, markets, competitive landscapes, and technical differentiation to identify high-potential investment opportunities",
      "Develop investment theses through market research, founder conversations, and analysis of emerging technologies and products",
    ],
  },
  {
    id: "medialab", company: "MIT Media Lab", role: "Research Intern",
    location: "", dates: "September 2026 – Present", monogram: "ML", color: "#5b2a86",
    bullets: [
      "Investigating self-confirming inference in persistent LLM memory by instrumenting an open-source memory system to trace preference updates to interaction evidence and distinguish user beliefs from preferences reinforced by agent interactions",
      "Measuring inference provenance with multi-turn interactions and validating automated classifications vs. hand-labeled traces",
    ],
  },
  {
    id: "mitecon", company: "MIT Department of Economics", role: "Research Intern",
    location: "Cambridge, MA", dates: "June 2026 – Present", monogram: "EC", color: "#8a1f2b",
    bullets: [
      "Developed and evaluated technical infrastructure for a large-scale RCT studying smartphone use and adolescent well-being",
      "Analyzed Android application and Django backend logs to diagnose missing/incomplete smartphone usage records",
    ],
  },
  {
    id: "csail", company: "MIT CSAIL, Decentralized Information Group", role: "Research Intern",
    location: "Cambridge, MA", dates: "August 2024 – Present", monogram: "DIG", color: "#1d5c7a",
    bullets: [
      "Accelerated insurance communication services by >60% by researching development of mathematical metrics for subjective quality evaluation across 10+ large language models (LLMs) in coordination with industry partner Liberty Mutual",
      "Designed parallel human/LLM judge studies via 300+ human ratings to create auto-evaluation metrics for Agentic AI models",
    ],
  },
  {
    id: "525vc", company: "525 Venture Capital Firm", role: "Venture Associate Intern",
    location: "New York, NY", dates: "December 2025 – February 2026", monogram: "525", color: "#b5651d",
    bullets: [
      "Built AI-driven investment portfolio management system using voice and text agentic AI models to ingest founder calls, inbound applications, pitch decks, and market research for deal sourcing, generating first-pass deal memos and SWOT analyses",
      "Training on historical decisions, diligence frameworks to flag risks, rank diligence questions, support investment decisions",
    ],
  },
  {
    id: "earthian", company: "Earthian AI — Dutch Commercial Property Insurance Optimization Startup", role: "Software Engineering Intern",
    location: "Enschede, Netherlands", dates: "June 2025 – August 2025", monogram: "EA", color: "#2e7d32",
    bullets: [
      "Improved climate risk analysis and expedited claim processing and underwriting by 200+% and delivered 2x more accurate insights for insurers in energy markets via PyTorch, FastAPI, AWS, React, leading development of full-stack AI chatbot",
    ],
  },
];
```

- [ ] **Step 4: Run to verify pass**

Run: `npx vitest run src/data.test.js`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/data.js src/data.test.js
git commit -m "Add education, skills, interests, and experience content"
```

---

### Task 3: Engine primitives — events, input, loop, renderer scale, camera

**Files:**
- Create: `src/engine/events.js`, `src/engine/input.js`, `src/engine/loop.js`, `src/engine/renderer.js`, `src/engine/camera.js`
- Test: `src/engine/input.test.js`, `src/engine/loop.test.js`, `src/engine/renderer.test.js`, `src/engine/camera.test.js`, `src/engine/events.test.js`

**Interfaces:**
- Produces:
  - `createEmitter(): { on(type, fn): () => void, emit(type, payload) }`
  - `KEYMAP`; `createInput(): { held, press(a), release(a), reset(), consume(a): boolean, direction(): -1|0|1, endFrame(), attach(target=window): () => void }` where actions are `'left'|'right'|'interact'|'back'`
  - `STEP = 1/60`, `MAX_FRAME = 0.25`, `createLoop({ update, render, raf?, caf? }): { advance(dtSeconds): number, start(), stop() }`
  - `VIEW_W = 320`, `VIEW_H = 180`, `computeScale(availW, availH): number`, `setupCanvas(canvas): CanvasRenderingContext2D`
  - `clampCamera(x, roomWidth, viewW=VIEW_W)`, `followCamera(camX, targetX, roomWidth, dt, viewW=VIEW_W)`

- [ ] **Step 1: Write failing tests**

`src/engine/events.test.js`:
```js
import { describe, it, expect, vi } from 'vitest'
import { createEmitter } from './events.js'

describe('emitter', () => {
  it('delivers payloads and unsubscribes', () => {
    const e = createEmitter(); const fn = vi.fn()
    const off = e.on('card', fn)
    e.emit('card', { a: 1 }); off(); e.emit('card', { a: 2 })
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith({ a: 1 })
  })
  it('ignores events with no listeners', () => {
    expect(() => createEmitter().emit('nobody', 1)).not.toThrow()
  })
})
```

`src/engine/input.test.js`:
```js
import { describe, it, expect } from 'vitest'
import { createInput } from './input.js'

const key = (type, k, target = document.body) => {
  const e = new KeyboardEvent(type, { key: k, bubbles: true, cancelable: true })
  target.dispatchEvent(e)
  return e
}

describe('input', () => {
  it('maps arrows and WASD to direction', () => {
    const i = createInput(); const off = i.attach(window)
    key('keydown', 'ArrowRight'); expect(i.direction()).toBe(1)
    key('keyup', 'ArrowRight'); key('keydown', 'a'); expect(i.direction()).toBe(-1)
    off()
  })
  it('holding left and right together cancels out', () => {
    const i = createInput(); i.press('left'); i.press('right')
    expect(i.direction()).toBe(0)
  })
  it('interact is edge-triggered: one press per keydown, repeats ignored', () => {
    const i = createInput(); const off = i.attach(window)
    key('keydown', 'Enter'); key('keydown', 'Enter') // auto-repeat
    expect(i.consume('interact')).toBe(true)
    expect(i.consume('interact')).toBe(false)
    off()
  })
  it('drops unconsumed presses at the end of a frame', () => {
    const i = createInput(); i.press('interact'); i.endFrame()
    expect(i.consume('interact')).toBe(false)
  })
  it('releases everything when the window loses focus', () => {
    const i = createInput(); const off = i.attach(window)
    key('keydown', 'ArrowRight')
    window.dispatchEvent(new Event('blur'))
    expect(i.direction()).toBe(0)
    off()
  })
  it('ignores keys typed into buttons, links, and inputs', () => {
    const i = createInput(); const off = i.attach(window)
    const btn = document.createElement('button'); document.body.appendChild(btn)
    const e = key('keydown', 'Enter', btn)
    expect(i.consume('interact')).toBe(false)
    expect(e.defaultPrevented).toBe(false)
    btn.remove(); off()
  })
  it('prevents page scroll for game keys', () => {
    const i = createInput(); const off = i.attach(window)
    expect(key('keydown', ' ').defaultPrevented).toBe(true)
    off()
  })
})
```

`src/engine/loop.test.js`:
```js
import { describe, it, expect, vi } from 'vitest'
import { createLoop, STEP } from './loop.js'

describe('loop', () => {
  it('runs fixed steps for elapsed time', () => {
    const update = vi.fn()
    const loop = createLoop({ update, render: () => {}, raf: () => 0, caf: () => {} })
    expect(loop.advance(STEP * 3)).toBe(3)
    expect(update).toHaveBeenCalledWith(STEP)
  })
  it('clamps huge frame gaps (background tab) to 0.25s', () => {
    const loop = createLoop({ update: () => {}, render: () => {}, raf: () => 0, caf: () => {} })
    expect(loop.advance(10)).toBe(15)
  })
  it('ignores negative dt', () => {
    const loop = createLoop({ update: () => {}, render: () => {}, raf: () => 0, caf: () => {} })
    expect(loop.advance(-1)).toBe(0)
  })
})
```

`src/engine/renderer.test.js`:
```js
import { describe, it, expect } from 'vitest'
import { computeScale, VIEW_W, VIEW_H } from './renderer.js'

describe('computeScale', () => {
  it('uses an integer scale when at least 2x fits', () => {
    expect(computeScale(1440 - 32, 900 - 220)).toBe(3)
  })
  it('fills small screens with a fractional scale', () => {
    const s = computeScale(390 - 32, 600)
    expect(s).toBeGreaterThan(1)
    expect(s).toBeLessThan(2)
  })
  it('never exceeds the available width or height', () => {
    for (const [w, h] of [[358, 624], [200, 100], [1000, 300], [320, 180], [2560, 1300], [150, 90]]) {
      const s = computeScale(w, h)
      expect(VIEW_W * s).toBeLessThanOrEqual(w + 0.001)
      expect(VIEW_H * s).toBeLessThanOrEqual(h + 0.001)
      expect(s).toBeGreaterThan(0)
    }
  })
})
```

`src/engine/camera.test.js`:
```js
import { describe, it, expect } from 'vitest'
import { clampCamera, followCamera } from './camera.js'

describe('camera', () => {
  it('clamps to room bounds', () => {
    expect(clampCamera(-50, 1000)).toBe(0)
    expect(clampCamera(900, 1000)).toBe(680)
    expect(clampCamera(100, 200)).toBe(0) // room narrower than view
  })
  it('eases toward the avatar-centred position', () => {
    const x = followCamera(0, 500, 1000, 1 / 60)
    expect(x).toBeGreaterThan(0)
    expect(x).toBeLessThan(340)
    let c = 0
    for (let i = 0; i < 600; i++) c = followCamera(c, 500, 1000, 1 / 60)
    expect(c).toBeCloseTo(340, 1)
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run src/engine`
Expected: FAIL — modules not found.

- [ ] **Step 3: Implement**

`src/engine/events.js`:
```js
export function createEmitter() {
  const handlers = new Map()
  return {
    on(type, fn) {
      if (!handlers.has(type)) handlers.set(type, new Set())
      handlers.get(type).add(fn)
      return () => handlers.get(type).delete(fn)
    },
    emit(type, payload) {
      handlers.get(type)?.forEach((fn) => fn(payload))
    },
  }
}
```

`src/engine/input.js`:
```js
export const KEYMAP = {
  ArrowLeft: 'left', a: 'left', A: 'left',
  ArrowRight: 'right', d: 'right', D: 'right',
  Enter: 'interact', ArrowUp: 'interact', ' ': 'interact',
  Escape: 'back',
}

const INTERACTIVE_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'A'])
const isInteractive = (t) => !!t && (INTERACTIVE_TAGS.has(t.tagName) || t.isContentEditable)

export function createInput() {
  const held = { left: false, right: false, interact: false, back: false }
  const presses = new Set()

  function press(action) {
    if (!held[action]) presses.add(action)
    held[action] = true
  }
  function release(action) {
    held[action] = false
  }
  function reset() {
    for (const k of Object.keys(held)) held[k] = false
    presses.clear()
  }
  function onKeyDown(e) {
    const action = KEYMAP[e.key]
    if (!action || isInteractive(e.target)) return
    e.preventDefault()
    press(action)
  }
  function onKeyUp(e) {
    const action = KEYMAP[e.key]
    if (action) release(action)
  }

  return {
    held,
    press,
    release,
    reset,
    consume(action) {
      const had = presses.has(action)
      presses.delete(action)
      return had
    },
    direction() {
      return (held.right ? 1 : 0) - (held.left ? 1 : 0)
    },
    endFrame() {
      presses.clear()
    },
    attach(target = window) {
      target.addEventListener('keydown', onKeyDown)
      target.addEventListener('keyup', onKeyUp)
      target.addEventListener('blur', reset)
      return () => {
        target.removeEventListener('keydown', onKeyDown)
        target.removeEventListener('keyup', onKeyUp)
        target.removeEventListener('blur', reset)
      }
    },
  }
}
```

`src/engine/loop.js`:
```js
export const STEP = 1 / 60
export const MAX_FRAME = 0.25

export function createLoop({
  update,
  render,
  raf = (f) => requestAnimationFrame(f),
  caf = (id) => cancelAnimationFrame(id),
}) {
  let acc = 0
  let last = null
  let id = null

  function advance(dt) {
    acc += Math.min(Math.max(dt, 0), MAX_FRAME)
    let steps = 0
    while (acc >= STEP - 1e-9) {
      update(STEP)
      acc -= STEP
      steps++
    }
    return steps
  }

  function frame(ts) {
    if (last !== null) advance((ts - last) / 1000)
    last = ts
    render()
    id = raf(frame)
  }

  return {
    advance,
    start() {
      if (id === null) {
        last = null
        id = raf(frame)
      }
    },
    stop() {
      if (id !== null) caf(id)
      id = null
    },
  }
}
```

`src/engine/renderer.js`:
```js
export const VIEW_W = 320
export const VIEW_H = 180

// Integer scale when >= 2x fits (crisp pixels); otherwise fill the space fractionally.
export function computeScale(availW, availH) {
  const fit = Math.min(availW / VIEW_W, availH / VIEW_H)
  if (fit >= 2) return Math.floor(fit)
  return Math.max(Math.floor(fit * 100) / 100, 0.01)
}

export function setupCanvas(canvas) {
  canvas.width = VIEW_W
  canvas.height = VIEW_H
  const ctx = canvas.getContext('2d')
  ctx.imageSmoothingEnabled = false
  return ctx
}
```

`src/engine/camera.js`:
```js
import { VIEW_W } from './renderer.js'

export function clampCamera(x, roomWidth, viewW = VIEW_W) {
  return Math.max(0, Math.min(x, Math.max(0, roomWidth - viewW)))
}

export function followCamera(camX, targetX, roomWidth, dt, viewW = VIEW_W) {
  const desired = clampCamera(targetX - viewW / 2, roomWidth, viewW)
  const k = 1 - Math.exp(-8 * dt)
  return camX + (desired - camX) * k
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npx vitest run src/engine`
Expected: PASS (all engine primitive tests).

- [ ] **Step 5: Commit**

```bash
git add src/engine
git commit -m "Add engine primitives: events, input, loop, scaling, camera"
```

---

### Task 4: Proximity, speech copy, hash routing

**Files:**
- Create: `src/engine/proximity.js`, `src/engine/copy.js`, `src/routing.js`
- Test: `src/engine/proximity.test.js`, `src/engine/copy.test.js`, `src/routing.test.js`

**Interfaces:**
- Produces:
  - `ENTER_RANGE = 20`, `EXIT_RANGE = 28`, `centerOf({x,w})`, `nearestWithin(x, items, range)`, `createProximityTracker({enter, exit}?): { active, update(x, items) → { active, changed }, reset() }`
  - `welcomeText(touch)`, `enterFrameText(label, touch)`, `tileText(label, touch)`, `STARRY_TEXT`
  - `ROOM_IDS = ['hall','about','projects','experience','contact']`, `parseHash(hash) → { room, quick }`, `hashFor(room, quick=false) → string`

- [ ] **Step 1: Write failing tests**

`src/engine/proximity.test.js`:
```js
import { describe, it, expect } from 'vitest'
import { createProximityTracker, nearestWithin } from './proximity.js'

const A = { id: 'a', x: 100, w: 40 } // centre 120
const B = { id: 'b', x: 160, w: 40 } // centre 180

describe('proximity', () => {
  it('finds the nearest item within range', () => {
    expect(nearestWithin(118, [A, B], 20)).toBe(A)
    expect(nearestWithin(150, [A, B], 20)).toBe(null)
  })
  it('activates at enter range and holds until exit range (no boundary flicker)', () => {
    const t = createProximityTracker({ enter: 20, exit: 28 })
    expect(t.update(95, [A]).active).toBe(null)
    const r = t.update(101, [A]); expect(r.active).toBe(A); expect(r.changed).toBe(true)
    expect(t.update(99, [A])).toEqual({ active: A, changed: false }) // 21 away: still active
    expect(t.update(101, [A]).changed).toBe(false)
    expect(t.update(91, [A])).toEqual({ active: null, changed: true }) // 29 away
  })
  it('switches to a strictly nearer item', () => {
    const t = createProximityTracker({ enter: 40, exit: 50 })
    t.update(140, [A, B])
    expect(t.update(165, [A, B]).active).toBe(B)
  })
  it('reset clears the active item', () => {
    const t = createProximityTracker(); t.update(120, [A]); t.reset()
    expect(t.active).toBe(null)
  })
})
```

`src/engine/copy.test.js`:
```js
import { describe, it, expect } from 'vitest'
import { welcomeText, enterFrameText, tileText } from './copy.js'

describe('speech copy', () => {
  it('matches the spec wording on keyboard devices', () => {
    expect(welcomeText(false)).toBe("Hi, I'm Srilekha! Welcome to my gallery ✨ Use ← → to walk, and step up to a painting to go inside.")
    expect(enterFrameText('Projects', false)).toBe('Press Enter to step into Projects!')
    expect(tileText('Experience', false)).toBe('Press Enter to go to Experience!')
  })
  it('uses touch wording on touch devices', () => {
    expect(welcomeText(true)).toContain('Use ◀ ▶ to walk')
    expect(enterFrameText('About', true)).toBe('Tap A to step into About!')
    expect(tileText('Home', true)).toBe('Tap A to go to Home!')
  })
})
```

`src/routing.test.js`:
```js
import { describe, it, expect } from 'vitest'
import { parseHash, hashFor } from './routing.js'

describe('routing', () => {
  it('parses known rooms', () => {
    expect(parseHash('#/projects')).toEqual({ room: 'projects', quick: false })
    expect(parseHash('#/about/')).toEqual({ room: 'about', quick: false })
    expect(parseHash('#/Experience')).toEqual({ room: 'experience', quick: false })
  })
  it('treats empty and unknown hashes as the main hall', () => {
    for (const h of ['', '#', '#/', '#/foo', '#/awards', '#/projects/2', undefined]) {
      expect(parseHash(h)).toEqual({ room: 'hall', quick: false })
    }
  })
  it('recognises the quick view', () => {
    expect(parseHash('#/quick')).toEqual({ room: 'hall', quick: true })
  })
  it('builds hashes', () => {
    expect(hashFor('hall')).toBe('#/')
    expect(hashFor('contact')).toBe('#/contact')
    expect(hashFor('projects', true)).toBe('#/quick')
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run src/engine/proximity.test.js src/engine/copy.test.js src/routing.test.js`
Expected: FAIL — modules not found.

- [ ] **Step 3: Implement**

`src/engine/proximity.js`:
```js
export const ENTER_RANGE = 20
export const EXIT_RANGE = 28

export const centerOf = (item) => item.x + item.w / 2

export function nearestWithin(x, items, range) {
  let best = null
  let bestD = Infinity
  for (const item of items) {
    const d = Math.abs(centerOf(item) - x)
    if (d <= range && d < bestD) {
      best = item
      bestD = d
    }
  }
  return best
}

export function createProximityTracker({ enter = ENTER_RANGE, exit = EXIT_RANGE } = {}) {
  let active = null
  return {
    get active() {
      return active
    },
    update(x, items) {
      const prev = active
      if (active && Math.abs(centerOf(active) - x) > exit) active = null
      const candidate = nearestWithin(x, items, enter)
      if (candidate && (!active || Math.abs(centerOf(candidate) - x) < Math.abs(centerOf(active) - x))) {
        active = candidate
      }
      return { active, changed: prev !== active }
    },
    reset() {
      active = null
    },
  }
}
```

`src/engine/copy.js`:
```js
const walkKeys = (touch) => (touch ? '◀ ▶' : '← →')
const action = (touch) => (touch ? 'Tap A' : 'Press Enter')

export const welcomeText = (touch) =>
  `Hi, I'm Srilekha! Welcome to my gallery ✨ Use ${walkKeys(touch)} to walk, and step up to a painting to go inside.`
export const enterFrameText = (label, touch) => `${action(touch)} to step into ${label}!`
export const tileText = (label, touch) => `${action(touch)} to go to ${label}!`
export const STARRY_TEXT = "It's The Starry Night by Van Gogh — pixel edition!"
```

`src/routing.js`:
```js
export const ROOM_IDS = ['hall', 'about', 'projects', 'experience', 'contact']

export function parseHash(hash) {
  const m = /^#?\/?([a-z]*)\/?$/.exec(String(hash ?? '').toLowerCase())
  const seg = m ? m[1] : null
  if (seg === 'quick') return { room: 'hall', quick: true }
  if (seg && seg !== 'hall' && ROOM_IDS.includes(seg)) return { room: seg, quick: false }
  return { room: 'hall', quick: false }
}

export function hashFor(room, quick = false) {
  if (quick) return '#/quick'
  return room === 'hall' ? '#/' : `#/${room}`
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npx vitest run src/engine/proximity.test.js src/engine/copy.test.js src/routing.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/engine/proximity.js src/engine/proximity.test.js src/engine/copy.js src/engine/copy.test.js src/routing.js src/routing.test.js
git commit -m "Add proximity tracking, speech copy, and hash routing"
```

---

### Task 5: Room layouts from data

**Files:**
- Create: `src/scenes/rooms.js`
- Test: `src/scenes/rooms.test.js`

**Interfaces:**
- Consumes: `VIEW_W` (Task 3); `data.js` exports (Task 2).
- Produces:
  - Constants `WAINSCOT_Y = 120`, `FLOOR_Y = 150`, `AVATAR_FEET_Y = 162`, `TILE_Y = 158`, `TILE_H = 6`.
  - `SECTIONS = [{ id, label, icon }]` for about/projects/experience/contact; `THEMES[roomId] = { wall, wallDark, trim, floor, floorLine, accent }`.
  - `buildRooms(data) → { hall, about, projects, experience, contact }`, each a **Room**:
    `{ id, label, theme, width, spawnX, frames: Frame[], tiles: Tile[] }`
  - **Frame**: `{ id, kind: 'starry'|'section'|'item', label, x, y, w, h, target?, cover?, thumb?, card? }`
    - `thumb`: `{ type: 'image', src } | { type: 'monogram', text, color } | { type: 'icon', icon }`
    - `card`: `{ title, subtitle, meta, body: string[], bullets: string[], tags: string[], links: {href,label}[], image: string|null }`
  - **Tile**: `{ id, target, label, icon, x, w }`

- [ ] **Step 1: Write the failing test** — `src/scenes/rooms.test.js`:

```js
import { describe, it, expect } from 'vitest'
import * as data from '../data.js'
import { buildRooms, SECTIONS } from './rooms.js'

const rooms = buildRooms(data)
const sectionIds = SECTIONS.map((s) => s.id)

describe('rooms', () => {
  it('main hall has the five frames in spec order and no tiles', () => {
    expect(rooms.hall.frames.map((f) => f.id)).toEqual(['starry', 'about', 'projects', 'experience', 'contact'])
    expect(rooms.hall.tiles).toEqual([])
    const [starry, about] = rooms.hall.frames
    expect(starry.w).toBeLessThan(about.w)
    expect(starry.h).toBeLessThan(about.h)
    for (const f of rooms.hall.frames.slice(1)) expect(f.target).toBe(f.id)
  })
  it('has one frame per project and per experience entry', () => {
    expect(rooms.projects.frames).toHaveLength(data.projects.length)
    expect(rooms.experience.frames).toHaveLength(data.experience.length)
    expect(rooms.about.frames.map((f) => f.id)).toEqual(['about-me', 'about-education', 'about-skills', 'about-interests'])
    expect(rooms.contact.frames.map((f) => f.id)).toEqual(['contact-email', 'contact-github', 'contact-linkedin'])
  })
  it('every section room ends with Home + the other three sections', () => {
    for (const id of sectionIds) {
      const room = rooms[id]
      const targets = room.tiles.map((t) => t.target)
      expect(targets[0]).toBe('hall')
      expect(targets).toHaveLength(4)
      expect(targets).not.toContain(id)
      expect(new Set(targets)).toEqual(new Set(['hall', ...sectionIds.filter((s) => s !== id)]))
      const lastFrame = room.frames.at(-1)
      expect(room.tiles[0].x).toBeGreaterThan(lastFrame.x + lastFrame.w)
      expect(room.width).toBeGreaterThanOrEqual(room.tiles.at(-1).x + room.tiles.at(-1).w)
    }
  })
  it('frames never overlap and are sorted left to right', () => {
    for (const room of Object.values(rooms)) {
      room.frames.forEach((f, i) => {
        if (i > 0) expect(f.x).toBeGreaterThanOrEqual(room.frames[i - 1].x + room.frames[i - 1].w)
      })
    }
  })
  it('item frames carry complete cards', () => {
    for (const id of sectionIds) {
      for (const f of rooms[id].frames) {
        expect(f.kind).toBe('item')
        expect(f.card.title).toBeTruthy()
        for (const k of ['body', 'bullets', 'tags', 'links']) expect(Array.isArray(f.card[k])).toBe(true)
      }
    }
  })
  it('experience cards show role, location and dates', () => {
    const disney = rooms.experience.frames[0].card
    expect(disney.title).toBe('Disney Streaming')
    expect(disney.subtitle).toBe('Software Engineering Intern')
    expect(disney.meta).toBe('Santa Monica, CA · June 2026 – August 2026')
    const hof = rooms.experience.frames.find((f) => f.id === 'exp-hof').card
    expect(hof.meta).toBe('September 2026 – Present')
  })
  it('contact links use the profile values', () => {
    const [email, gh, li] = rooms.contact.frames.map((f) => f.card.links[0].href)
    expect(email).toBe(`mailto:${data.profile.email}`)
    expect(gh).toBe(data.profile.social.github)
    expect(li).toBe(data.profile.social.linkedin)
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run src/scenes/rooms.test.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement** — `src/scenes/rooms.js`:

```js
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
      card: card({ title: 'LinkedIn', body: ["Let's connect!"], links: [{ href: profile.social.linkedin, label: 'linkedin.com/in/srilekha-mamidala' }] }),
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
```

- [ ] **Step 4: Run to verify pass**

Run: `npx vitest run src/scenes/rooms.test.js`
Expected: PASS (7 tests).

- [ ] **Step 5: Commit**

```bash
git add src/scenes/rooms.js src/scenes/rooms.test.js
git commit -m "Build gallery room layouts from content data"
```

---

### Task 6: Pixel sprites — avatar, icons, frames, tiles

**Files:**
- Create: `src/engine/sprites/pixelArt.js`, `src/engine/sprites/avatar.js`, `src/engine/sprites/icons.js`, `src/engine/sprites/frame.js`, `src/engine/sprites/tiles.js`
- Test: `src/engine/sprites/sprites.test.js`

**Interfaces:**
- Produces:
  - `drawPixelArt(ctx, rows: string[], palette: Record<char,color>, x, y, { flip=false, scale=1 }?)` — `.` and unknown chars are transparent.
  - `AVATAR_W = 16`, `AVATAR_H = 24`, `AVATAR_PALETTE`, `AVATAR_FRAMES = { idle, blink, walkA, walkB }`, `avatarFrame({ walking, animT }) → { rows, yOffset }`
  - `ICONS: Record<'house'|'person'|'laptop'|'briefcase'|'envelope'|'book'|'star'|'heart'|'code'|'link', string[]>` (8×8), `drawIcon(ctx, name, x, y, color, scale=1)`
  - `drawFrame(ctx, x, y, w, h, borderScale=1)` (3px gold frame; inner area is `x+3, y+3, w-6, h-6`), `drawNameplate(ctx, cx, y, text)`
  - `drawTile(ctx, x, y, w, h, t, active, accent)`

- [ ] **Step 1: Write the failing test** — `src/engine/sprites/sprites.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { stubCtx } from '../../test/stubCtx.js'
import { drawPixelArt } from './pixelArt.js'
import { AVATAR_FRAMES, AVATAR_PALETTE, AVATAR_W, AVATAR_H, avatarFrame } from './avatar.js'
import { ICONS, drawIcon } from './icons.js'

const fillRects = (ctx) => ctx.calls.filter((c) => c[0] === 'fillRect')

describe('pixel art', () => {
  it('draws one rect per opaque pixel and mirrors when flipped', () => {
    const ctx = stubCtx()
    drawPixelArt(ctx, ['x.', '..'], { x: '#fff' }, 10, 20)
    expect(fillRects(ctx)).toEqual([['fillRect', 10, 20, 1, 1]])
    const f = stubCtx()
    drawPixelArt(f, ['x.', '..'], { x: '#fff' }, 10, 20, { flip: true, scale: 2 })
    expect(fillRects(f)).toEqual([['fillRect', 12, 20, 2, 2]])
  })
})

describe('avatar', () => {
  it('every frame is 16x24 and uses only palette colours', () => {
    for (const [name, rows] of Object.entries(AVATAR_FRAMES)) {
      expect(rows, name).toHaveLength(AVATAR_H)
      for (const row of rows) {
        expect(row.length, `${name}: "${row}"`).toBe(AVATAR_W)
        for (const ch of row) expect(ch === '.' || ch in AVATAR_PALETTE, `${name} char ${ch}`).toBe(true)
      }
    }
  })
  it('has glasses, maroon hoodie, black hair and skin colours', () => {
    expect(AVATAR_PALETTE.m.toLowerCase()).toBe('#8a1f2b')
    for (const k of ['k', 's', 'g', 'm']) expect(AVATAR_PALETTE[k]).toBeTruthy()
  })
  it('cycles through distinct walk frames with a bob', () => {
    const seen = new Set()
    const offsets = new Set()
    for (let t = 0; t < 0.5; t += 0.05) {
      const f = avatarFrame({ walking: true, animT: t })
      seen.add(f.rows); offsets.add(f.yOffset)
    }
    expect(seen.size).toBe(2)
    expect(offsets).toEqual(new Set([0, -1]))
  })
  it('idles and occasionally blinks', () => {
    expect(avatarFrame({ walking: false, animT: 0.5 }).rows).toBe(AVATAR_FRAMES.idle)
    expect(avatarFrame({ walking: false, animT: 2.9 }).rows).toBe(AVATAR_FRAMES.blink)
  })
})

describe('icons', () => {
  it('are all 8x8', () => {
    for (const [name, rows] of Object.entries(ICONS)) {
      expect(rows, name).toHaveLength(8)
      for (const r of rows) expect(r.length, name).toBe(8)
    }
  })
  it('drawIcon ignores unknown names', () => {
    const ctx = stubCtx()
    expect(() => drawIcon(ctx, 'nope', 0, 0, '#fff')).not.toThrow()
    expect(fillRects(ctx)).toHaveLength(0)
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run src/engine/sprites`
Expected: FAIL — modules not found.

- [ ] **Step 3: Implement**

`src/engine/sprites/pixelArt.js`:
```js
export function drawPixelArt(ctx, rows, palette, x, y, { flip = false, scale = 1 } = {}) {
  const w = rows[0]?.length ?? 0
  const ox = Math.round(x)
  const oy = Math.round(y)
  for (let r = 0; r < rows.length; r++) {
    const row = rows[r]
    for (let c = 0; c < w; c++) {
      const color = palette[row[c]]
      if (!color) continue
      const cx = flip ? w - 1 - c : c
      ctx.fillStyle = color
      ctx.fillRect(ox + cx * scale, oy + r * scale, scale, scale)
    }
  }
}
```

`src/engine/sprites/avatar.js`:
```js
// Chibi Srilekha: mid-length black hair, light brown skin, glasses, maroon MIT hoodie.
export const AVATAR_W = 16
export const AVATAR_H = 24

export const AVATAR_PALETTE = {
  k: '#1b1b24', // hair
  s: '#c68e5e', // skin
  g: '#2a2a2a', // glasses frame
  e: '#1b1b24', // eyes
  p: '#e38a8a', // blush
  r: '#9c4a4a', // mouth
  m: '#8a1f2b', // hoodie
  M: '#5e1420', // hoodie shadow
  W: '#e9e3d9', // MIT logo
  j: '#34466b', // jeans
  b: '#2b2b2b', // shoes
}

const HEAD_OPEN = [
  '.....kkkkkk.....',
  '...kkkkkkkkkk...',
  '..kkkkkkkkkkkk..',
  '..kkkkssssskkk..',
  '..kkssssssssskk.',
  '.kkkgggsgggsskk.',
  '.kkkgegsgegsskk.',
  '.kkkgggsgggsskk.',
  '.kkksspsssspskk.',
  '.kkkssssrsssskk.',
  '.kkkkssssssskkk.',
  '.kkkkkmmmmmkkkk.',
]
const HEAD_BLINK = HEAD_OPEN.map((row, i) => (i === 6 ? '.kkkgggsgggsskk.' : row))
const BODY = [
  '.kkkmmmmmmmmmkk.',
  '..kmmmmmmmmmmmk.',
  '..mmmmWWWWmmmm..',
  '..mmmmWWWWmmmm..',
  '..mmmmmmmmmmmm..',
  '..smmmmmmmmmms..',
  '...MMMMMMMMMM...',
  '...jjjjjjjjjj...',
]
const LEGS_STAND = ['...jjjj..jjjj...', '...jjjj..jjjj...', '...jjjj..jjjj...', '...bbbb..bbbb...']
const LEGS_STRIDE = ['...jjjj..jjjj...', '..jjjj....jjjj..', '..jjj......jjj..', '..bbb......bbb..']
const LEGS_PASS = ['....jjjjjjjj....', '.....jjjjjj.....', '.....jjj.jj.....', '.....bbb.bb.....']

export const AVATAR_FRAMES = {
  idle: [...HEAD_OPEN, ...BODY, ...LEGS_STAND],
  blink: [...HEAD_BLINK, ...BODY, ...LEGS_STAND],
  walkA: [...HEAD_OPEN, ...BODY, ...LEGS_STRIDE],
  walkB: [...HEAD_OPEN, ...BODY, ...LEGS_PASS],
}

const WALK_CYCLE = ['walkA', 'walkB', 'walkA', 'walkB']
const WALK_FPS = 8

export function avatarFrame({ walking, animT }) {
  if (walking) {
    const i = Math.floor(animT * WALK_FPS) % WALK_CYCLE.length
    return { rows: AVATAR_FRAMES[WALK_CYCLE[i]], yOffset: i % 2 ? -1 : 0 }
  }
  const blinking = animT % 3 > 2.85
  return { rows: blinking ? AVATAR_FRAMES.blink : AVATAR_FRAMES.idle, yOffset: 0 }
}
```

`src/engine/sprites/icons.js`:
```js
import { drawPixelArt } from './pixelArt.js'

export const ICONS = {
  house: ['...xx...', '..xxxx..', '.xxxxxx.', 'xxxxxxxx', '.x....x.', '.x.xx.x.', '.x.xx.x.', '.xxxxxx.'],
  person: ['..xxxx..', '..xxxx..', '..xxxx..', '...xx...', '.xxxxxx.', 'x.xxxx.x', '..x..x..', '..x..x..'],
  laptop: ['.xxxxxx.', '.x....x.', '.x....x.', '.x....x.', '.xxxxxx.', 'xxxxxxxx', 'xxxxxxxx', '........'],
  briefcase: ['..xxxx..', '..x..x..', 'xxxxxxxx', 'x......x', 'xxxxxxxx', 'x......x', 'x......x', 'xxxxxxxx'],
  envelope: ['........', 'xxxxxxxx', 'xx....xx', 'x.x..x.x', 'x..xx..x', 'x......x', 'xxxxxxxx', '........'],
  book: ['xxx..xxx', 'x.xxxx.x', 'x.x..x.x', 'x.x..x.x', 'x.x..x.x', 'x.xxxx.x', 'xxx..xxx', '........'],
  star: ['...xx...', '...xx...', 'xxxxxxxx', '.xxxxxx.', '..xxxx..', '.xx..xx.', 'xx....xx', '........'],
  heart: ['.xx..xx.', 'xxxxxxxx', 'xxxxxxxx', 'xxxxxxxx', '.xxxxxx.', '..xxxx..', '...xx...', '........'],
  code: ['........', '....x...', '..x.xx..', '.x..x.x.', 'x..x...x', '.x.x..x.', '..xx.x..', '...x....'],
  link: ['........', 'xxxx....', 'x..x....', 'x..xxxxx', 'xxxx...x', '...x...x', '...xxxxx', '........'],
}

export function drawIcon(ctx, name, x, y, color, scale = 1) {
  const rows = ICONS[name]
  if (!rows) return
  drawPixelArt(ctx, rows, { x: color }, x, y, { scale })
}
```

`src/engine/sprites/frame.js`:
```js
const GOLD = '#d4a93a'
const GOLD_LIGHT = '#f2d27a'
const GOLD_DARK = '#8a6420'

// Gold picture frame. The drawable inner area is (x+3, y+3, w-6, h-6).
export function drawFrame(ctx, x, y, w, h, borderScale = 1) {
  const b = Math.max(1, Math.round(3 * borderScale))
  ctx.fillStyle = 'rgba(0,0,0,0.35)'
  ctx.fillRect(x + 2, y + 2, w, h) // drop shadow on the wall
  ctx.fillStyle = GOLD_DARK
  ctx.fillRect(x, y, w, h)
  ctx.fillStyle = GOLD
  ctx.fillRect(x + 1, y + 1, w - 2, h - 2)
  ctx.fillStyle = GOLD_LIGHT
  ctx.fillRect(x + 1, y + 1, w - 2, 1)
  ctx.fillRect(x + 1, y + 1, 1, h - 2)
  ctx.fillStyle = GOLD_DARK
  ctx.fillRect(x + b - 1, y + b - 1, w - 2 * b + 2, h - 2 * b + 2)
}

export function drawNameplate(ctx, cx, y, text) {
  ctx.font = '8px "Press Start 2P"'
  const w = Math.ceil(ctx.measureText(text).width) + 6
  const x = Math.round(cx - w / 2)
  ctx.fillStyle = GOLD_DARK
  ctx.fillRect(x, y, w, 11)
  ctx.fillStyle = GOLD
  ctx.fillRect(x + 1, y + 1, w - 2, 9)
  ctx.fillStyle = '#3a2a10'
  ctx.textBaseline = 'top'
  ctx.fillText(text, x + 3, y + 2)
}
```

`src/engine/sprites/tiles.js`:
```js
// Glowing portal floor tile; brighter pulse while the avatar stands on it.
export function drawTile(ctx, x, y, w, h, t, active, accent) {
  const pulse = 0.5 + 0.5 * Math.sin(t * (active ? 8 : 3))
  ctx.fillStyle = '#1a1426'
  ctx.fillRect(x, y, w, h)
  ctx.globalAlpha = (active ? 0.6 : 0.3) + 0.3 * pulse
  ctx.fillStyle = accent
  ctx.fillRect(x + 1, y + 1, w - 2, h - 2)
  ctx.globalAlpha = 1
  ctx.fillStyle = '#ffffff'
  const sparkleX = x + 1 + Math.floor(((t * 12) % (w - 2)))
  ctx.fillRect(sparkleX, y + 1, 1, 1)
  if (active) {
    ctx.globalAlpha = 0.25 * pulse
    ctx.fillStyle = accent
    ctx.fillRect(x - 2, y - 14, w + 4, 14) // light beam
    ctx.globalAlpha = 1
  }
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npx vitest run src/engine/sprites`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/engine/sprites
git commit -m "Add pixel sprites: avatar, icons, frames, portal tiles"
```

---

### Task 7: Walkable room logic (HallScene) and spawn points

**Files:**
- Create: `src/scenes/hallScene.js`, `src/scenes/spawn.js`
- Test: `src/scenes/hallScene.test.js`, `src/scenes/spawn.test.js`

**Interfaces:**
- Consumes: `createProximityTracker` (Task 4); Room/Frame/Tile shapes (Task 5).
- Produces:
  - `WALK_SPEED = 64`, `AVATAR_MARGIN = 10`
  - `createHallScene(room, { spawnX?, facing? }?) → { room, avatar: { x, facing, walking, animT }, update(dt, input) → SceneEvent[], walkTo(worldX), activeFrame, activeTile }`
  - **SceneEvent**: `{type:'firstMove'} | {type:'frame', frame: Frame|null} | {type:'tile', tile: Tile|null} | {type:'go', target: roomId, origin: Frame|Tile}`
  - `input` is any object with `direction()` and `consume(action)` (the Task 3 input satisfies this).
  - `spawnFor(fromRoomId, toRoom) → { x, facing }`

- [ ] **Step 1: Write failing tests**

`src/scenes/hallScene.test.js`:
```js
import { describe, it, expect } from 'vitest'
import { createHallScene, WALK_SPEED, AVATAR_MARGIN } from './hallScene.js'

const fakeInput = ({ dir = 0, presses = [] } = {}) => {
  const p = new Set(presses)
  return { direction: () => dir, consume: (a) => p.delete(a) }
}
const room = {
  id: 'hall', width: 400, spawnX: 50,
  frames: [
    { id: 'starry', kind: 'starry', x: 60, w: 38 },
    { id: 'about', kind: 'section', target: 'about', x: 200, w: 56 }, // centre 228
  ],
  tiles: [],
}
const sectionRoom = {
  id: 'about', width: 400, spawnX: 24,
  frames: [{ id: 'about-me', kind: 'item', x: 70, w: 48, card: { title: 'Me' } }], // centre 94
  tiles: [{ id: 'tile-hall', target: 'hall', x: 300, w: 24 }], // centre 312
}

describe('hallScene', () => {
  it('walks at WALK_SPEED and faces the walking direction', () => {
    const s = createHallScene(room)
    s.update(0.5, fakeInput({ dir: 1 }))
    expect(s.avatar.x).toBeCloseTo(50 + WALK_SPEED * 0.5)
    expect(s.avatar.facing).toBe(1)
    expect(s.avatar.walking).toBe(true)
    s.update(0.1, fakeInput({ dir: -1 }))
    expect(s.avatar.facing).toBe(-1)
  })
  it('stays inside the room', () => {
    const s = createHallScene(room)
    for (let i = 0; i < 100; i++) s.update(0.1, fakeInput({ dir: -1 }))
    expect(s.avatar.x).toBe(AVATAR_MARGIN)
    for (let i = 0; i < 100; i++) s.update(0.1, fakeInput({ dir: 1 }))
    expect(s.avatar.x).toBe(room.width - AVATAR_MARGIN)
  })
  it('emits firstMove exactly once', () => {
    const s = createHallScene(room)
    const a = s.update(0.1, fakeInput({ dir: 1 }))
    const b = s.update(0.1, fakeInput({ dir: 1 }))
    expect(a.filter((e) => e.type === 'firstMove')).toHaveLength(1)
    expect(b.filter((e) => e.type === 'firstMove')).toHaveLength(0)
  })
  it('emits frame events on enter and leave only', () => {
    const s = createHallScene(room, { spawnX: 228 })
    expect(s.update(0.016, fakeInput())).toContainEqual({ type: 'frame', frame: room.frames[1] })
    expect(s.update(0.016, fakeInput()).some((e) => e.type === 'frame')).toBe(false)
    s.walkTo(330)
    let evs = []
    for (let i = 0; i < 200; i++) evs = evs.concat(s.update(0.016, fakeInput()))
    expect(evs).toContainEqual({ type: 'frame', frame: null })
  })
  it('Enter near a section frame requests travel to it', () => {
    const s = createHallScene(room, { spawnX: 228 })
    s.update(0.016, fakeInput())
    const evs = s.update(0.016, fakeInput({ presses: ['interact'] }))
    expect(evs).toContainEqual({ type: 'go', target: 'about', origin: room.frames[1] })
  })
  it('Enter near an item frame or the Starry Night does nothing', () => {
    const s = createHallScene(room, { spawnX: 79 })
    s.update(0.016, fakeInput())
    expect(s.update(0.016, fakeInput({ presses: ['interact'] })).some((e) => e.type === 'go')).toBe(false)
  })
  it('Enter on a portal tile travels to its target', () => {
    const s = createHallScene(sectionRoom, { spawnX: 312 })
    expect(s.update(0.016, fakeInput())).toContainEqual({ type: 'tile', tile: sectionRoom.tiles[0] })
    expect(s.update(0.016, fakeInput({ presses: ['interact'] }))).toContainEqual({ type: 'go', target: 'hall', origin: sectionRoom.tiles[0] })
  })
  it('walkTo arrives exactly and stops without oscillating', () => {
    const s = createHallScene(room)
    s.walkTo(120)
    for (let i = 0; i < 120; i++) s.update(1 / 60, fakeInput())
    expect(s.avatar.x).toBe(120)
    expect(s.avatar.walking).toBe(false)
  })
  it('keyboard input cancels a walkTo target', () => {
    const s = createHallScene(room)
    s.walkTo(300)
    s.update(0.1, fakeInput({ dir: -1 }))
    for (let i = 0; i < 10; i++) s.update(0.1, fakeInput())
    expect(s.avatar.x).toBeLessThan(50)
  })
})
```

`src/scenes/spawn.test.js`:
```js
import { describe, it, expect } from 'vitest'
import * as data from '../data.js'
import { buildRooms } from './rooms.js'
import { spawnFor } from './spawn.js'

const rooms = buildRooms(data)

describe('spawnFor', () => {
  it('returning home puts the avatar in front of the room you left', () => {
    const f = rooms.hall.frames.find((x) => x.id === 'projects')
    expect(spawnFor('projects', rooms.hall)).toEqual({ x: f.x + f.w / 2, facing: 1 })
  })
  it('entering a section starts at its entrance', () => {
    expect(spawnFor('hall', rooms.about)).toEqual({ x: rooms.about.spawnX, facing: 1 })
    expect(spawnFor('projects', rooms.contact)).toEqual({ x: rooms.contact.spawnX, facing: 1 })
  })
  it('falls back to the room spawn for unknown origins', () => {
    expect(spawnFor('nowhere', rooms.hall)).toEqual({ x: rooms.hall.spawnX, facing: 1 })
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run src/scenes/hallScene.test.js src/scenes/spawn.test.js`
Expected: FAIL — modules not found.

- [ ] **Step 3: Implement**

`src/scenes/hallScene.js`:
```js
import { createProximityTracker } from '../engine/proximity.js'

export const WALK_SPEED = 64
export const AVATAR_MARGIN = 10

export function createHallScene(room, { spawnX = room.spawnX, facing = 1 } = {}) {
  const frameTracker = createProximityTracker()
  const tileTracker = createProximityTracker({ enter: 10, exit: 14 })
  const clampX = (x) => Math.max(AVATAR_MARGIN, Math.min(room.width - AVATAR_MARGIN, x))
  const avatar = { x: clampX(spawnX), facing, walking: false, animT: 0 }
  let walkTarget = null
  let hasMoved = false

  function update(dt, input) {
    const events = []
    let dir = input.direction()
    if (dir !== 0) {
      walkTarget = null
    } else if (walkTarget !== null) {
      const d = walkTarget - avatar.x
      if (Math.abs(d) <= WALK_SPEED * dt) {
        avatar.x = walkTarget
        walkTarget = null
      } else {
        dir = Math.sign(d)
      }
    }

    avatar.walking = dir !== 0
    if (dir !== 0) {
      avatar.facing = dir
      avatar.x = clampX(avatar.x + dir * WALK_SPEED * dt)
      if (!hasMoved) {
        hasMoved = true
        events.push({ type: 'firstMove' })
      }
    }
    avatar.animT += dt

    const f = frameTracker.update(avatar.x, room.frames)
    if (f.changed) events.push({ type: 'frame', frame: f.active })
    const t = tileTracker.update(avatar.x, room.tiles)
    if (t.changed) events.push({ type: 'tile', tile: t.active })

    if (input.consume('interact')) {
      if (tileTracker.active) {
        events.push({ type: 'go', target: tileTracker.active.target, origin: tileTracker.active })
      } else if (frameTracker.active?.target) {
        events.push({ type: 'go', target: frameTracker.active.target, origin: frameTracker.active })
      }
    }
    return events
  }

  return {
    room,
    avatar,
    update,
    walkTo(x) {
      walkTarget = clampX(x)
    },
    get activeFrame() {
      return frameTracker.active
    },
    get activeTile() {
      return tileTracker.active
    },
  }
}
```

`src/scenes/spawn.js`:
```js
// Where the avatar appears after a room change.
export function spawnFor(fromRoomId, toRoom) {
  if (toRoom.id === 'hall') {
    const frame = toRoom.frames.find((f) => f.target === fromRoomId)
    if (frame) return { x: frame.x + frame.w / 2, facing: 1 }
  }
  return { x: toRoom.spawnX, facing: 1 }
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npx vitest run src/scenes`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/scenes/hallScene.js src/scenes/hallScene.test.js src/scenes/spawn.js src/scenes/spawn.test.js
git commit -m "Add walkable room logic with proximity events and spawn points"
```

---

### Task 8: Director — intro, play, and transition state machine

**Files:**
- Create: `src/engine/director.js`
- Test: `src/engine/director.test.js`

**Interfaces:**
- Produces:
  - `INTRO = { reveal: 3.5, welcome: 0.8, hold: 0.8, zoom: 1.4 }`, `REDUCED_INTRO = 0.8`, `DURATIONS = { ripple:{out,in}, fold:{out,in}, crossfade:{out,in} }`
  - `introPhase(t, reduced=false) → { phase: 'reveal'|'welcome'|'hold'|'zoom'|'fade'|'done', p: 0..1 }`
  - `pickTransition(from, to, { reducedMotion?, kind? }) → 'ripple'|'fold'|'crossfade'`
  - `createDirector({ room, playIntro, reducedMotion }) → { state, request(to, { kind?, origin? }?) → boolean, tick(dt) → DirectorEvent[], skipIntro() → DirectorEvent[], replayIntro() → boolean, progress() → 0..1 }`
  - `state = { mode: 'intro'|'play'|'transition', room, t, transition: { kind, from, to, phase: 'out'|'in', t, origin } | null }`
  - **DirectorEvent**: `{type:'introDone'} | {type:'roomChanged', room, from, kind} | {type:'transitionDone', room}`

- [ ] **Step 1: Write the failing test** — `src/engine/director.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { createDirector, introPhase, pickTransition, INTRO, DURATIONS } from './director.js'

const run = (d, seconds, dt = 1 / 60) => {
  const events = []
  for (let t = 0; t < seconds; t += dt) events.push(...d.tick(dt))
  return events
}

describe('introPhase', () => {
  it('walks through reveal → welcome → hold → zoom → done', () => {
    expect(introPhase(0).phase).toBe('reveal')
    expect(introPhase(INTRO.reveal + 0.1).phase).toBe('welcome')
    expect(introPhase(INTRO.reveal + INTRO.welcome + 0.1).phase).toBe('hold')
    expect(introPhase(INTRO.reveal + INTRO.welcome + INTRO.hold + 0.1).phase).toBe('zoom')
    expect(introPhase(100)).toEqual({ phase: 'done', p: 1 })
    expect(introPhase(INTRO.reveal / 2).p).toBeCloseTo(0.5)
  })
  it('is a short fade under reduced motion', () => {
    expect(introPhase(0.4, true)).toEqual({ phase: 'fade', p: 0.5 })
    expect(introPhase(0.8, true).phase).toBe('done')
  })
})

describe('pickTransition', () => {
  it('folds when returning home, ripples otherwise', () => {
    expect(pickTransition('projects', 'hall')).toBe('fold')
    expect(pickTransition('hall', 'projects')).toBe('ripple')
    expect(pickTransition('about', 'contact')).toBe('ripple')
  })
  it('honours explicit kinds and reduced motion', () => {
    expect(pickTransition('hall', 'about', { kind: 'crossfade' })).toBe('crossfade')
    expect(pickTransition('about', 'hall', { reducedMotion: true })).toBe('crossfade')
  })
})

describe('director', () => {
  it('intro ends in play with one introDone', () => {
    const d = createDirector({ room: 'hall', playIntro: true })
    const evs = run(d, 7)
    expect(evs.filter((e) => e.type === 'introDone')).toHaveLength(1)
    expect(d.state.mode).toBe('play')
  })
  it('skipIntro jumps straight to play', () => {
    const d = createDirector({ room: 'hall', playIntro: true })
    expect(d.skipIntro()).toEqual([{ type: 'introDone' }])
    expect(d.state.mode).toBe('play')
    expect(d.skipIntro()).toEqual([])
  })
  it('refuses navigation during the intro', () => {
    const d = createDirector({ room: 'hall', playIntro: true })
    expect(d.request('about')).toBe(false)
  })
  it('switches rooms exactly once, halfway through the transition', () => {
    const d = createDirector({ room: 'hall' })
    expect(d.request('about', { origin: { x: 1, y: 2 } })).toBe(true)
    expect(d.state.transition.origin).toEqual({ x: 1, y: 2 })
    const evs = run(d, DURATIONS.ripple.out + DURATIONS.ripple.in + 0.1)
    expect(evs.filter((e) => e.type === 'roomChanged')).toEqual([{ type: 'roomChanged', room: 'about', from: 'hall', kind: 'ripple' }])
    expect(evs.at(-1)).toEqual({ type: 'transitionDone', room: 'about' })
    expect(d.state).toMatchObject({ mode: 'play', room: 'about', transition: null })
  })
  it('ignores repeated requests while a transition is running', () => {
    const d = createDirector({ room: 'hall' })
    d.request('about')
    expect(d.request('projects')).toBe(false)
    run(d, 2)
    expect(d.state.room).toBe('about')
  })
  it('ignores a request for the current room', () => {
    expect(createDirector({ room: 'about' }).request('about')).toBe(false)
  })
  it('progress runs 0 → 1 within each phase', () => {
    const d = createDirector({ room: 'hall' })
    d.request('about')
    d.tick(DURATIONS.ripple.out / 2)
    expect(d.progress()).toBeCloseTo(0.5)
  })
  it('replayIntro only from play, and resets to the hall', () => {
    const d = createDirector({ room: 'projects' })
    expect(d.replayIntro()).toBe(true)
    expect(d.state).toMatchObject({ mode: 'intro', room: 'hall', t: 0 })
    expect(d.replayIntro()).toBe(false)
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run src/engine/director.test.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement** — `src/engine/director.js`:

```js
export const INTRO = { reveal: 3.5, welcome: 0.8, hold: 0.8, zoom: 1.4 }
export const REDUCED_INTRO = 0.8
export const DURATIONS = {
  ripple: { out: 0.9, in: 0.5 },
  fold: { out: 0.9, in: 0.7 },
  crossfade: { out: 0.25, in: 0.25 },
}
const INTRO_ORDER = ['reveal', 'welcome', 'hold', 'zoom']

export function introPhase(t, reduced = false) {
  if (reduced) return t >= REDUCED_INTRO ? { phase: 'done', p: 1 } : { phase: 'fade', p: t / REDUCED_INTRO }
  let start = 0
  for (const phase of INTRO_ORDER) {
    const d = INTRO[phase]
    if (t < start + d) return { phase, p: (t - start) / d }
    start += d
  }
  return { phase: 'done', p: 1 }
}

export function pickTransition(from, to, { reducedMotion = false, kind } = {}) {
  if (reducedMotion) return 'crossfade'
  if (kind) return kind
  return to === 'hall' && from !== 'hall' ? 'fold' : 'ripple'
}

export function createDirector({ room = 'hall', playIntro = false, reducedMotion = false } = {}) {
  const state = { mode: playIntro ? 'intro' : 'play', room, t: 0, transition: null }

  function request(to, { kind, origin = null } = {}) {
    if (state.mode !== 'play' || to === state.room) return false
    state.transition = {
      kind: pickTransition(state.room, to, { reducedMotion, kind }),
      from: state.room,
      to,
      phase: 'out',
      t: 0,
      origin,
    }
    state.mode = 'transition'
    return true
  }

  function tick(dt) {
    const events = []
    if (state.mode === 'intro') {
      state.t += dt
      if (introPhase(state.t, reducedMotion).phase === 'done') {
        state.mode = 'play'
        events.push({ type: 'introDone' })
      }
    } else if (state.mode === 'transition') {
      const tr = state.transition
      const dur = DURATIONS[tr.kind]
      tr.t += dt
      if (tr.phase === 'out' && tr.t >= dur.out) {
        tr.phase = 'in'
        tr.t = 0
        state.room = tr.to
        events.push({ type: 'roomChanged', room: tr.to, from: tr.from, kind: tr.kind })
      } else if (tr.phase === 'in' && tr.t >= dur.in) {
        state.transition = null
        state.mode = 'play'
        events.push({ type: 'transitionDone', room: state.room })
      }
    }
    return events
  }

  return {
    state,
    request,
    tick,
    skipIntro() {
      if (state.mode !== 'intro') return []
      state.mode = 'play'
      return [{ type: 'introDone' }]
    },
    replayIntro() {
      if (state.mode !== 'play') return false
      state.mode = 'intro'
      state.t = 0
      state.room = 'hall'
      return true
    },
    progress() {
      const tr = state.transition
      if (!tr) return 0
      return Math.min(1, tr.t / DURATIONS[tr.kind][tr.phase])
    },
  }
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npx vitest run src/engine/director.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/engine/director.js src/engine/director.test.js
git commit -m "Add director state machine for intro and room transitions"
```

---

### Task 9: Effect math — reveal order, zoom, ripple, fold, fade

**Files:**
- Create: `src/engine/rng.js`, `src/engine/effects/tween.js`, `src/engine/effects/reveal.js`, `src/engine/effects/ripple.js`, `src/engine/effects/fold.js`, `src/engine/effects/fade.js`
- Test: `src/engine/effects/effects.test.js`

**Interfaces:**
- Produces:
  - `mulberry32(seed) → () => number in [0,1)`
  - `clamp01(p)`, `lerp(a,b,p)`, `easeInOut(p)`, `lerpRect(a, b, p)` (rects are `{x,y,w,h}`)
  - `revealOrder(regions: Uint8Array, rng, groundDelay=0.6) → Uint32Array` (permutation; region 0 = sky, 1 = ground); `revealCount(p, total) → int`
  - `rippleAmplitude(p)`, `rippleFlash(p)`, `zoomScale(p)`, `applyRipple(src, dst, w, h, cx, cy, p)` (RGBA `Uint8ClampedArray`s)
  - `foldRect(p, screen, target)`, `settleScale(p)`, `makeDust(count, rng) → Particle[]`, `dustAt(particle, p, rect) → { x, y, alpha }`
  - `fadeAlpha(phase: 'out'|'in', p) → 0..1` (opacity of a black overlay)

- [ ] **Step 1: Write the failing test** — `src/engine/effects/effects.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import { lerpRect, easeInOut } from './tween.js'
import { revealOrder, revealCount } from './reveal.js'
import { applyRipple, rippleFlash, rippleAmplitude, zoomScale } from './ripple.js'
import { foldRect, settleScale, makeDust, dustAt } from './fold.js'
import { fadeAlpha } from './fade.js'

describe('rng', () => {
  it('is deterministic per seed and in [0,1)', () => {
    const a = mulberry32(7), b = mulberry32(7)
    for (let i = 0; i < 100; i++) {
      const v = a(); expect(v).toBe(b()); expect(v).toBeGreaterThanOrEqual(0); expect(v).toBeLessThan(1)
    }
  })
})

describe('tween', () => {
  it('lerpRect hits both endpoints', () => {
    const a = { x: 0, y: 0, w: 10, h: 10 }, b = { x: 100, y: 50, w: 20, h: 30 }
    expect(lerpRect(a, b, 0)).toEqual(a)
    expect(lerpRect(a, b, 1)).toEqual(b)
    expect(easeInOut(0.5)).toBeCloseTo(0.5)
  })
})

describe('reveal', () => {
  const regions = new Uint8Array(2000).map((_, i) => (i < 1000 ? 0 : 1))
  const order = revealOrder(regions, mulberry32(1))
  it('is a permutation of every pixel', () => {
    expect(order).toHaveLength(2000)
    expect(new Set(order).size).toBe(2000)
  })
  it('reveals the sky before the ground on average', () => {
    const pos = new Float64Array(2000)
    order.forEach((px, i) => { pos[px] = i })
    const mean = (from, to) => pos.slice(from, to).reduce((s, v) => s + v, 0) / (to - from)
    expect(mean(0, 1000)).toBeLessThan(mean(1000, 2000))
  })
  it('revealCount runs 0 → total and is clamped', () => {
    expect(revealCount(0, 500)).toBe(0)
    expect(revealCount(1, 500)).toBe(500)
    expect(revealCount(2, 500)).toBe(500)
    expect(revealCount(0.5, 500)).toBeLessThan(250) // starts slow
  })
})

describe('ripple', () => {
  const w = 8, h = 8
  const src = new Uint8ClampedArray(w * h * 4).map((_, i) => (i % 4 === 3 ? 255 : (i * 37) % 256))
  it('is the identity at p = 0', () => {
    const dst = new Uint8ClampedArray(src.length)
    applyRipple(src, dst, w, h, 4, 4, 0)
    expect(dst).toEqual(src)
  })
  it('distorts mid-way, only reusing source pixels', () => {
    const dst = new Uint8ClampedArray(src.length)
    applyRipple(src, dst, w, h, 4, 4, 0.5)
    expect(dst).not.toEqual(src)
    const srcPixels = new Set()
    for (let i = 0; i < src.length; i += 4) srcPixels.add(src.slice(i, i + 4).join())
    for (let i = 0; i < dst.length; i += 4) expect(srcPixels.has(dst.slice(i, i + 4).join())).toBe(true)
  })
  it('flashes to white by the end and zooms in', () => {
    expect(rippleFlash(0)).toBe(0)
    expect(rippleFlash(1)).toBe(1)
    expect(rippleAmplitude(0)).toBe(0)
    expect(zoomScale(0)).toBe(1)
    expect(zoomScale(1)).toBeGreaterThan(2)
  })
})

describe('fold', () => {
  const screen = { x: 0, y: 0, w: 320, h: 180 }, target = { x: 132, y: 66, w: 56, h: 44 }
  it('shrinks the screen into the frame', () => {
    expect(foldRect(0, screen, target)).toEqual(screen)
    expect(foldRect(1, screen, target)).toEqual(target)
  })
  it('settles from 1.4x to 1x', () => {
    expect(settleScale(0)).toBeCloseTo(1.4)
    expect(settleScale(1)).toBe(1)
  })
  it('dust fades out as it scatters', () => {
    const [d] = makeDust(1, mulberry32(3))
    expect(dustAt(d, 0, screen).alpha).toBe(1)
    expect(dustAt(d, 1, screen).alpha).toBe(0)
  })
})

describe('fade', () => {
  it('fades to black then back', () => {
    expect(fadeAlpha('out', 0)).toBe(0)
    expect(fadeAlpha('out', 1)).toBe(1)
    expect(fadeAlpha('in', 0)).toBe(1)
    expect(fadeAlpha('in', 1)).toBe(0)
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run src/engine/effects`
Expected: FAIL — modules not found.

- [ ] **Step 3: Implement**

`src/engine/rng.js`:
```js
export function mulberry32(seed) {
  let a = seed >>> 0
  return function () {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
```

`src/engine/effects/tween.js`:
```js
export const clamp01 = (p) => Math.max(0, Math.min(1, p))
export const lerp = (a, b, p) => a + (b - a) * p
export const easeInOut = (p) => {
  const x = clamp01(p)
  return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2
}
export const lerpRect = (a, b, p) => ({
  x: lerp(a.x, b.x, p),
  y: lerp(a.y, b.y, p),
  w: lerp(a.w, b.w, p),
  h: lerp(a.h, b.h, p),
})
```

`src/engine/effects/reveal.js`:
```js
import { clamp01 } from './tween.js'

// Random pixel order, biased so the sky (region 0) fills in before the ground (region 1).
export function revealOrder(regions, rng, groundDelay = 0.6) {
  const n = regions.length
  const keys = new Float64Array(n)
  for (let i = 0; i < n; i++) keys[i] = rng() + (regions[i] === 1 ? groundDelay : 0)
  const idx = Array.from({ length: n }, (_, i) => i)
  idx.sort((a, b) => keys[a] - keys[b])
  return Uint32Array.from(idx)
}

// Starts with a trickle of pixels and accelerates.
export function revealCount(p, total) {
  const x = clamp01(p)
  return x >= 1 ? total : Math.floor(total * x * x)
}
```

`src/engine/effects/ripple.js`:
```js
import { clamp01, easeInOut } from './tween.js'

export const rippleAmplitude = (p) => Math.sin(Math.PI * clamp01(p)) * 6
export const rippleFlash = (p) => (p < 0.55 ? 0 : clamp01((p - 0.55) / 0.45))
export const zoomScale = (p) => 1 + 1.4 * easeInOut(p)

// Concentric sine displacement around (cx, cy). src/dst are RGBA byte arrays of w*h pixels.
export function applyRipple(src, dst, w, h, cx, cy, p) {
  const amp = rippleAmplitude(p)
  if (amp === 0) {
    dst.set(src)
    return
  }
  const phase = p * 18
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = x - cx
      const dy = y - cy
      const d = Math.hypot(dx, dy) || 1
      const off = Math.sin(d * 0.35 - phase) * amp
      const sx = Math.max(0, Math.min(w - 1, Math.round(x + (dx / d) * off)))
      const sy = Math.max(0, Math.min(h - 1, Math.round(y + (dy / d) * off)))
      const si = (sy * w + sx) * 4
      const di = (y * w + x) * 4
      dst[di] = src[si]
      dst[di + 1] = src[si + 1]
      dst[di + 2] = src[si + 2]
      dst[di + 3] = src[si + 3]
    }
  }
}
```

`src/engine/effects/fold.js`:
```js
import { clamp01, easeInOut, lerpRect } from './tween.js'

export const foldRect = (p, screen, target) => (p <= 0 ? { ...screen } : p >= 1 ? { ...target } : lerpRect(screen, target, easeInOut(p)))
export const settleScale = (p) => (p >= 1 ? 1 : 1 + 0.4 * (1 - easeInOut(p)))

const DUST_COLORS = ['#f2d27a', '#d4a93a', '#ffffff', '#9fb7e8']

// Particles start on the edge of the shrinking room image and drift outward.
export function makeDust(count, rng) {
  return Array.from({ length: count }, () => {
    const edge = Math.floor(rng() * 4)
    const t = rng()
    const u = edge === 0 ? t : edge === 1 ? 1 : edge === 2 ? t : 0
    const v = edge === 0 ? 0 : edge === 1 ? t : edge === 2 ? 1 : t
    const angle = Math.atan2(v - 0.5, u - 0.5) + (rng() - 0.5)
    const speed = 20 + rng() * 40
    return { u, v, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, color: DUST_COLORS[Math.floor(rng() * DUST_COLORS.length)] }
  })
}

export function dustAt(d, p, rect) {
  const k = clamp01(p)
  return {
    x: rect.x + d.u * rect.w + d.vx * k,
    y: rect.y + d.v * rect.h + d.vy * k,
    alpha: 1 - k,
  }
}
```

`src/engine/effects/fade.js`:
```js
import { clamp01 } from './tween.js'

export const fadeAlpha = (phase, p) => (phase === 'out' ? clamp01(p) : 1 - clamp01(p))
```

- [ ] **Step 4: Run to verify pass**

Run: `npx vitest run src/engine/effects`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/engine/rng.js src/engine/effects
git commit -m "Add effect math for reveal, ripple portal, home fold, and fades"
```

---

### Task 10: Starry Night painting, section covers, pixelated thumbnails

**Files:**
- Create: `src/engine/paintings/starryNight.js`, `src/engine/paintings/covers.js`, `src/engine/pixelate.js`
- Test: `src/engine/paintings/paintings.test.js`, `src/engine/pixelate.test.js`

**Interfaces:**
- Consumes: `drawPixelArt`, `AVATAR_FRAMES`, `AVATAR_PALETTE`, `drawIcon` (Task 6).
- Produces:
  - `SN_W = 144`, `SN_H = 90`, `generateStarryNight(width=SN_W, height=SN_H) → { width, height, pixels: Uint8ClampedArray (RGBA), regions: Uint8Array }`
  - `drawCover(ctx, id: 'about'|'projects'|'experience'|'contact', x, y, w, h, t)` — draws only inside the given rect.
  - `quantize(v, levels)`, `quantizeImageData(data, levels)`, `loadPixelated(src, w, h, { levels?, loadImage? }) → Promise<HTMLCanvasElement|null>` (cached per `src|w×h`; resolves `null` on any failure).

- [ ] **Step 1: Write failing tests**

`src/engine/paintings/paintings.test.js`:
```js
import { describe, it, expect } from 'vitest'
import { stubCtx } from '../../test/stubCtx.js'
import { generateStarryNight, SN_W, SN_H } from './starryNight.js'
import { drawCover } from './covers.js'

describe('Starry Night', () => {
  const p = generateStarryNight()
  it('is 144x90 RGBA, fully opaque', () => {
    expect(p.width).toBe(SN_W); expect(p.height).toBe(SN_H)
    expect(p.pixels).toHaveLength(SN_W * SN_H * 4)
    for (let i = 3; i < p.pixels.length; i += 4) expect(p.pixels[i]).toBe(255)
  })
  it('has both sky and ground regions, with sky across the top', () => {
    const sky = p.regions.filter((r) => r === 0).length
    expect(sky).toBeGreaterThan(SN_W * SN_H * 0.4)
    expect(sky).toBeLessThan(SN_W * SN_H * 0.8)
    expect(p.regions[SN_W * 2 + Math.floor(SN_W / 2)]).toBe(0)
    expect(p.regions[(SN_H - 1) * SN_W + Math.floor(SN_W / 2)]).toBe(1)
  })
  it('is deterministic', () => {
    expect(generateStarryNight().pixels).toEqual(p.pixels)
  })
  it('uses several distinct colours (swirls, stars, moon, village)', () => {
    const colours = new Set()
    for (let i = 0; i < p.pixels.length; i += 4) colours.add(`${p.pixels[i]},${p.pixels[i + 1]},${p.pixels[i + 2]}`)
    expect(colours.size).toBeGreaterThanOrEqual(10)
  })
})

describe('covers', () => {
  for (const id of ['about', 'projects', 'experience', 'contact', 'unknown']) {
    it(`${id} cover stays inside its frame`, () => {
      const ctx = stubCtx()
      const X = 100, Y = 47, W = 50, H = 38
      drawCover(ctx, id, X, Y, W, H, 1.3)
      const rects = ctx.calls.filter((c) => c[0] === 'fillRect')
      expect(rects.length).toBeGreaterThan(0)
      for (const [, x, y, w, h] of rects) {
        expect(x).toBeGreaterThanOrEqual(X); expect(y).toBeGreaterThanOrEqual(Y)
        expect(x + w).toBeLessThanOrEqual(X + W); expect(y + h).toBeLessThanOrEqual(Y + H)
      }
    })
  }
})
```

`src/engine/pixelate.test.js`:
```js
import { describe, it, expect } from 'vitest'
import { quantize, quantizeImageData, loadPixelated } from './pixelate.js'

describe('pixelate', () => {
  it('quantizes channels to the nearest level', () => {
    expect(quantize(0, 6)).toBe(0)
    expect(quantize(255, 6)).toBe(255)
    expect(quantize(60, 6)).toBe(51)
    expect(quantize(130, 6)).toBe(153)
  })
  it('leaves alpha untouched', () => {
    const d = new Uint8ClampedArray([60, 130, 200, 77])
    quantizeImageData(d, 6)
    expect(Array.from(d)).toEqual([51, 153, 204, 77])
  })
  it('resolves null (no throw) when the image fails to load', async () => {
    const res = await loadPixelated('/missing.png', 42, 32, { loadImage: () => Promise.reject(new Error('404')) })
    expect(res).toBe(null)
  })
  it('caches by src and size', () => {
    let calls = 0
    const loadImage = () => { calls++; return Promise.reject(new Error('x')) }
    loadPixelated('/a.png', 10, 10, { loadImage })
    loadPixelated('/a.png', 10, 10, { loadImage })
    expect(calls).toBe(1)
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run src/engine/paintings src/engine/pixelate.test.js`
Expected: FAIL — modules not found.

- [ ] **Step 3: Implement**

`src/engine/paintings/starryNight.js`:
```js
// Procedural pixel homage to Van Gogh's The Starry Night. Region 0 = sky, 1 = ground/foreground.
export const SN_W = 144
export const SN_H = 90

const C = {
  night: [11, 30, 74], deep: [29, 63, 140], mid: [58, 111, 196], light: [127, 178, 229], pale: [232, 227, 176],
  starCore: [255, 247, 168], star: [242, 201, 76], moon: [246, 215, 67], moonGlow: [242, 169, 59],
  hill: [27, 47, 94], hillLight: [39, 64, 111], house: [52, 70, 107], roof: [34, 48, 85], window: [242, 201, 76],
  cypress: [26, 42, 26], cypressLight: [45, 63, 34],
}
// [u, v, radius] in painting-relative units
const STARS = [[0.14, 0.16, 0.035], [0.31, 0.1, 0.028], [0.61, 0.12, 0.03], [0.8, 0.24, 0.035], [0.4, 0.42, 0.025], [0.7, 0.45, 0.022], [0.24, 0.44, 0.028]]
// [u, v, falloff, strength]
const VORTICES = [[0.5, 0.3, 0.16, 1.6], [0.74, 0.36, 0.1, -1.2]]

export const horizonAt = (u) => 0.66 + 0.05 * Math.sin(u * 7) + 0.025 * Math.sin(u * 19)

function skyColor(u, v, aspect) {
  const md = Math.hypot((u - 0.9) * aspect, v - 0.14)
  if (md < 0.1) return md < 0.07 ? C.moon : C.moonGlow
  for (const [sx, sy, r] of STARS) {
    const d = Math.hypot((u - sx) * aspect, v - sy)
    if (d < r * 0.45) return C.starCore
    if (d < r) return C.star
    if (d < r * 1.5) return C.pale
  }
  let swirl = 0
  for (const [vx, vy, falloff, strength] of VORTICES) {
    const dx = (u - vx) * aspect
    const dy = v - vy
    swirl += strength * Math.exp(-Math.hypot(dx, dy) / falloff) * Math.atan2(dy, dx)
  }
  const wave = Math.sin(u * 9 + v * 14 + swirl * 2.2) * 0.5 + Math.sin(v * 22 - u * 5) * 0.25
  const t = (wave + 0.75) / 1.5
  if (t < 0.28) return C.night
  if (t < 0.55) return C.deep
  if (t < 0.78) return C.mid
  if (t < 0.92) return C.light
  return C.pale
}

function groundColor(u, v) {
  if (u > 0.4 && u < 0.9 && v > 0.74 && v < 0.92) {
    const cell = (u - 0.4) / 0.05
    const col = Math.floor(cell)
    const cellU = cell - col
    const roofV = 0.76 + (col % 3) * 0.03
    if (cellU < 0.8 && v >= roofV && v < roofV + 0.03) return C.roof
    if (cellU < 0.8 && v >= roofV + 0.03) return cellU > 0.3 && cellU < 0.5 && v < roofV + 0.08 ? C.window : C.house
  }
  return Math.sin(u * 25 + v * 40) > 0.3 ? C.hillLight : C.hill
}

export function generateStarryNight(width = SN_W, height = SN_H) {
  const pixels = new Uint8ClampedArray(width * height * 4)
  const regions = new Uint8Array(width * height)
  const aspect = width / height
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const u = x / (width - 1)
      const v = y / (height - 1)
      const cypressCentre = 0.16 + 0.015 * Math.sin(v * 12)
      const cypressHalf = Math.max(0, v - 0.12) * 0.11 * (1 + 0.3 * Math.sin(v * 30))
      const horizon = horizonAt(u)
      let color
      let region = 1
      if (v > 0.12 && Math.abs(u - cypressCentre) < cypressHalf) {
        color = (x + y) % 3 === 0 ? C.cypressLight : C.cypress
      } else if (Math.abs(u - 0.63) < 0.006 && v > 0.58 && v < horizon) {
        color = C.roof // church steeple
      } else if (v >= horizon) {
        color = groundColor(u, v)
      } else {
        color = skyColor(u, v, aspect)
        region = 0
      }
      const i = y * width + x
      regions[i] = region
      pixels[i * 4] = color[0]
      pixels[i * 4 + 1] = color[1]
      pixels[i * 4 + 2] = color[2]
      pixels[i * 4 + 3] = 255
    }
  }
  return { width, height, pixels, regions }
}
```

`src/engine/paintings/covers.js`:
```js
import { drawPixelArt } from '../sprites/pixelArt.js'
import { AVATAR_FRAMES, AVATAR_PALETTE } from '../sprites/avatar.js'
import { drawIcon } from '../sprites/icons.js'

// Cover paintings for the main-hall section frames. Everything stays inside (x, y, w, h).
const COVERS = {
  about(ctx, x, y, w, h) {
    ctx.fillStyle = '#f2d0a9'
    ctx.fillRect(x, y, w, h)
    ctx.fillStyle = '#e8b98a'
    ctx.fillRect(x, y + h - 8, w, 8)
    const portrait = AVATAR_FRAMES.idle.slice(0, 16) // head + shoulders
    const size = 32
    drawPixelArt(ctx, portrait, AVATAR_PALETTE, x + Math.floor((w - size) / 2), y + h - size, { scale: 2 })
  },
  projects(ctx, x, y, w, h, t) {
    ctx.fillStyle = '#1d3f8c'
    ctx.fillRect(x, y, w, h)
    const sx = x + Math.floor(w * 0.2), sy = y + Math.floor(h * 0.15)
    const sw = Math.floor(w * 0.6), sh = Math.floor(h * 0.5)
    ctx.fillStyle = '#c9c9d6'
    ctx.fillRect(sx, sy, sw, sh)
    ctx.fillStyle = '#10131f'
    ctx.fillRect(sx + 1, sy + 1, sw - 2, sh - 2)
    const lineColors = ['#9ee6c1', '#f2c94c', '#f4a6c8', '#7fb2e5']
    for (let i = 0; i < 4 && 3 + i * 4 < sh - 2; i++) {
      ctx.fillStyle = lineColors[i]
      ctx.fillRect(sx + 3 + (i % 2) * 3, sy + 3 + i * 4, Math.floor(sw * 0.5) - (i % 2) * 3, 2)
    }
    if (Math.floor(t * 2) % 2 === 0) {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(sx + sw - 6, sy + sh - 5, 2, 3)
    }
    ctx.fillStyle = '#c9c9d6'
    ctx.fillRect(x + Math.floor(w * 0.1), sy + sh, Math.floor(w * 0.8), 3)
  },
  experience(ctx, x, y, w, h) {
    ctx.fillStyle = '#f2a93b'
    ctx.fillRect(x, y, w, h)
    ctx.fillStyle = '#f6d743'
    ctx.fillRect(x + w - 14, y + 4, 8, 8)
    const n = 6
    const bw = Math.floor(w / n)
    for (let i = 0; i < n; i++) {
      const bh = Math.floor(h * (0.35 + 0.12 * (i % 3)))
      const bx = x + i * bw, by = y + h - bh
      ctx.fillStyle = i % 2 ? '#34466b' : '#223055'
      ctx.fillRect(bx, by, bw, bh)
      ctx.fillStyle = '#f2c94c'
      for (let wy = by + 3; wy + 1 < y + h - 2; wy += 4) ctx.fillRect(bx + 2, wy, 1, 1)
    }
  },
  contact(ctx, x, y, w, h) {
    ctx.fillStyle = '#f4d6e0'
    ctx.fillRect(x, y, w, h)
    drawIcon(ctx, 'envelope', x + Math.floor((w - 24) / 2), y + Math.floor((h - 24) / 2), '#8a1f2b', 3)
    drawIcon(ctx, 'heart', x + w - 10, y + 2, '#e05a7a', 1)
  },
}

export function drawCover(ctx, id, x, y, w, h, t = 0) {
  const draw = COVERS[id]
  if (draw) {
    draw(ctx, x, y, w, h, t)
    return
  }
  ctx.fillStyle = '#2a2438'
  ctx.fillRect(x, y, w, h)
}
```

`src/engine/pixelate.js`:
```js
export function quantize(v, levels) {
  const step = 255 / (levels - 1)
  return Math.round(Math.round(v / step) * step)
}

export function quantizeImageData(data, levels) {
  for (let i = 0; i < data.length; i += 4) {
    data[i] = quantize(data[i], levels)
    data[i + 1] = quantize(data[i + 1], levels)
    data[i + 2] = quantize(data[i + 2], levels)
  }
}

function defaultLoadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

const cache = new Map()

// Cover-fits an image into w×h, downsampled and colour-quantised. Resolves null on failure.
export function loadPixelated(src, w, h, { levels = 6, loadImage = defaultLoadImage } = {}) {
  const key = `${src}|${w}x${h}`
  if (!cache.has(key)) {
    cache.set(
      key,
      loadImage(src)
        .then((img) => {
          const canvas = document.createElement('canvas')
          canvas.width = w
          canvas.height = h
          const c = canvas.getContext('2d')
          const s = Math.max(w / img.width, h / img.height)
          c.drawImage(img, (w - img.width * s) / 2, (h - img.height * s) / 2, img.width * s, img.height * s)
          const data = c.getImageData(0, 0, w, h)
          quantizeImageData(data.data, levels)
          c.putImageData(data, 0, 0)
          return canvas
        })
        .catch(() => null),
    )
  }
  return cache.get(key)
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npx vitest run src/engine/paintings src/engine/pixelate.test.js`
Expected: PASS. If the "at least 10 colours" or sky-fraction assertions fail, adjust the constants in `STARS`/`horizonAt`, not the test thresholds.

- [ ] **Step 5: Commit**

```bash
git add src/engine/paintings src/engine/pixelate.js src/engine/pixelate.test.js
git commit -m "Add pixel Starry Night, section cover paintings, and image pixelation"
```

---

### Task 11: Drawing and game integration

**Files:**
- Create: `src/engine/draw/room.js`, `src/engine/draw/avatar.js`, `src/engine/draw/intro.js`, `src/engine/game.js`
- Test: `src/engine/draw/draw.test.js`

**Interfaces:**
- Consumes: everything from Tasks 3–10.
- Produces:
  - `drawRoom(ctx, room, camX, t, assets, activeTileId)` where `assets = { starry: CanvasImageSource, thumbs: Map<frameId, canvas|null> }`
  - `drawAvatar(ctx, avatar, camX)`, `drawSparkle(ctx, x, y, t)`
  - `PAINT_FULL = { x: 16, y: 0, w: 288, h: 180 }`, `createIntroReveal(painting, rng) → { canvas, order, shown, flashing, reset(), step(targetCount), fill() }`, `drawWelcome(ctx, alpha, t)`
  - `frameInnerScreenRect(frame, camX) → {x,y,w,h}`
  - `createGame({ canvas, emitter, data, initialRoom, playIntro, reducedMotion, isTouch, soundOn }) → Game`
  - **Game**: `{ goTo(room, {kind?}) → boolean, press(action), release(action), walkToScreen(fx: 0..1), skipIntro(), replayIntro(), setPaused(bool), setSoundOn(bool), destroy() }`
  - Emitted events: `'bubble'` `{ text } | null`; `'card'` `Card | null`; `'avatar'` `{ x, y }` (fractions of canvas); `'room'` roomId; `'introDone'`; `'back'`.

- [ ] **Step 1: Write the failing test** — `src/engine/draw/draw.test.js` (logic that can be checked without a real canvas):

```js
import { describe, it, expect } from 'vitest'
import { stubCtx } from '../../test/stubCtx.js'
import * as data from '../../data.js'
import { buildRooms } from '../../scenes/rooms.js'
import { drawRoom, frameInnerScreenRect } from './room.js'
import { drawAvatar } from './avatar.js'

const rooms = buildRooms(data)
const assets = { starry: {}, thumbs: new Map() }

describe('drawRoom', () => {
  it('draws every room without throwing, including missing thumbnails', () => {
    for (const room of Object.values(rooms)) {
      expect(() => drawRoom(stubCtx(), room, 0, 1, assets, null)).not.toThrow()
      expect(() => drawRoom(stubCtx(), room, room.width - 320, 1, assets, room.tiles[0]?.id)).not.toThrow()
    }
  })
  it('skips frames that are off screen', () => {
    const ctx = stubCtx()
    drawRoom(ctx, rooms.projects, 0, 0, assets, null)
    const drawnFar = ctx.calls.some((c) => c[0] === 'fillRect' && c[1] > 400)
    expect(drawnFar).toBe(false)
  })
  it('computes the inner rect of a frame in screen space', () => {
    const f = rooms.hall.frames[0]
    expect(frameInnerScreenRect(f, 10)).toEqual({ x: f.x - 10 + 3, y: f.y + 3, w: f.w - 6, h: f.h - 6 })
  })
})

describe('drawAvatar', () => {
  it('draws the sprite centred on avatar.x relative to the camera', () => {
    const ctx = stubCtx()
    drawAvatar(ctx, { x: 100, facing: 1, walking: false, animT: 0 }, 40)
    const xs = ctx.calls.filter((c) => c[0] === 'fillRect').map((c) => c[1])
    expect(Math.min(...xs)).toBeGreaterThanOrEqual(100 - 40 - 8 - 1)
    expect(Math.max(...xs)).toBeLessThanOrEqual(100 - 40 + 8 + 1)
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run src/engine/draw`
Expected: FAIL — modules not found.

- [ ] **Step 3: Implement drawing modules**

`src/engine/draw/room.js`:
```js
import { VIEW_W, VIEW_H } from '../renderer.js'
import { drawFrame, drawNameplate } from '../sprites/frame.js'
import { drawTile } from '../sprites/tiles.js'
import { drawIcon } from '../sprites/icons.js'
import { drawCover } from '../paintings/covers.js'
import { WAINSCOT_Y, FLOOR_Y, TILE_Y, TILE_H } from '../../scenes/rooms.js'

export const frameInnerScreenRect = (f, camX) => ({ x: f.x - camX + 3, y: f.y + 3, w: f.w - 6, h: f.h - 6 })

function drawBackground(ctx, theme, camX, t) {
  ctx.fillStyle = theme.wall
  ctx.fillRect(0, 0, VIEW_W, WAINSCOT_Y)
  ctx.fillStyle = theme.wallDark
  const stripeOffset = -(Math.floor(camX * 0.5) % 16)
  for (let x = stripeOffset; x < VIEW_W; x += 16) if (x >= 0) ctx.fillRect(x, 0, 2, WAINSCOT_Y)
  ctx.fillStyle = theme.trim
  ctx.fillRect(0, WAINSCOT_Y, VIEW_W, FLOOR_Y - WAINSCOT_Y)
  ctx.fillStyle = theme.floorLine
  ctx.fillRect(0, WAINSCOT_Y, VIEW_W, 2)
  ctx.fillStyle = theme.floor
  ctx.fillRect(0, FLOOR_Y, VIEW_W, VIEW_H - FLOOR_Y)
  ctx.fillStyle = theme.floorLine
  for (let y = FLOOR_Y + 6; y < VIEW_H; y += 8) ctx.fillRect(0, y, VIEW_W, 1)
  const seamOffset = -(Math.floor(camX) % 32)
  for (let x = seamOffset; x < VIEW_W; x += 32) if (x >= 0) ctx.fillRect(x, FLOOR_Y, 1, VIEW_H - FLOOR_Y)
  // sconces every 120 world px, flickering slightly
  const firstSconce = Math.ceil((camX - 20) / 120) * 120 + 20
  for (let wx = firstSconce; wx - camX < VIEW_W; wx += 120) {
    const sx = Math.round(wx - camX)
    if (sx < 0 || sx + 4 > VIEW_W) continue
    ctx.fillStyle = '#8a6420'
    ctx.fillRect(sx, 22, 4, 6)
    ctx.fillStyle = Math.sin(t * 9 + wx) > 0 ? '#f6d743' : '#f2a93b'
    ctx.fillRect(sx + 1, 18, 2, 4)
  }
}

function drawThumb(ctx, frame, r, assets, theme) {
  const thumb = frame.thumb
  if (thumb?.type === 'image' && assets.thumbs.get(frame.id)) {
    ctx.drawImage(assets.thumbs.get(frame.id), r.x, r.y, r.w, r.h)
    return
  }
  if (thumb?.type === 'monogram') {
    ctx.fillStyle = thumb.color
    ctx.fillRect(r.x, r.y, r.w, r.h)
    ctx.fillStyle = '#ffffff'
    ctx.font = '8px "Press Start 2P"'
    ctx.textBaseline = 'middle'
    const tw = ctx.measureText(thumb.text).width
    ctx.fillText(thumb.text, Math.round(r.x + (r.w - tw) / 2), Math.round(r.y + r.h / 2) + 1)
    return
  }
  // icon thumbs, and fallback for images that are loading or failed
  ctx.fillStyle = '#f4e6c8'
  ctx.fillRect(r.x, r.y, r.w, r.h)
  const icon = thumb?.type === 'icon' ? thumb.icon : 'star'
  drawIcon(ctx, icon, r.x + Math.floor((r.w - 16) / 2), r.y + Math.floor((r.h - 16) / 2), theme.wall, 2)
}

export function drawRoom(ctx, room, camX, t, assets, activeTileId) {
  const cam = Math.round(camX)
  drawBackground(ctx, room.theme, cam, t)
  for (const f of room.frames) {
    const sx = f.x - cam
    if (sx + f.w < 0 || sx > VIEW_W) continue
    drawFrame(ctx, sx, f.y, f.w, f.h)
    const inner = frameInnerScreenRect(f, cam)
    if (f.kind === 'starry') ctx.drawImage(assets.starry, inner.x, inner.y, inner.w, inner.h)
    else if (f.kind === 'section') drawCover(ctx, f.cover, inner.x, inner.y, inner.w, inner.h, t)
    else drawThumb(ctx, f, inner, assets, room.theme)
    if (f.kind === 'section') drawNameplate(ctx, sx + f.w / 2, f.y + f.h + 5, f.label.toUpperCase())
  }
  for (const tile of room.tiles) {
    const sx = tile.x - cam
    if (sx + tile.w < 0 || sx > VIEW_W) continue
    const active = tile.id === activeTileId
    drawTile(ctx, sx, TILE_Y, tile.w, TILE_H, t, active, room.theme.accent)
    drawIcon(ctx, tile.icon, sx + (tile.w - 8) / 2, WAINSCOT_Y + 8, room.theme.accent)
    ctx.font = '8px "Press Start 2P"'
    ctx.textBaseline = 'top'
    ctx.fillStyle = room.theme.accent
    const label = tile.label.toUpperCase()
    const lw = ctx.measureText(label).width
    const lx = Math.round(sx + tile.w / 2 - lw / 2)
    if (lx >= 0 && lx + lw <= VIEW_W) ctx.fillText(label, lx, WAINSCOT_Y - 12)
  }
}
```

`src/engine/draw/avatar.js`:
```js
import { drawPixelArt } from '../sprites/pixelArt.js'
import { AVATAR_PALETTE, AVATAR_W, AVATAR_H, avatarFrame } from '../sprites/avatar.js'
import { AVATAR_FEET_Y } from '../../scenes/rooms.js'

export function drawAvatar(ctx, avatar, camX) {
  const { rows, yOffset } = avatarFrame(avatar)
  const x = Math.round(avatar.x - camX - AVATAR_W / 2)
  ctx.fillStyle = 'rgba(0,0,0,0.3)'
  ctx.fillRect(x + 2, AVATAR_FEET_Y - 1, AVATAR_W - 4, 2)
  drawPixelArt(ctx, rows, AVATAR_PALETTE, x, AVATAR_FEET_Y - AVATAR_H + yOffset, { flip: avatar.facing < 0 })
}

export function drawSparkle(ctx, x, y, t) {
  ctx.fillStyle = '#f6d743'
  const r = 6 + Math.floor(t * 20) % 4
  for (const [dx, dy] of [[0, -r], [r, 0], [0, r], [-r, 0]]) ctx.fillRect(Math.round(x + dx), Math.round(y + dy), 1, 1)
}
```

`src/engine/draw/intro.js`:
```js
export const PAINT_FULL = { x: 16, y: 0, w: 288, h: 180 }

// Pixel-by-pixel reveal into an offscreen canvas. Newly revealed pixels flash white for one frame.
export function createIntroReveal(painting, order) {
  const { width, height, pixels } = painting
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const c = canvas.getContext('2d')
  const img = c.createImageData(width, height)
  const d = img.data
  const state = { canvas, order, shown: 0, flashing: [] }

  const copy = (i) => {
    d[i * 4] = pixels[i * 4]
    d[i * 4 + 1] = pixels[i * 4 + 1]
    d[i * 4 + 2] = pixels[i * 4 + 2]
    d[i * 4 + 3] = 255
  }

  state.reset = () => {
    d.fill(0)
    state.shown = 0
    state.flashing = []
    c.putImageData(img, 0, 0)
  }
  state.step = (target) => {
    for (const i of state.flashing) copy(i)
    state.flashing = []
    while (state.shown < target) {
      const i = order[state.shown++]
      d[i * 4] = 255
      d[i * 4 + 1] = 255
      d[i * 4 + 2] = 240
      d[i * 4 + 3] = 255
      state.flashing.push(i)
    }
    c.putImageData(img, 0, 0)
    return state.flashing.length
  }
  state.fill = () => {
    for (let i = 0; i < order.length; i++) copy(i)
    state.shown = order.length
    state.flashing = []
    c.putImageData(img, 0, 0)
  }
  return state
}

export function drawWelcome(ctx, alpha, t) {
  if (alpha <= 0) return
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.font = '16px "Press Start 2P"'
  ctx.textBaseline = 'top'
  const text = 'Welcome!'
  const w = ctx.measureText(text).width
  const x = Math.round(160 - w / 2)
  const y = 34
  ctx.fillStyle = '#0b1e4a'
  for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [2, 2]]) ctx.fillText(text, x + dx, y + dy)
  ctx.fillStyle = '#f6d743'
  ctx.fillText(text, x, y)
  ctx.fillStyle = '#ffffff'
  for (let i = 0; i < 6; i++) {
    if (Math.sin(t * 6 + i * 1.7) > 0.6) ctx.fillRect(x - 6 + ((i * 29) % (w + 12)), y - 6 + ((i * 11) % 28), 1, 1)
  }
  ctx.restore()
}
```

- [ ] **Step 4: Run to verify the draw tests pass**

Run: `npx vitest run src/engine/draw`
Expected: PASS.

- [ ] **Step 5: Implement `src/engine/game.js`**

```js
import { createInput } from './input.js'
import { createLoop } from './loop.js'
import { setupCanvas, VIEW_W, VIEW_H } from './renderer.js'
import { clampCamera, followCamera } from './camera.js'
import { createDirector, introPhase } from './director.js'
import { welcomeText, enterFrameText, tileText, STARRY_TEXT } from './copy.js'
import { mulberry32 } from './rng.js'
import { revealOrder, revealCount } from './effects/reveal.js'
import { easeInOut, lerpRect } from './effects/tween.js'
import { applyRipple, rippleFlash, zoomScale } from './effects/ripple.js'
import { foldRect, settleScale, makeDust, dustAt } from './effects/fold.js'
import { fadeAlpha } from './effects/fade.js'
import { generateStarryNight } from './paintings/starryNight.js'
import { loadPixelated } from './pixelate.js'
import { createAudio } from './audio.js'
import { drawFrame } from './sprites/frame.js'
import { drawRoom, frameInnerScreenRect } from './draw/room.js'
import { drawAvatar, drawSparkle } from './draw/avatar.js'
import { createIntroReveal, drawWelcome, PAINT_FULL } from './draw/intro.js'
import { buildRooms, AVATAR_FEET_Y, TILE_Y } from '../scenes/rooms.js'
import { createHallScene } from '../scenes/hallScene.js'
import { spawnFor } from '../scenes/spawn.js'
import { asset } from '../asset.js'

const SCREEN = { x: 0, y: 0, w: VIEW_W, h: VIEW_H }
const FOLD_TARGET = { x: 132, y: 66, w: 56, h: 44 }
const BG = '#120e18'

function makeCanvas(w, h) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')
  ctx.imageSmoothingEnabled = false
  return { canvas: c, ctx }
}

export function createGame({ canvas, emitter, data, initialRoom = 'hall', playIntro = false, reducedMotion = false, isTouch = false, soundOn = false }) {
  const ctx = setupCanvas(canvas)
  const input = createInput()
  const detachInput = input.attach(window)
  const audio = createAudio()
  audio.setEnabled(soundOn)
  const rooms = buildRooms(data)
  const director = createDirector({ room: initialRoom, playIntro, reducedMotion })

  const painting = generateStarryNight()
  const paintingCanvas = makeCanvas(painting.width, painting.height)
  paintingCanvas.ctx.putImageData(new ImageData(painting.pixels, painting.width, painting.height), 0, 0)
  const reveal = createIntroReveal(painting, revealOrder(painting.regions, mulberry32(7)))
  const assets = { starry: paintingCanvas.canvas, thumbs: new Map() }
  const snap = makeCanvas(VIEW_W, VIEW_H)
  const dust = makeDust(48, mulberry32(11))

  for (const room of Object.values(rooms)) {
    for (const f of room.frames) {
      if (f.thumb?.type !== 'image') continue
      loadPixelated(asset(f.thumb.src), f.w - 6, f.h - 6).then((c) => assets.thumbs.set(f.id, c))
    }
  }
  document.fonts?.load('8px "Press Start 2P"').catch(() => {})

  let scene = createHallScene(rooms[initialRoom])
  let camX = clampCamera(scene.avatar.x - VIEW_W / 2, scene.room.width)
  let t = 0
  let paused = false
  let sparkleUntil = 0
  let stepTimer = 0
  let lastAvatar = null
  let welcomed = false

  function showWelcome() {
    if (welcomed) return
    welcomed = true
    emitter.emit('bubble', { text: welcomeText(isTouch) })
  }

  function enterScene(roomId, fromId) {
    const spawn = spawnFor(fromId, rooms[roomId])
    scene = createHallScene(rooms[roomId], { spawnX: spawn.x, facing: spawn.facing })
    camX = clampCamera(scene.avatar.x - VIEW_W / 2, scene.room.width)
    emitter.emit('card', null)
    emitter.emit('bubble', null)
    emitter.emit('room', roomId)
  }

  function originOf(target) {
    const cx = target.x + target.w / 2 - camX
    return { x: cx, y: target.y !== undefined ? target.y + target.h / 2 : TILE_Y }
  }

  function handleSceneEvents(events) {
    const inHall = scene.room.id === 'hall'
    for (const ev of events) {
      if (ev.type === 'firstMove' && inHall) emitter.emit('bubble', null)
      if (ev.type === 'frame') {
        if (inHall) {
          const f = ev.frame
          emitter.emit('bubble', f ? { text: f.kind === 'starry' ? STARRY_TEXT : enterFrameText(f.label, isTouch) } : null)
        } else {
          emitter.emit('card', ev.frame?.card ?? null)
          if (ev.frame) audio.sfx('card')
        }
      }
      if (ev.type === 'tile') emitter.emit('bubble', ev.tile ? { text: tileText(ev.tile.label, isTouch) } : null)
      if (ev.type === 'go' && director.request(ev.target, { origin: originOf(ev.origin) })) {
        emitter.emit('bubble', null)
        emitter.emit('card', null)
        audio.sfx('whoosh')
      }
    }
  }

  function handleDirectorEvents(events) {
    for (const ev of events) {
      if (ev.type === 'introDone') {
        reveal.fill()
        sparkleUntil = t + 0.8
        audio.sfx('sparkle')
        emitter.emit('introDone')
        showWelcome()
      }
      if (ev.type === 'roomChanged') {
        enterScene(ev.room, ev.from)
        if (ev.room === 'hall') showWelcome()
      }
    }
  }

  function update(dt) {
    t += dt
    if (!paused) {
      const mode = director.state.mode
      if (mode === 'play') {
        handleSceneEvents(scene.update(dt, input))
        if (scene.avatar.walking) {
          stepTimer += dt
          if (stepTimer > 0.28) {
            stepTimer = 0
            audio.sfx('step')
          }
        }
      }
      if (input.consume('back')) emitter.emit('back')
      handleDirectorEvents(director.tick(dt))
      camX = followCamera(camX, scene.avatar.x, scene.room.width, dt)
      emitAvatar()
    }
    input.endFrame()
  }

  function emitAvatar() {
    const pos = { x: (scene.avatar.x - camX) / VIEW_W, y: (AVATAR_FEET_Y - 28) / VIEW_H }
    if (!lastAvatar || Math.abs(lastAvatar.x - pos.x) > 0.002) {
      lastAvatar = pos
      emitter.emit('avatar', pos)
    }
  }

  function drawWorld(target, { hideAvatar = false } = {}) {
    drawRoom(target, scene.room, camX, t, assets, scene.activeTile?.id ?? null)
    if (!hideAvatar) drawAvatar(target, scene.avatar, camX)
    if (t < sparkleUntil) drawSparkle(target, scene.avatar.x - camX, AVATAR_FEET_Y - 12, t)
  }

  function renderIntro() {
    const { phase, p } = introPhase(director.state.t, reducedMotion)
    ctx.fillStyle = BG
    ctx.fillRect(0, 0, VIEW_W, VIEW_H)
    if (phase === 'fade') {
      ctx.globalAlpha = p
      ctx.drawImage(assets.starry, PAINT_FULL.x, PAINT_FULL.y, PAINT_FULL.w, PAINT_FULL.h)
      ctx.globalAlpha = 1
      return
    }
    if (phase === 'reveal') {
      if (reveal.step(revealCount(p, reveal.order.length)) > 0 && Math.floor(t * 8) !== Math.floor((t - 1 / 60) * 8)) audio.sfx('pop')
      ctx.drawImage(reveal.canvas, PAINT_FULL.x, PAINT_FULL.y, PAINT_FULL.w, PAINT_FULL.h)
      return
    }
    if (phase === 'welcome' || phase === 'hold') {
      reveal.step(reveal.order.length)
      ctx.drawImage(reveal.canvas, PAINT_FULL.x, PAINT_FULL.y, PAINT_FULL.w, PAINT_FULL.h)
      drawWelcome(ctx, phase === 'welcome' ? p : 1, t)
      return
    }
    // zoom: painting shrinks into the Starry Night frame on the hall wall
    const e = easeInOut(p)
    drawWorld(ctx, { hideAvatar: p < 0.85 })
    ctx.fillStyle = BG
    ctx.globalAlpha = (1 - e) * 0.95
    ctx.fillRect(0, 0, VIEW_W, VIEW_H)
    ctx.globalAlpha = 1
    const starry = scene.room.frames.find((f) => f.kind === 'starry')
    const r = lerpRect(PAINT_FULL, frameInnerScreenRect(starry, camX), e)
    drawFrame(ctx, r.x - 3, r.y - 3, r.w + 6, r.h + 6, e)
    ctx.drawImage(assets.starry, r.x, r.y, r.w, r.h)
    ctx.save()
    ctx.translate(r.x, r.y)
    ctx.scale(r.w / PAINT_FULL.w, r.h / PAINT_FULL.h)
    ctx.translate(-PAINT_FULL.x, -PAINT_FULL.y)
    drawWelcome(ctx, 1 - e, t)
    ctx.restore()
  }

  function renderTransition() {
    const tr = director.state.transition
    const p = director.progress()
    if (tr.kind === 'crossfade') {
      drawWorld(ctx)
      ctx.fillStyle = '#000000'
      ctx.globalAlpha = fadeAlpha(tr.phase, p)
      ctx.fillRect(0, 0, VIEW_W, VIEW_H)
      ctx.globalAlpha = 1
      return
    }
    if (tr.kind === 'ripple') {
      if (tr.phase === 'out') {
        const o = tr.origin ?? { x: VIEW_W / 2, y: VIEW_H / 2 }
        drawWorld(snap.ctx)
        const s = zoomScale(p)
        ctx.fillStyle = BG
        ctx.fillRect(0, 0, VIEW_W, VIEW_H)
        ctx.drawImage(snap.canvas, o.x - o.x * s, o.y - o.y * s, VIEW_W * s, VIEW_H * s)
        const src = ctx.getImageData(0, 0, VIEW_W, VIEW_H)
        const dst = ctx.createImageData(VIEW_W, VIEW_H)
        applyRipple(src.data, dst.data, VIEW_W, VIEW_H, o.x, o.y, p)
        ctx.putImageData(dst, 0, 0)
        ctx.fillStyle = '#ffffff'
        ctx.globalAlpha = rippleFlash(p)
        ctx.fillRect(0, 0, VIEW_W, VIEW_H)
        ctx.globalAlpha = 1
      } else {
        drawWorld(ctx)
        ctx.fillStyle = '#ffffff'
        ctx.globalAlpha = 1 - p
        ctx.fillRect(0, 0, VIEW_W, VIEW_H)
        ctx.globalAlpha = 1
      }
      return
    }
    // fold: room folds back into its painting, then the hall settles
    if (tr.phase === 'out') {
      drawWorld(snap.ctx)
      ctx.fillStyle = BG
      ctx.fillRect(0, 0, VIEW_W, VIEW_H)
      const r = foldRect(p, SCREEN, FOLD_TARGET)
      drawFrame(ctx, r.x - 3, r.y - 3, r.w + 6, r.h + 6, p)
      ctx.drawImage(snap.canvas, r.x, r.y, r.w, r.h)
      for (const d of dust) {
        const pt = dustAt(d, p, r)
        ctx.globalAlpha = pt.alpha
        ctx.fillStyle = d.color
        ctx.fillRect(Math.round(pt.x), Math.round(pt.y), 1, 1)
      }
      ctx.globalAlpha = 1
    } else {
      drawWorld(snap.ctx)
      const frame = scene.room.frames.find((f) => f.target === tr.from)
      const cx = frame ? frame.x + frame.w / 2 - camX : VIEW_W / 2
      const cy = frame ? frame.y + frame.h / 2 : VIEW_H / 2
      const s = settleScale(p)
      ctx.fillStyle = BG
      ctx.fillRect(0, 0, VIEW_W, VIEW_H)
      ctx.drawImage(snap.canvas, cx - cx * s, cy - cy * s, VIEW_W * s, VIEW_H * s)
    }
  }

  function render() {
    const mode = director.state.mode
    if (mode === 'intro') renderIntro()
    else if (mode === 'transition') renderTransition()
    else drawWorld(ctx)
  }

  const loop = createLoop({ update, render })
  loop.start()
  if (!playIntro && initialRoom === 'hall') showWelcome()
  emitter.emit('room', initialRoom)

  return {
    goTo(room, { kind } = {}) {
      const ok = director.request(room, { kind })
      if (ok) {
        emitter.emit('bubble', null)
        emitter.emit('card', null)
      }
      return ok
    },
    press: (a) => input.press(a),
    release: (a) => input.release(a),
    walkToScreen(fx) {
      if (director.state.mode === 'play') scene.walkTo(camX + fx * VIEW_W)
    },
    skipIntro() {
      handleDirectorEvents(director.skipIntro())
    },
    replayIntro() {
      if (!director.replayIntro()) return false
      reveal.reset()
      welcomed = false
      enterScene('hall', null)
      return true
    },
    setPaused(v) {
      paused = !!v
      input.reset()
    },
    setSoundOn(v) {
      audio.setEnabled(v)
    },
    destroy() {
      loop.stop()
      detachInput()
      audio.destroy()
    },
  }
}
```

Note: `game.js` imports `createAudio` from Task 14. Until Task 14 lands, create the stub `src/engine/audio.js` now so the import resolves:

```js
export function createAudio() {
  return { enabled: false, setEnabled() {}, sfx() {}, destroy() {} }
}
```

- [ ] **Step 6: Run the whole suite**

Run: `npx vitest run`
Expected: PASS (game.js has no unit test; it is verified in Task 13 in the browser).

- [ ] **Step 7: Commit**

```bash
git add src/engine/draw src/engine/game.js src/engine/audio.js
git commit -m "Add room, avatar and intro drawing plus game integration"
```

---

### Task 12: Quick view brochure and info card

**Files:**
- Create: `src/ui/QuickView.jsx`, `src/ui/InfoCard.jsx`, `src/ui/SpeechBubble.jsx`
- Test: `src/ui/QuickView.test.jsx`, `src/ui/InfoCard.test.jsx`

**Interfaces:**
- Consumes: `data.js` (Task 2), Card shape (Task 5), `asset` (Task 1).
- Produces:
  - `<QuickView data={module} onClose={() => void} />` — dialog, Esc and the close button call `onClose`, focus moves to the close button on mount.
  - `<InfoCard card={Card|null} onClose={() => void} />` — renders nothing for `null`.
  - `<SpeechBubble text={string|null} pos={{x,y}|null} />` — positioned by fractions of its parent.

- [ ] **Step 1: Write failing tests**

`src/ui/QuickView.test.jsx`:
```jsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import * as data from '../data.js'
import QuickView from './QuickView.jsx'

describe('QuickView', () => {
  it('lists every section, project and role', () => {
    render(<QuickView data={data} onClose={() => {}} />)
    for (const h of ['About', 'Education', 'Experience', 'Projects', 'Contact']) {
      expect(screen.getByRole('heading', { name: h })).toBeTruthy()
    }
    for (const p of data.projects) expect(screen.getByText(p.title)).toBeTruthy()
    for (const e of data.experience) expect(screen.getByText(e.company)).toBeTruthy()
  })
  it('never shows a GPA', () => {
    const { container } = render(<QuickView data={data} onClose={() => {}} />)
    expect(container.textContent).not.toMatch(/GPA|4\.7/)
  })
  it('closes on Esc and on the close button, and focuses the close button', () => {
    const onClose = vi.fn()
    render(<QuickView data={data} onClose={onClose} />)
    const btn = screen.getByRole('button', { name: /close/i })
    expect(document.activeElement).toBe(btn)
    fireEvent.keyDown(window, { key: 'Escape' })
    fireEvent.click(btn)
    expect(onClose).toHaveBeenCalledTimes(2)
  })
})
```

`src/ui/InfoCard.test.jsx`:
```jsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import InfoCard from './InfoCard.jsx'

const card = {
  title: 'dermalab', subtitle: 'Hackathon', meta: 'Philadelphia · 2023', body: ['Won PennApps.'],
  bullets: ['Built a thing'], tags: ['PyTorch'], links: [{ href: 'https://devpost.com/software/dermalab', label: 'View on DevPost' }], image: null,
}

describe('InfoCard', () => {
  it('renders nothing without a card', () => {
    const { container } = render(<InfoCard card={null} onClose={() => {}} />)
    expect(container.firstChild).toBe(null)
  })
  it('renders all card fields and safe external links', () => {
    render(<InfoCard card={card} onClose={() => {}} />)
    expect(screen.getByRole('heading', { name: 'dermalab' })).toBeTruthy()
    for (const text of ['Hackathon', 'Philadelphia · 2023', 'Won PennApps.', 'Built a thing', 'PyTorch']) expect(screen.getByText(text)).toBeTruthy()
    const link = screen.getByRole('link', { name: 'View on DevPost' })
    expect(link.getAttribute('target')).toBe('_blank')
    expect(link.getAttribute('rel')).toBe('noopener noreferrer')
  })
  it('opens mailto links in the same tab', () => {
    render(<InfoCard card={{ ...card, links: [{ href: 'mailto:a@b.c', label: 'a@b.c' }] }} onClose={() => {}} />)
    expect(screen.getByRole('link', { name: 'a@b.c' }).getAttribute('target')).toBe(null)
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run src/ui`
Expected: FAIL — modules not found.

- [ ] **Step 3: Implement**

`src/ui/InfoCard.jsx`:
```jsx
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
```

`src/ui/SpeechBubble.jsx`:
```jsx
export default function SpeechBubble({ text, pos }) {
  if (!text || !pos) return null
  const left = Math.min(Math.max(pos.x * 100, 12), 88)
  return (
    <div className="speech-bubble pixel-border" style={{ left: `${left}%`, top: `${pos.y * 100}%` }}>
      {text}
    </div>
  )
}
```

`src/ui/QuickView.jsx`:
```jsx
import { useEffect, useRef } from 'react'
import { asset } from '../asset.js'

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
          <p><strong>Interests:</strong> {interests.join(' · ')}</p>
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
          <h2>Experience</h2>
          {experience.map((e) => (
            <article key={e.id} className="quick-view__entry">
              <h3>{e.company}</h3>
              <p className="quick-view__meta">{[e.role, e.location, e.dates].filter(Boolean).join(' · ')}</p>
              <ul>{e.bullets.map((b) => <li key={b}>{b}</li>)}</ul>
            </article>
          ))}
        </section>

        <section>
          <h2>Projects</h2>
          {projects.map((p) => (
            <article key={p.id} className="quick-view__entry">
              <h3>{p.title}</h3>
              <p className="quick-view__meta">{p.category}</p>
              <p>{p.description}</p>
              {p.technologies?.length > 0 && <p className="quick-view__meta">{p.technologies.join(' · ')}</p>}
              {p.link && <a href={p.link} target="_blank" rel="noopener noreferrer">{p.linkText ?? 'View project'}</a>}
            </article>
          ))}
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
```

- [ ] **Step 4: Run to verify pass**

Run: `npx vitest run src/ui`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/ui
git commit -m "Add Quick view brochure, info card, and speech bubble"
```

---

### Task 13: App shell — canvas mount, overlays, menu, hash sync, styles

**Files:**
- Create: `src/ui/GameCanvas.jsx`, `src/ui/CornerMenu.jsx`, `src/ui/SkipButton.jsx`, `src/ui/useMediaQuery.js`, `src/styles/global.css`
- Modify: `src/App.jsx` (full rewrite), `src/main.jsx`, `index.html`
- Test: `src/App.test.jsx`

**Interfaces:**
- Consumes: `createGame` + Game API (Task 11), `createEmitter` (Task 3), `parseHash`/`hashFor` (Task 4), `createStorage`/`KEYS` (Task 1), `computeScale` (Task 3), UI components (Task 12).
- Produces: `<GameCanvas options handlers onReady />` where `handlers` is `{ bubble, card, avatar, room, introDone, back }` and `onReady(game)` receives the Game. `useMediaQuery(query) → boolean`. `CARD_RESERVE = 220` px reserved below the canvas.

- [ ] **Step 1: Write the failing test** — `src/App.test.jsx`:

```jsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'

const fakeGame = { skipIntro: vi.fn(), replayIntro: vi.fn(() => true), setPaused: vi.fn(), setSoundOn: vi.fn(), goTo: vi.fn(), press: vi.fn(), release: vi.fn(), walkToScreen: vi.fn() }
let handlers
vi.mock('./ui/GameCanvas.jsx', () => ({
  default: (props) => {
    handlers = props.handlers
    props.onReady(fakeGame)
    return <div data-testid="game" />
  },
}))

import App from './App.jsx'

beforeEach(() => {
  window.localStorage.clear()
  window.location.hash = ''
  Object.values(fakeGame).forEach((f) => f.mockClear())
})

describe('App', () => {
  it('shows Skip on a first visit and skips the intro', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /skip/i }))
    expect(fakeGame.skipIntro).toHaveBeenCalled()
  })
  it('does not offer Skip once the intro has been seen', () => {
    window.localStorage.setItem('rg.introSeen', 'true')
    render(<App />)
    expect(screen.queryByRole('button', { name: /skip/i })).toBe(null)
  })
  it('does not play the intro for deep links', () => {
    window.location.hash = '#/projects'
    render(<App />)
    expect(screen.queryByRole('button', { name: /skip/i })).toBe(null)
  })
  it('opens the Quick view from the menu and pauses the game', () => {
    window.localStorage.setItem('rg.introSeen', 'true')
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /quick view/i }))
    expect(screen.getByRole('dialog')).toBeTruthy()
    expect(fakeGame.setPaused).toHaveBeenLastCalledWith(true)
  })
  it('opens the Quick view directly from #/quick', () => {
    window.location.hash = '#/quick'
    render(<App />)
    expect(screen.getByRole('dialog')).toBeTruthy()
  })
  it('sound starts off and toggles on', () => {
    window.localStorage.setItem('rg.introSeen', 'true')
    render(<App />)
    const btn = screen.getByRole('button', { name: /sound off/i })
    fireEvent.click(btn)
    expect(fakeGame.setSoundOn).toHaveBeenLastCalledWith(true)
    expect(screen.getByRole('button', { name: /sound on/i })).toBeTruthy()
  })
  it('announces bubbles and cards in a live region', () => {
    window.localStorage.setItem('rg.introSeen', 'true')
    render(<App />)
    act(() => handlers.bubble({ text: 'Press Enter to step into Projects!' }))
    expect(screen.getByRole('status').textContent).toContain('Press Enter to step into Projects!')
  })
  it('records that the intro was seen', () => {
    render(<App />)
    act(() => handlers.introDone())
    expect(window.localStorage.getItem('rg.introSeen')).toBe('true')
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run src/App.test.jsx`
Expected: FAIL — new UI modules missing / old App renders router pages.

- [ ] **Step 3: Implement components**

`src/ui/useMediaQuery.js`:
```js
import { useEffect, useState } from 'react'

export default function useMediaQuery(query) {
  const get = () => (typeof window.matchMedia === 'function' ? window.matchMedia(query).matches : false)
  const [matches, setMatches] = useState(get)
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const mql = window.matchMedia(query)
    const onChange = () => setMatches(mql.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [query])
  return matches
}
```

`src/ui/GameCanvas.jsx`:
```jsx
import { useEffect, useRef } from 'react'
import { createEmitter } from '../engine/events.js'
import { createGame } from '../engine/game.js'
import { computeScale, VIEW_W, VIEW_H } from '../engine/renderer.js'

export const CARD_RESERVE = 220
const GUTTER = 16

export default function GameCanvas({ options, handlers, onReady, children }) {
  const canvasRef = useRef(null)
  const boxRef = useRef(null)
  const handlersRef = useRef(handlers)
  const gameRef = useRef(null)
  handlersRef.current = handlers

  useEffect(() => {
    const emitter = createEmitter()
    const names = ['bubble', 'card', 'avatar', 'room', 'introDone', 'back']
    const offs = names.map((n) => emitter.on(n, (p) => handlersRef.current[n]?.(p)))
    const game = createGame({ canvas: canvasRef.current, emitter, ...options })
    gameRef.current = game
    onReady(game)
    return () => {
      offs.forEach((off) => off())
      game.destroy()
    }
    // options are read once at mount by design
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const fit = () => {
      const s = computeScale(window.innerWidth - GUTTER * 2, window.innerHeight - CARD_RESERVE)
      boxRef.current.style.width = `${VIEW_W * s}px`
      boxRef.current.style.height = `${VIEW_H * s}px`
    }
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [])

  const onPointerDown = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    gameRef.current?.walkToScreen((e.clientX - rect.left) / rect.width)
  }

  return (
    <div className="canvas-box" ref={boxRef}>
      <canvas
        ref={canvasRef}
        className="game-canvas"
        role="img"
        aria-label="A pixel-art gallery. Srilekha's avatar walks past framed paintings. Use the Quick view button for a text version."
        onPointerDown={onPointerDown}
      />
      {children}
    </div>
  )
}
```

`src/ui/CornerMenu.jsx`:
```jsx
export default function CornerMenu({ soundOn, onToggleSound, onReplayIntro, onQuickView }) {
  return (
    <nav className="corner-menu" aria-label="Site menu">
      <button className="pixel-button" onClick={onQuickView} aria-label="Quick view (text version)">📜 Quick view</button>
      <button className="pixel-button" onClick={onToggleSound} aria-label={soundOn ? 'Sound on' : 'Sound off'}>{soundOn ? '🔊' : '🔇'}</button>
      <button className="pixel-button" onClick={onReplayIntro} aria-label="Replay intro">🎬</button>
    </nav>
  )
}
```

`src/ui/SkipButton.jsx`:
```jsx
export default function SkipButton({ onSkip }) {
  return <button className="pixel-button skip-button" onClick={onSkip}>Skip ▶▶</button>
}
```

- [ ] **Step 4: Rewrite `src/App.jsx`**

```jsx
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as data from './data.js'
import { createStorage, KEYS } from './storage.js'
import { parseHash, hashFor } from './routing.js'
import GameCanvas from './ui/GameCanvas.jsx'
import SpeechBubble from './ui/SpeechBubble.jsx'
import InfoCard from './ui/InfoCard.jsx'
import QuickView from './ui/QuickView.jsx'
import CornerMenu from './ui/CornerMenu.jsx'
import SkipButton from './ui/SkipButton.jsx'
import TouchControls from './ui/TouchControls.jsx'
import useMediaQuery from './ui/useMediaQuery.js'

export default function App() {
  const storage = useMemo(() => createStorage(), [])
  const initial = useMemo(() => parseHash(window.location.hash), [])
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const isTouch = useMediaQuery('(pointer: coarse)')

  const isDeepLink = initial.room !== 'hall' || initial.quick
  const [introPlaying, setIntroPlaying] = useState(() => !isDeepLink && !storage.get(KEYS.introSeen, false))
  const [quickOpen, setQuickOpen] = useState(initial.quick)
  const [soundOn, setSoundOn] = useState(() => storage.get(KEYS.soundOn, false))
  const [bubble, setBubble] = useState(null)
  const [card, setCard] = useState(null)
  const [avatarPos, setAvatarPos] = useState(null)

  const gameRef = useRef(null)
  const roomRef = useRef(initial.room)

  const options = useMemo(
    () => ({ data, initialRoom: initial.room, playIntro: introPlaying, reducedMotion, isTouch, soundOn }),
    // read once at mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const handlers = {
    bubble: (b) => setBubble(b?.text ?? null),
    card: setCard,
    avatar: setAvatarPos,
    room: (room) => {
      roomRef.current = room
      const target = hashFor(room)
      if (!parseHash(window.location.hash).quick && window.location.hash !== target) window.location.hash = target
    },
    introDone: () => {
      storage.set(KEYS.introSeen, true)
      setIntroPlaying(false)
    },
    back: () => setCard(null),
  }

  const onReady = useCallback((game) => {
    gameRef.current = game
  }, [])

  useEffect(() => {
    const onHash = () => {
      const { room, quick } = parseHash(window.location.hash)
      if (quick) {
        setQuickOpen(true)
        return
      }
      setQuickOpen(false)
      if (room !== roomRef.current) gameRef.current?.goTo(room, { kind: 'crossfade' })
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    gameRef.current?.setPaused(quickOpen)
  }, [quickOpen])

  const openQuick = () => {
    setQuickOpen(true)
    window.location.hash = hashFor(roomRef.current, true)
  }
  const closeQuick = useCallback(() => {
    setQuickOpen(false)
    window.location.hash = hashFor(roomRef.current)
  }, [])
  const toggleSound = () => {
    const next = !soundOn
    setSoundOn(next)
    storage.set(KEYS.soundOn, next)
    gameRef.current?.setSoundOn(next)
  }
  const replayIntro = () => {
    if (gameRef.current?.replayIntro()) setIntroPlaying(true)
  }

  return (
    <div className="app">
      <a className="skip-link" href="#/quick">Skip to text version</a>
      <header className="top-bar">
        <h1 className="site-title">Srilekha's Gallery</h1>
        <CornerMenu soundOn={soundOn} onToggleSound={toggleSound} onReplayIntro={replayIntro} onQuickView={openQuick} />
      </header>

      <main className="stage">
        <GameCanvas options={options} handlers={handlers} onReady={onReady}>
          <SpeechBubble text={bubble} pos={avatarPos} />
          {introPlaying && <SkipButton onSkip={() => gameRef.current?.skipIntro()} />}
        </GameCanvas>
        <div className="card-slot">
          <InfoCard card={card} onClose={() => setCard(null)} />
        </div>
      </main>

      {isTouch && <TouchControls onPress={(a) => gameRef.current?.press(a)} onRelease={(a) => gameRef.current?.release(a)} />}

      <div role="status" aria-live="polite" className="visually-hidden">
        {bubble}
        {card ? ` ${card.title}. ${card.subtitle}` : ''}
      </div>

      {quickOpen && <QuickView data={data} onClose={closeQuick} />}
    </div>
  )
}
```

`TouchControls` is built in Task 15; create a placeholder so the import resolves now:

`src/ui/TouchControls.jsx`:
```jsx
export default function TouchControls() {
  return null
}
```

- [ ] **Step 5: Update entry files**

`src/main.jsx`:
```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

`index.html` — replace the Raleway font link and title:
```html
    <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Pixelify+Sans:wght@400;600&display=swap" rel="stylesheet">
    <meta name="description" content="Srilekha Mamidala's pixel-art gallery portfolio: MIT CS, Data Science & Economics.">
    <title>Srilekha's Gallery</title>
```

- [ ] **Step 6: Write `src/styles/global.css`**

```css
:root {
  --bg: #120e18;
  --panel: #f4e6c8;
  --ink: #2a1f14;
  --maroon: #8a1f2b;
  --gold: #d4a93a;
  --gold-dark: #8a6420;
  --accent: #9ee6c1;
  --pixel: 'Press Start 2P', monospace;
  --body: 'Pixelify Sans', system-ui, sans-serif;
}
* { box-sizing: border-box; }
html, body { margin: 0; background: var(--bg); color: var(--panel); font-family: var(--body); overflow-x: hidden; }
body { min-height: 100vh; }
.app { display: flex; flex-direction: column; align-items: center; min-height: 100vh; padding: 0 16px; }
.top-bar { width: 100%; max-width: 1280px; display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 12px 0; }
.site-title { font-family: var(--pixel); font-size: 14px; margin: 0; color: var(--gold); }
.corner-menu { display: flex; gap: 8px; }
.stage { display: flex; flex-direction: column; align-items: center; gap: 12px; width: 100%; }
.canvas-box { position: relative; max-width: 100%; }
.game-canvas { display: block; width: 100%; height: 100%; image-rendering: pixelated; image-rendering: crisp-edges; touch-action: manipulation; }
.pixel-border { border: 4px solid var(--ink); box-shadow: 0 0 0 4px var(--gold), 6px 6px 0 4px rgba(0, 0, 0, 0.5); }
.pixel-button {
  font-family: var(--pixel); font-size: 10px; color: var(--ink); background: var(--panel); border: 3px solid var(--ink);
  box-shadow: 3px 3px 0 var(--gold-dark); padding: 8px 10px; cursor: pointer; text-decoration: none; display: inline-block;
}
.pixel-button:active { transform: translate(2px, 2px); box-shadow: 1px 1px 0 var(--gold-dark); }
.pixel-button:focus-visible, a:focus-visible { outline: 3px dashed var(--accent); outline-offset: 2px; }
.speech-bubble {
  position: absolute; transform: translate(-50%, calc(-100% - 8px)); max-width: min(320px, 80%); background: #fffdf5; color: var(--ink);
  font-family: var(--pixel); font-size: 10px; line-height: 1.6; padding: 10px 12px; pointer-events: none; animation: pop 0.15s steps(3);
}
.skip-button { position: absolute; right: 12px; bottom: 12px; }
.card-slot { width: 100%; max-width: 720px; min-height: 40px; }
.info-card { position: relative; background: var(--panel); color: var(--ink); padding: 16px; max-height: 45vh; overflow-y: auto; animation: slide-up 0.2s steps(4); font-size: 16px; line-height: 1.45; }
.info-card__close { position: absolute; top: 8px; right: 8px; font-family: var(--pixel); background: none; border: 0; cursor: pointer; color: var(--ink); }
.info-card__title { font-family: var(--pixel); font-size: 13px; line-height: 1.5; margin: 0 24px 6px 0; color: var(--maroon); }
.info-card__subtitle { font-weight: 600; margin: 0 0 4px; }
.info-card__meta { opacity: 0.75; margin: 0 0 8px; }
.info-card__image { float: right; width: 120px; margin: 0 0 8px 12px; image-rendering: pixelated; border: 3px solid var(--ink); }
.info-card__tags { list-style: none; padding: 0; display: flex; flex-wrap: wrap; gap: 6px; }
.tag { font-family: var(--pixel); font-size: 8px; background: var(--maroon); color: #fff; padding: 4px 6px; }
.info-card .pixel-button { margin: 8px 8px 0 0; }
.quick-view { position: fixed; inset: 0; background: rgba(18, 14, 24, 0.85); overflow-y: auto; padding: 24px 16px; z-index: 10; }
.quick-view__paper { max-width: 760px; margin: 0 auto; background: #fbf3e0; color: var(--ink); padding: 24px; border: 4px solid var(--ink); box-shadow: 0 0 0 4px var(--gold); line-height: 1.5; font-size: 17px; }
.quick-view h1, .quick-view h2 { font-family: var(--pixel); color: var(--maroon); }
.quick-view h1 { font-size: 16px; margin: 0 0 6px; }
.quick-view h2 { font-size: 12px; margin-top: 28px; border-bottom: 3px dashed var(--gold); padding-bottom: 6px; }
.quick-view h3 { margin: 12px 0 2px; font-size: 18px; }
.quick-view__header { display: flex; gap: 16px; align-items: center; }
.quick-view__headshot { width: 88px; height: 88px; object-fit: cover; border: 3px solid var(--ink); }
.quick-view__meta { opacity: 0.75; margin: 0; }
.quick-view__close { float: right; }
.quick-view a { color: var(--maroon); }
.visually-hidden { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.skip-link { position: absolute; left: -9999px; }
.skip-link:focus { left: 16px; top: 8px; z-index: 20; background: var(--panel); color: var(--ink); padding: 8px; }
@keyframes pop { from { transform: translate(-50%, calc(-100% - 8px)) scale(0.6); } }
@keyframes slide-up { from { transform: translateY(16px); opacity: 0; } }
@media (prefers-reduced-motion: reduce) {
  .speech-bubble, .info-card { animation: none; }
}
@media (max-width: 600px) {
  .site-title { font-size: 10px; }
  .corner-menu .pixel-button { padding: 6px; font-size: 9px; }
  .speech-bubble { font-size: 8px; padding: 8px; }
  .info-card { max-height: none; }
}
```

- [ ] **Step 7: Run tests**

Run: `npx vitest run`
Expected: PASS (App tests + all earlier suites).

- [ ] **Step 8: Verify in the browser**

Run: `npm run dev` and open `http://localhost:3000/srilekhamamidala/`.
Check, in a fresh private window (so the intro plays):
1. Pixels pop in randomly, sky first; "Welcome!" twinkles in; painting zooms into a small gold frame on the wall; avatar sparkles in with the welcome bubble.
2. ← → walks; walking dismisses the bubble; camera follows; nameplates read ABOUT / PROJECTS / EXPERIENCE / CONTACT.
3. Near Projects: "Press Enter to step into Projects!"; Enter → zoom + ripple + white flash → Projects room.
4. In Projects, walking past frames opens/closes info cards with pixelated thumbnails; at the end, tiles HOME / ABOUT / EXPERIENCE / CONTACT; standing on one shows "Press Enter to go to …!".
5. HOME tile → room folds into a frame with dust, hall settles, avatar appears in front of the Projects painting.
6. Reload: no intro. `#/experience` deep link loads straight into Experience. Browser Back crossfades rooms.
7. 📜 Quick view opens, Esc closes, URL toggles `#/quick`.
Fix anything broken before committing; note visual tweaks (colours, spacing) you made in the commit message.

- [ ] **Step 9: Commit**

```bash
git add index.html src/main.jsx src/App.jsx src/App.test.jsx src/ui src/styles
git commit -m "Mount the gallery engine with overlays, menu, and hash routing"
```

---

### Task 14: Chiptune audio

**Files:**
- Modify: `src/engine/audio.js` (replace the Task 11 stub)
- Test: `src/engine/audio.test.js`

**Interfaces:**
- Produces: `createAudio({ AudioCtx? }) → { enabled, setEnabled(on), sfx(name: 'step'|'pop'|'card'|'whoosh'|'sparkle'), destroy() }`. Also used by App: none (App goes through `game.setSoundOn`).

- [ ] **Step 1: Write the failing test** — `src/engine/audio.test.js`:

```js
import { describe, it, expect, vi, afterEach } from 'vitest'
import { createAudio } from './audio.js'

function fakeAudioCtx() {
  const oscillators = []
  class Param { setValueAtTime() {} exponentialRampToValueAtTime() {} }
  class Ctx {
    constructor() { this.currentTime = 0; this.destination = {}; this.state = 'running' }
    createGain() { return { gain: Object.assign(new Param(), { value: 1 }), connect: (n) => n } }
    createOscillator() {
      const o = { type: '', frequency: { value: 0 }, connect: (n) => n, start: vi.fn(), stop: vi.fn() }
      oscillators.push(o)
      return o
    }
    resume() { return Promise.resolve() }
    close() { return Promise.resolve() }
  }
  return { Ctx, oscillators }
}

afterEach(() => vi.useRealTimers())

describe('audio', () => {
  it('is silent and safe without WebAudio', () => {
    const a = createAudio({ AudioCtx: undefined })
    expect(() => { a.setEnabled(true); a.sfx('pop'); a.destroy() }).not.toThrow()
  })
  it('starts disabled and plays nothing', () => {
    const { Ctx, oscillators } = fakeAudioCtx()
    const a = createAudio({ AudioCtx: Ctx })
    a.sfx('pop')
    expect(a.enabled).toBe(false)
    expect(oscillators).toHaveLength(0)
  })
  it('plays SFX and music once enabled, and stops music when disabled', () => {
    vi.useFakeTimers()
    const { Ctx, oscillators } = fakeAudioCtx()
    const a = createAudio({ AudioCtx: Ctx })
    a.setEnabled(true)
    a.sfx('card')
    const afterSfx = oscillators.length
    expect(afterSfx).toBeGreaterThan(0)
    vi.advanceTimersByTime(1000)
    const afterMusic = oscillators.length
    expect(afterMusic).toBeGreaterThan(afterSfx)
    a.setEnabled(false)
    vi.advanceTimersByTime(1000)
    expect(oscillators.length).toBe(afterMusic)
  })
  it('ignores unknown effect names', () => {
    const { Ctx } = fakeAudioCtx()
    const a = createAudio({ AudioCtx: Ctx }); a.setEnabled(true)
    expect(() => a.sfx('nope')).not.toThrow()
    a.destroy()
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run src/engine/audio.test.js`
Expected: FAIL — the stub never creates oscillators.

- [ ] **Step 3: Implement** — `src/engine/audio.js`:

```js
const NOTES = { E4: 329.63, G4: 392, A4: 440, C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99 }
const MELODY = ['C5', 'E5', 'G5', 'E5', 'A4', 'C5', 'E5', 'C5', 'G4', 'C5', 'D5', 'G4', 'E4', 'G4', 'C5', 'G4']
const BEAT_MS = 220

export function createAudio({ AudioCtx = globalThis.AudioContext || globalThis.webkitAudioContext } = {}) {
  let ctx = null
  let master = null
  let enabled = false
  let timer = null
  let step = 0

  function ensure() {
    if (!AudioCtx) return false
    if (!ctx) {
      ctx = new AudioCtx()
      master = ctx.createGain()
      master.gain.value = 0.08
      master.connect(ctx.destination)
    }
    return true
  }

  function blip(freq, dur, type = 'square', vol = 1, delay = 0) {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const t0 = ctx.currentTime + delay
    osc.type = type
    osc.frequency.value = freq
    gain.gain.setValueAtTime(vol, t0)
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur)
    osc.connect(gain).connect(master)
    osc.start(t0)
    osc.stop(t0 + dur)
  }

  const SFX = {
    step: () => blip(180, 0.04, 'square', 0.2),
    pop: () => blip(880 + Math.random() * 400, 0.05, 'square', 0.25),
    card: () => { blip(660, 0.06); blip(990, 0.08, 'square', 0.5, 0.06) },
    whoosh: () => { for (let i = 0; i < 8; i++) blip(300 + i * 120, 0.08, 'sawtooth', 0.3, i * 0.04) },
    sparkle: () => { for (let i = 0; i < 4; i++) blip(1200 + i * 300, 0.06, 'triangle', 0.3, i * 0.05) },
  }

  function stopMusic() {
    if (timer) clearInterval(timer)
    timer = null
  }
  function startMusic() {
    stopMusic()
    timer = setInterval(() => {
      const note = NOTES[MELODY[step % MELODY.length]]
      blip(note, 0.18, 'triangle', 0.6)
      if (step % 4 === 0) blip(note / 2, 0.35, 'square', 0.25)
      step++
    }, BEAT_MS)
  }

  return {
    get enabled() {
      return enabled
    },
    setEnabled(on) {
      enabled = !!on
      if (!enabled) {
        stopMusic()
        return
      }
      if (!ensure()) return
      ctx.resume?.()
      startMusic()
    },
    sfx(name) {
      if (!enabled || !ctx) return
      SFX[name]?.()
    },
    destroy() {
      stopMusic()
      ctx?.close?.()
      ctx = null
    },
  }
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npx vitest run src/engine/audio.test.js`
Expected: PASS.

- [ ] **Step 5: Browser check** — `npm run dev`; toggle 🔇 → 🔊: music starts; footsteps, card blips, portal whoosh audible; toggle off silences immediately; reload keeps the setting (sound resumes on first key/click because browsers block autoplay — acceptable).

- [ ] **Step 6: Commit**

```bash
git add src/engine/audio.js src/engine/audio.test.js
git commit -m "Add chiptune music and sound effects (off by default)"
```

---

### Task 15: Touch controls, phone layout, reduced motion check

**Files:**
- Modify: `src/ui/TouchControls.jsx` (replace placeholder), `src/styles/global.css` (append)
- Test: `src/ui/TouchControls.test.jsx`

**Interfaces:**
- Consumes: `game.press(action)`, `game.release(action)` (Task 11) via App props `onPress` / `onRelease` (Task 13).
- Produces: `<TouchControls onPress onRelease />`.

- [ ] **Step 1: Write the failing test** — `src/ui/TouchControls.test.jsx`:

```jsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import TouchControls from './TouchControls.jsx'

describe('TouchControls', () => {
  it('holds direction while pressed and releases on up, leave, or cancel', () => {
    const onPress = vi.fn(), onRelease = vi.fn()
    render(<TouchControls onPress={onPress} onRelease={onRelease} />)
    const left = screen.getByRole('button', { name: /walk left/i })
    fireEvent.pointerDown(left); expect(onPress).toHaveBeenLastCalledWith('left')
    fireEvent.pointerUp(left); expect(onRelease).toHaveBeenLastCalledWith('left')
    const right = screen.getByRole('button', { name: /walk right/i })
    fireEvent.pointerDown(right); fireEvent.pointerLeave(right)
    expect(onRelease).toHaveBeenLastCalledWith('right')
    fireEvent.pointerDown(right); fireEvent.pointerCancel(right)
    expect(onRelease).toHaveBeenCalledTimes(3)
  })
  it('A button interacts', () => {
    const onPress = vi.fn(), onRelease = vi.fn()
    render(<TouchControls onPress={onPress} onRelease={onRelease} />)
    const a = screen.getByRole('button', { name: /interact/i })
    fireEvent.pointerDown(a); fireEvent.pointerUp(a)
    expect(onPress).toHaveBeenCalledWith('interact')
    expect(onRelease).toHaveBeenCalledWith('interact')
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run src/ui/TouchControls.test.jsx`
Expected: FAIL — placeholder renders nothing.

- [ ] **Step 3: Implement** — `src/ui/TouchControls.jsx`:

```jsx
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
```

Append to `src/styles/global.css`:
```css
.touch-controls {
  position: fixed; left: 0; right: 0; bottom: 0; display: flex; justify-content: space-between; align-items: center;
  padding: 12px 16px calc(12px + env(safe-area-inset-bottom)); pointer-events: none; z-index: 5;
}
.touch-controls__dpad { display: flex; gap: 12px; }
.touch-button { pointer-events: auto; width: 64px; height: 64px; font-size: 18px; user-select: none; -webkit-user-select: none; touch-action: none; }
.touch-button--a { border-radius: 50%; background: var(--maroon); color: #fff; }
@media (pointer: coarse) {
  .app { padding-bottom: 104px; }
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npx vitest run`
Expected: PASS.

- [ ] **Step 5: Device checks** — `npm run dev -- --host`, then:
1. Chrome DevTools device mode, iPhone 12 Pro (390×844): canvas fills the width minus 16px gutters, card appears below the canvas, ◀ ▶ A at the bottom, no horizontal scroll, bubbles say "Tap A…" / "Use ◀ ▶ to walk".
2. Tap a frame on the canvas → avatar walks there and the card opens.
3. Rotate to landscape and back: canvas refits.
4. macOS System Settings → Accessibility → Display → Reduce motion ON: intro is a short fade; portals crossfade.
5. Keyboard-only: Tab reaches "Skip to text version", menu buttons, card links; focus ring visible.

- [ ] **Step 6: Commit**

```bash
git add src/ui/TouchControls.jsx src/ui/TouchControls.test.jsx src/styles/global.css
git commit -m "Add touch controls and phone layout"
```

---

### Task 16: Cleanup, production build, deploy readiness

**Files:**
- Delete: `backend/`, `.github/workflows/static.yml`, `frontend/src/pages/`, `frontend/src/components/`, `frontend/src/App.css`, `frontend/src/index.css`, `frontend/public/404.html`, `frontend/public/proejcts.jpg`, `frontend/public/projectsactual.avif`, `frontend/public/projectsactual.jpg`, `frontend/public/projectsactual.webp`, `frontend/public/website.webp`
- Modify: `frontend/package.json` (remove `axios`, `react-router-dom`), `README.md`

- [ ] **Step 1: Confirm nothing references what is being deleted**

Run (from repo root):
```bash
grep -rnE "react-router|axios|pages/|components/Navbar|App.css|index.css|proejcts|projectsactual|website.webp" frontend/src frontend/index.html
```
Expected: no output. If anything prints, fix that reference first.

- [ ] **Step 2: Delete and uninstall**

```bash
git rm -r -q backend .github/workflows/static.yml frontend/src/pages frontend/src/components frontend/src/App.css frontend/src/index.css frontend/public/404.html frontend/public/proejcts.jpg frontend/public/projectsactual.avif frontend/public/projectsactual.jpg frontend/public/projectsactual.webp frontend/public/website.webp
cd frontend && npm uninstall axios react-router-dom
```

- [ ] **Step 3: Update `README.md`** — replace its contents with:

```markdown
# Srilekha's Gallery

A pixel-art museum portfolio: walk the gallery, step into paintings, and read about projects and experience.

- Live: https://srilekha511.github.io/srilekhamamidala/
- Text version: https://srilekha511.github.io/srilekhamamidala/#/quick

## Develop

    cd frontend
    npm install
    npm run dev      # http://localhost:3000/srilekhamamidala/
    npm test

## Edit content

All text lives in `frontend/src/data.js` (profile, education, skills, interests, experience, projects).
Project images go in `frontend/public/` and are referenced as `/filename.png`.

## Deploy

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds `frontend/` and publishes `dist/` to GitHub Pages.
```

- [ ] **Step 4: Full test run**

Run: `cd frontend && npx vitest run`
Expected: PASS, all suites.

- [ ] **Step 5: Production build under the real base path**

```bash
cd frontend
VITE_REPO_NAME=srilekhamamidala npm run build
test -f dist/404.html && echo "404 ok"
grep -o 'src="/srilekhamamidala/assets/[^"]*"' dist/index.html
npx vite preview --port 4173
```
Expected: build succeeds, prints `404 ok` and a `/srilekhamamidala/assets/...js` path. Open `http://localhost:4173/srilekhamamidala/` and confirm in DevTools → Network that there are **no 404s** (every project thumbnail and the headshot load), the intro plays in a private window, and `http://localhost:4173/srilekhamamidala/#/contact` deep-links. Also open `http://localhost:4173/srilekhamamidala/some/bad/path` and confirm the gallery still loads (GitHub Pages serves `404.html`, a copy of `index.html`, for unknown paths).

- [ ] **Step 6: Commit**

```bash
cd /Users/srilekhamamidala/srilekhamamidala
git add -A
git commit -m "Remove old site, backend, and duplicate Pages workflow; update README"
```

- [ ] **Step 7: Hand off** — do **not** merge or push to `main`. Report to Srilekha: branch `retro-gallery` is ready, how to run it locally (`npm run dev`), the preview checklist results, and that merging to `main` will deploy it. Remind them the Contact email in `data.js` is still the placeholder if it hasn't been updated.
