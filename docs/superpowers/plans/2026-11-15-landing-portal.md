# Landing Page with a Museum Portal: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `srilekha.dev` opens on a calm, readable landing page; clicking a pixel Starry Night portal lazily loads the pixel museum and zooms into its main hall.

**Architecture:** `App.jsx` becomes a small shell that owns the route (landing vs museum), the theme, and the Quick view overlay. Today's App body moves into `Museum.jsx`, loaded with `React.lazy` so the game engine is fetched only on entry. The game director gains an option to start its intro at the zoom phase.

**Tech Stack:** React 18, Vite 5, Vitest + Testing Library (jsdom), plain CSS.

**Spec:** `docs/superpowers/specs/2026-11-15-landing-portal-design.md`

All paths below are relative to `frontend/`. Run tests with `npx vitest run <file>` from `frontend/`.

## Global Constraints

- Bare URL (`''`, `#`, `#/`) = landing. `#/hall` = museum hall. `#/about|research|projects|experience|contact` = museum room. `#/quick` = full text brochure overlay.
- Unknown hashes (`#/foo`) show the landing (the front door), not the hall.
- The game engine (`engine/game.js` and friends) must not be in the landing's initial chunk. `engine/paintings/starryNight.js` is fine to import (no imports of its own).
- Palette: cream / maroon / gold via the existing CSS tokens (`--bg`, `--panel`, `--ink`, `--heading`, `--gold`, `--gold-dark`, `--maroon`), dark mode via `:root[data-theme='dark']`.
- Running text in Inter (`'Inter', system-ui, sans-serif`); Press Start 2P only for the portal caption and small section labels.
- Intro on portal click: full (reveal + welcome + hold + zoom) if `rg.introSeen` is not set, otherwise zoom only. Deep links and Back/Forward into the museum: no intro. Reduced motion: the existing short fade, regardless.
- Portal caption copy: `step inside the gallery →`. Heading copy: `hi, i'm srilekha`. Subheading: `i study cs, data science & econ at mit. currently, i'm:`.

## Review Focus

1. **Back from the museum to the landing, then Forward again:** the museum should remount at the right room with no intro, and no error from a stale game. Test in Task 5.
2. **`#/quick` opened from the landing:** the brochure shows without loading the museum, and closing it returns to the landing (not the hall). Test in Task 5.
3. **Keyboard users:** the portal is a `<button>` reachable by Tab and activated by Enter/Space. Test in Task 4.
4. **Theme chosen on the landing carries into the museum** (and vice versa), since both read the same `rg.theme`. Test in Task 5.
5. **Featured ids that don't exist in `data.js`** (after she renames or deletes an entry) are skipped, not rendered as blank rows or a crash. Test in Task 3.

---

### Task 1: Routing knows about the landing

**Files:**
- Modify: `src/routing.js`
- Test: `src/routing.test.js`

**Interfaces:**
- Produces: `parseHash(hash) -> { view: 'landing' | 'museum', room: RoomId, quick: boolean }`; `hashFor(room, quick = false) -> string` (hall is now `'#/hall'`); `LANDING_HASH = ''`. `urlWithHash`, `urlMatchesHash`, `ROOM_IDS` are unchanged.

- [ ] **Step 1: Rewrite the routing tests**

```js
it('the bare URL and unknown hashes are the landing', () => {
  for (const h of ['', '#', '#/', '#/foo', '#/projects/2', undefined])
    expect(parseHash(h)).toEqual({ view: 'landing', room: 'hall', quick: false })
})
it('parses the hall and rooms as the museum', () => {
  expect(parseHash('#/hall')).toEqual({ view: 'museum', room: 'hall', quick: false })
  expect(parseHash('#/Experience')).toEqual({ view: 'museum', room: 'experience', quick: false })
  expect(parseHash('#/about/')).toEqual({ view: 'museum', room: 'about', quick: false })
})
it('recognises the quick view', () => {
  expect(parseHash('#/quick')).toEqual({ view: 'landing', room: 'hall', quick: true })
})
it('builds hashes', () => {
  expect(hashFor('hall')).toBe('#/hall')
  expect(hashFor('contact')).toBe('#/contact')
  expect(hashFor('projects', true)).toBe('#/quick')
})
```

- [ ] **Step 2: Run, expect FAIL** (`npx vitest run src/routing.test.js`): `view` missing and `hashFor('hall')` returns `''`.
- [ ] **Step 3: Update `parseHash`/`hashFor`, and export `LANDING_HASH = ''`.**
- [ ] **Step 4: Run, expect PASS.** (App tests will break until Task 5; that is expected.)
- [ ] **Step 5: Commit** `git commit -m "Route the bare URL to a landing page; the hall moves to #/hall"`

### Task 2: The intro can start at the zoom

**Files:**
- Modify: `src/engine/director.js`, `src/engine/game.js` (pass-through only)
- Test: `src/engine/director.test.js`

**Interfaces:**
- Produces: `createDirector({ room, playIntro, reducedMotion, introFrom = 'start' })` where `introFrom: 'start' | 'zoom'`. `createGame({ ..., introFrom })` forwards it. `INTRO_ZOOM_START = INTRO.reveal + INTRO.welcome + INTRO.hold` exported from `director.js`.

- [ ] **Step 1: Write the failing tests**

```js
it('can start the intro at the zoom', () => {
  const d = createDirector({ playIntro: true, introFrom: 'zoom' })
  expect(introPhase(d.state.t).phase).toBe('zoom')
  expect(d.tick(INTRO.zoom + 0.01)).toEqual([{ type: 'introDone' }])
})
it('ignores introFrom under reduced motion', () => {
  const d = createDirector({ playIntro: true, introFrom: 'zoom', reducedMotion: true })
  expect(d.state.t).toBe(0)
})
```

- [ ] **Step 2: Run, expect FAIL** (`npx vitest run src/engine/director.test.js`).
- [ ] **Step 3: Set the initial `state.t` to `INTRO_ZOOM_START` when `playIntro && introFrom === 'zoom' && !reducedMotion`; add `introFrom` to `createGame`'s options and pass it to `createDirector`.**
- [ ] **Step 4: Run the full suite except App** (`npx vitest run src/engine`), expect PASS.
- [ ] **Step 5: Commit** `git commit -m "Let the intro start at the zoom into the hall"`

### Task 3: Featured work for the landing

**Files:**
- Modify: `src/data.js` (add `featured`)
- Create: `src/featured.js`
- Test: `src/featured.test.js`

**Interfaces:**
- Produces: `data.featured: Array<string | number>` (experience ids are strings, project ids are numbers). `featuredItems(data) -> Array<{ key: string, title: string, note: string, href: string, external: boolean }>`.

`featured` starting value: `['disney', 'acronym', 10, 13, 'csail', 'medialab']`, with a comment saying it controls the landing's "selected work" list and order.

Resolution rules: an experience entry gives `title = company`, `note = role`, `href = '#/' + room`, `external = false`. A project gives `title = title`, `note = category`, `href = link` with `external = true` when it has a link, otherwise `'#/' + room` with `external = false`. Unknown ids are skipped.

- [ ] **Step 1: Write the failing tests**

```js
const data = {
  featured: ['disney', 10, 'nope', 99, 7],
  experience: [{ id: 'disney', room: 'experience', company: 'Disney Streaming', role: 'Software Engineering Intern' }],
  projects: [
    { id: 10, room: 'projects', title: 'HackMIT Hardware Hub', category: 'Full Stack', link: 'https://hardware.hackmit.org/' },
    { id: 7, room: 'research', title: 'Epilepsy ML', category: 'ML Research' },
  ],
}
it('resolves experience and projects in the listed order, skipping unknown ids', () => {
  expect(featuredItems(data)).toEqual([
    { key: 'disney', title: 'Disney Streaming', note: 'Software Engineering Intern', href: '#/experience', external: false },
    { key: '10', title: 'HackMIT Hardware Hub', note: 'Full Stack', href: 'https://hardware.hackmit.org/', external: true },
    { key: '7', title: 'Epilepsy ML', note: 'ML Research', href: '#/research', external: false },
  ])
})
it('every id in the real data resolves', async () => {
  const real = await import('./data.js')
  expect(featuredItems(real)).toHaveLength(real.featured.length)
})
```

- [ ] **Step 2: Run, expect FAIL** (module missing).
- [ ] **Step 3: Implement `featuredItems` and add `featured` to `data.js`.**
- [ ] **Step 4: Run, expect PASS.**
- [ ] **Step 5: Commit** `git commit -m "Choose featured work for the landing page"`

### Task 4: The landing page

**Files:**
- Create: `src/ui/Landing.jsx`, `src/ui/PortalPainting.jsx`, `src/styles/landing.css` (imported by `Landing.jsx`)
- Modify: `index.html` (add Inter 400/600/700 to the existing Google Fonts link)
- Test: `src/ui/Landing.test.jsx`

**Interfaces:**
- Consumes: `featuredItems(data)` (Task 3); `generateStarryNight()` from `src/engine/paintings/starryNight.js` (returns `{ width, height, pixels }`); `RichText` from `src/ui/RichText.jsx` (renders `**bold**`).
- Produces: `<Landing data dark onToggleTheme onEnter />`, where `onEnter()` is called when the portal is activated. `<PortalPainting onEnter />` is a `<button aria-label="Step inside the gallery">` holding a `<canvas>` painted once from `generateStarryNight()` (CSS `image-rendering: pixelated`), plus the caption.

Layout (spec "Landing page content"): a header with the name and a theme toggle (same aria-labels as the museum: `Switch to dark mode` / `Switch to light mode`); the `hi, i'm srilekha` `<h1>`; the subheading; the `now.items` list; a `selected work` `<h2>` with one `<li>` per featured item (title as a link, then ` · ` and the note; external links get `target="_blank" rel="noopener noreferrer"`); the portal; and a footer with email (`mailto:`), GitHub, LinkedIn, `full text version` (`#/quick`), plus `resume` only when `data.profile.resume` is set. Desktop (≥ 900px): two columns, text left and portal right, vertically centred. Narrower: one column with the portal between the subheading list and selected work. Max text width about 36rem. The portal has a slow gold shimmer on its frame, disabled under `prefers-reduced-motion`.

- [ ] **Step 1: Write the failing tests**

```js
it('greets and lists what she is doing now', () => {
  render(<Landing data={data} onEnter={() => {}} onToggleTheme={() => {}} />)
  expect(screen.getByRole('heading', { level: 1 }).textContent).toBe("hi, i'm srilekha")
  expect(screen.getByText(/LLM memory/)).toBeTruthy()
})
it('lists selected work with working links', () => {
  render(<Landing data={data} onEnter={() => {}} onToggleTheme={() => {}} />)
  const hub = screen.getByRole('link', { name: 'HackMIT Hardware Hub' })
  expect(hub.getAttribute('href')).toBe('https://hardware.hackmit.org/')
  expect(hub.getAttribute('target')).toBe('_blank')
  expect(screen.getByRole('link', { name: 'full text version' }).getAttribute('href')).toBe('#/quick')
})
it('the portal is a keyboard-reachable button that enters the gallery', () => {
  const onEnter = vi.fn()
  render(<Landing data={data} onEnter={onEnter} onToggleTheme={() => {}} />)
  const portal = screen.getByRole('button', { name: 'Step inside the gallery' })
  portal.focus()
  expect(document.activeElement).toBe(portal)
  fireEvent.click(portal)
  expect(onEnter).toHaveBeenCalledTimes(1)
})
it('shows a resume link only when one is configured', () => {
  const { rerender } = render(<Landing data={data} onEnter={() => {}} onToggleTheme={() => {}} />)
  expect(screen.queryByRole('link', { name: 'resume' })).toBe(null)
  rerender(<Landing data={{ ...data, profile: { ...data.profile, resume: '/resume.pdf' } }} onEnter={() => {}} onToggleTheme={() => {}} />)
  expect(screen.getByRole('link', { name: 'resume' }).getAttribute('href')).toBe('/resume.pdf')
})
```

(`data` is `import * as data from '../data.js'`. jsdom has no canvas 2D context, so `PortalPainting` must guard on `getContext('2d')` returning null.)

- [ ] **Step 2: Run, expect FAIL** (`npx vitest run src/ui/Landing.test.jsx`).
- [ ] **Step 3: Implement `Landing`, `PortalPainting`, `landing.css`, and the Inter font link.**
- [ ] **Step 4: Run, expect PASS.**
- [ ] **Step 5: Commit** `git commit -m "Add a readable landing page with a Starry Night portal"`

### Task 5: App shell, lazy museum, and entering through the portal

**Files:**
- Create: `src/Museum.jsx` (today's `App.jsx` body), `src/Museum.test.jsx` (today's `App.test.jsx` cases, adapted)
- Modify: `src/App.jsx` (rewritten as the shell), `src/App.test.jsx` (new shell tests), `index.html` (OG/Twitter descriptions)

**Interfaces:**
- Consumes: `parseHash`/`hashFor`/`LANDING_HASH` (Task 1), `introFrom` game option (Task 2), `Landing` (Task 4).
- Produces:
  - `<Museum initialRoom intro theme onToggleTheme quickOpen onOpenQuick onHome />`, where `intro: 'full' | 'zoom' | 'none'`.
    - Museum maps `intro` to the game options: `playIntro = intro !== 'none'`, `introFrom = intro === 'zoom' ? 'zoom' : 'start'`.
    - It keeps the room, history, directory, passport, sound, stamps, bubble/card and live-region logic it has today.
    - Theme, the Quick view overlay and its open state now come from props.
    - `setPaused(quickOpen || passportOpen)`.
    - The `introDone` handler still sets `rg.introSeen`.
    - The site title becomes `<a href="/">` whose click calls `onHome()` (preventDefault).
  - `App` owns `theme`/`themeChoice` (same `rg.theme` logic as today) and `view` (`'landing' | 'museum'`).
    - It also owns `museumRoom`, `museumIntro` and `quickOpen`, and the `hashchange`/`popstate` listener that switches views.
    - A non-quick hash whose `view` differs from the current one switches view, entering the museum with `intro: 'none'`.
    - A `quick` hash only opens the overlay and never changes the view.
    - The museum keeps handling room changes within itself, as today.
    - `const Museum = lazy(() => import('./Museum.jsx'))`, rendered inside `<Suspense fallback={<div className="museum-loading" />}>`. That fallback is a full-screen `#120e18` box, so the hand-off into the intro is seamless.
  - `enterMuseum()` (the portal's `onEnter`) does three things:
    - picks `intro = storage.get(KEYS.introSeen) ? 'zoom' : 'full'`;
    - runs `history.pushState(null, '', urlWithHash('#/hall'))`;
    - sets `view = 'museum'`.
  - `goHome()` runs `history.pushState(null, '', urlWithHash(LANDING_HASH))` and sets `view = 'landing'`.
  - Quick view open/close moves up from the museum. Closing steps back when App pushed the `#/quick` entry, and otherwise replaces the URL with the current view's hash (`LANDING_HASH`, or the museum room's hash).

- [ ] **Step 1: Move the existing App tests into `src/Museum.test.jsx`.** Render `<Museum initialRoom="hall" intro=... theme="light" onToggleTheme={fn} quickOpen={false} onOpenQuick={fn} onHome={fn} />` with the same `GameCanvas` mock.
  - Map the old cases: first visit → `intro="full"`; intro seen → `intro="none"`; deep link → `initialRoom="projects" intro="none"`.
  - Hall-URL expectations change from "no #" to `#/hall`.
  - The theme and Quick-view tests move to App (Step 2).
  - Add: clicking the title calls `onHome`.
- [ ] **Step 2: Write the new `src/App.test.jsx`.** Mock `./ui/GameCanvas.jsx` as today, and use `findBy*` for anything inside the lazy museum.

```js
it('the bare URL shows the landing, not the game', () => {
  render(<App />)
  expect(screen.getByRole('heading', { level: 1, name: "hi, i'm srilekha" })).toBeTruthy()
  expect(screen.queryByTestId('game')).toBe(null)
})
it('the portal enters the museum at #/hall with the full intro on a first visit', async () => {
  render(<App />)
  fireEvent.click(screen.getByRole('button', { name: 'Step inside the gallery' }))
  expect(await screen.findByTestId('game')).toBeTruthy()
  expect(window.location.hash).toBe('#/hall')
  expect(lastGameOptions.playIntro).toBe(true)
  expect(lastGameOptions.introFrom).toBe('start')
})
it('later portal visits play only the zoom', async () => {
  window.localStorage.setItem('rg.introSeen', 'true')
  render(<App />)
  fireEvent.click(screen.getByRole('button', { name: 'Step inside the gallery' }))
  await screen.findByTestId('game')
  expect(lastGameOptions.introFrom).toBe('zoom')
})
it('deep links open the museum room with no intro', async () => {
  window.location.hash = '#/projects'
  render(<App />)
  await screen.findByTestId('game')
  expect(lastGameOptions).toMatchObject({ initialRoom: 'projects', playIntro: false })
})
it('Back from the museum returns to the landing, and Forward re-enters with no intro', async () => { /* Review Focus 1 */
  render(<App />)
  fireEvent.click(screen.getByRole('button', { name: 'Step inside the gallery' }))
  await screen.findByTestId('game')
  act(() => { window.history.replaceState(null, '', '/'); window.dispatchEvent(new PopStateEvent('popstate')) })
  expect(screen.getByRole('heading', { level: 1, name: "hi, i'm srilekha" })).toBeTruthy()
  act(() => { window.history.replaceState(null, '', '#/hall'); window.dispatchEvent(new PopStateEvent('popstate')) })
  await screen.findByTestId('game')
  expect(lastGameOptions.playIntro).toBe(false)
})
it('#/quick from the landing opens the brochure without loading the museum, and closing returns to the landing', () => { /* Review Focus 2 */
  render(<App />)
  fireEvent.click(screen.getByRole('link', { name: 'full text version' }))
  act(() => window.dispatchEvent(new HashChangeEvent('hashchange')))
  expect(screen.getByRole('dialog')).toBeTruthy()
  expect(screen.queryByTestId('game')).toBe(null)
  fireEvent.click(screen.getByRole('button', { name: /close brochure/i }))
  expect(screen.getByRole('heading', { level: 1, name: "hi, i'm srilekha" })).toBeTruthy()
})
it('a theme chosen on the landing carries into the museum', async () => { /* Review Focus 4 */
  render(<App />)
  fireEvent.click(screen.getByRole('button', { name: 'Switch to dark mode' }))
  fireEvent.click(screen.getByRole('button', { name: 'Step inside the gallery' }))
  await screen.findByTestId('game')
  expect(lastGameOptions.night).toBe(true)
  expect(screen.getByRole('button', { name: 'Switch to light mode' })).toBeTruthy()
})
```

(The `GameCanvas` mock records `props.options` into `lastGameOptions`. `beforeEach` resets the URL with `window.history.replaceState(null, '', '/')`.)

- [ ] **Step 3: Run both files, expect FAIL** (`npx vitest run src/App.test.jsx src/Museum.test.jsx`).
- [ ] **Step 4: Split `App.jsx` into the shell and `Museum.jsx` as described in Interfaces.** Also update the `og:description` and `twitter:description` in `index.html` to: `Srilekha Mamidala: MIT CS, Data Science & Economics. LLM evaluation research, ML and software engineering, and a pixel-art museum to explore.`
- [ ] **Step 5: Run the whole suite** (`npx vitest run`), expect all PASS. That includes `linkPreview.test.js`; if it pins the old description, update it to the new copy.
- [ ] **Step 6: Commit** `git commit -m "Open on the landing page; the portal lazily loads the museum"`

### Task 6: Check it in a real browser

**Files:** none (verification only)

- [ ] **Step 1: Build** (`npx vite build`). Expect success, and expect a separate chunk containing `game` code that is not referenced by the entry chunk's static imports. Check with `grep -l "createGame\|followCamera" dist/assets/*.js`: it should not be the `index-*.js` entry.
- [ ] **Step 2: Screenshot with Playwright.** Cover the landing at 1440×900 and on iPhone 13 (light and dark), the portal click through to the intro, and the hall at `#/hall`. Confirm:
  - the text is readable;
  - the portal is visible without scrolling on desktop;
  - the phone layout has no horizontal scroll;
  - the zoom lands in the hall.
- [ ] **Step 3: Fix anything found, re-run `npx vitest run`, and commit.**
