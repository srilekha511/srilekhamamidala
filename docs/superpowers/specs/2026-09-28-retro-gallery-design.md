# Retro Pixel Art Gallery — Personal Website Redesign

**Date:** 2026-09-28
**Status:** Awaiting review
**Branch:** `retro-gallery`
**Live site:** https://srilekha511.github.io/srilekhamamidala/

## 1. Intent

Replace the current conventional React site (Home / About / Projects pages) with a playful, pixelated retro-video-game experience framed as an art museum. Visitors walk a chibi pixel avatar of Srilekha through gallery rooms; each painting is a section or an item. The site must stay fast, static (GitHub Pages), and give non-playing visitors (e.g. recruiters) a plain one-page view of all content.

### Success criteria
- First-time visitors see a pixel-by-pixel reveal of a pixel-art *Starry Night* with "Welcome!" in the sky, which zooms out into the first (small, decorative) frame of the main hall.
- The avatar walks horizontally; approaching a section frame and pressing Enter warps (ripple portal) into that section's gallery.
- In section galleries, approaching an item frame shows an info card automatically.
- Each section room ends in a row of portal tiles (Home + other sections); standing on one prompts "Press Enter to go to X!" and Enter travels there. Going Home uses a distinct "fold back into the painting" effect.
- A Quick view brochure shows all content as plain, accessible text, reachable in one click and at `#/quick`.
- Works with keyboard on desktop and with on-screen/tap controls on phones.
- Deploys via the existing GitHub Actions workflow under base path `/srilekhamamidala/` with no broken assets.

### Out of scope
- Awards room (explicitly declined).
- Any backend or runtime API.
- Commissioned/external art — all pixel art is generated in code.

## 2. Decisions (from brainstorming)

| Topic | Decision |
|---|---|
| Main hall frames | Starry Night (small, decorative, first) → About → Projects → Experience → Contact |
| Avatar | Chibi pixel Srilekha: mid-length black hair, light brown skin, glasses, maroon MIT hoodie |
| Portal tiles | At the **end** of each section room; one per destination (Home + the other 3 sections); stepping on one makes the avatar say "Press Enter to go to X!" ("Tap A…" on touch) |
| Non-players | Always-visible 📜 Quick view brochure + "Skip ▶▶" on the intro |
| Sound | Chiptune music + SFX, **off by default**, toggle in corner |
| Intro frequency | Full intro on first visit only (localStorage); "Replay intro" in corner menu |
| Tech approach | React shell + custom Canvas 2D engine at 320×180 internal resolution; React DOM overlays for all text UI |

## 3. Architecture

```
frontend/src/
  main.jsx
  App.jsx                    – owns scene state; syncs URL hash (#/, #/about, #/projects, #/experience, #/contact, #/quick)
  data.js                    – ALL content: profile, about, education, skills, projects, experience, contact
  engine/
    loop.js                  – requestAnimationFrame loop, fixed-step update (1/60 s), render with interpolation-free draw
    input.js                 – keyboard + touch → unified state { left, right, interact, back }
    renderer.js              – 320×180 offscreen canvas; integer-scaled to viewport; imageSmoothingEnabled=false; CSS image-rendering: pixelated
    camera.js                – horizontal follow with smoothing; clamped to room bounds
    events.js                – tiny emitter: engine → React ("nearFrame", "leftFrame", "onTile", "offTile", "sceneChange", "introDone")
    pixelate.js              – loads an image and downsamples it to a small palette-reduced pixel thumbnail (cached)
    sprites/
      avatar.js              – idle (2 frames), walk (4 frames), facing L/R, spawn sparkle; 16×24 px
      frame.js               – gold/wood frame borders at arbitrary sizes, brass nameplate
      tiles.js               – portal tile (glowing, animated), with per-destination icon
      icons.js               – house, person, laptop, briefcase, envelope (8×8 / 16×16)
      font.js                – 5×7 pixel bitmap font for in-canvas text ("Welcome!", nameplates)
    paintings/
      starryNight.js         – ~160×100 color grid (procedurally drawn swirls, moon, stars, cypress, village) + "Welcome!"
      covers.js              – section cover paintings (About: pixel Srilekha portrait; Projects: laptop+brain; Experience: skyline+briefcase; Contact: envelope+heart)
    effects/                 – each a pure function of (ctx/pixels, progress 0→1, params)
      pixelReveal.js         – shuffled reveal order (sky-biased), pop flash per pixel
      zoomOut.js             – painting → framed thumbnail on wall
      rippleWarp.js          – concentric sine displacement + white flash (portal)
      homeFold.js            – room shrinks into frame while pixels scatter as dust, then hall settles
      crossfade.js           – reduced-motion fallback for all transitions
    audio.js                 – WebAudio synthesized chiptune loop + SFX (step, pop, whoosh, card); muted by default
  scenes/
    IntroScene.js            – reveal → hold → zoomOut → emits introDone
    HallScene.js             – generic walkable room: { id, theme, frames[], tiles[], width }
    rooms.js                 – builds MainHall, About, Projects, Experience, Contact configs from data.js
    transitions.js           – orchestrates effect sequences between scenes
  ui/
    GameCanvas.jsx           – mounts canvas, starts engine, bridges events → React state
    SpeechBubble.jsx         – pixel-bordered bubble anchored above avatar screen position
    InfoCard.jsx             – slides up near a frame: title, subtitle, dates, description, bullets, tags, links, image
    QuickView.jsx            – cream "museum brochure" overlay, full content from data.js
    CornerMenu.jsx           – 🔊/🔇 sound, 🎬 replay intro, 📜 quick view
    TouchControls.jsx        – ◀ ▶ A buttons, shown on coarse pointers
    SkipButton.jsx           – intro only
  storage.js                 – safe localStorage get/set (try/catch; falls back to in-memory)
  styles/                    – global.css (pixel font via Google Fonts "Press Start 2P" for headings, readable font for body), overlay styles
```

**Boundary rule:** the engine never touches the DOM besides its own canvas; React never draws on the canvas. They communicate only via `events.js` (engine → React) and a small command API (React → engine: `goTo(roomId)`, `replayIntro()`, `setMuted(b)`, `setPaused(b)`).

**One room type:** Main hall and all section rooms are `HallScene` instances configured from data. Adding a project = adding an entry in `data.js`.

## 4. Scenes & transitions

### 4.1 Intro (first visit, ~6 s)
1. Dark canvas-texture background.
2. Starry Night pixels appear in shuffled random order (biased so sky swirls fill before the village) over ~3.5 s; each pixel shows a 1-frame bright flash then its true color. Sparkle SFX if sound on.
3. "Welcome!" in the pixel font fades/twinkles into the sky.
4. 0.8 s hold, then zoom-out: painting shrinks, gold frame grows around it, it lands as the small first frame on the main hall wall; avatar spawns next to it with a sparkle.
5. "Skip ▶▶" visible throughout; jumps to end state of step 4.
6. On completion set `introSeen=true` in storage. Returning visitors load directly into the main hall (or the room in the URL hash).

### 4.2 Main hall
- Long wall (wainscoting, sconces, wooden floor). Frames L→R: Starry Night (small, ~60% size of section frames, decorative, non-interactive except a "It's Starry Night by Van Gogh — pixel edition!" bubble), About, Projects, Experience, Contact. Each section frame shows its cover painting and a brass nameplate.
- On entry, avatar speech bubble: *"Hi, I'm Srilekha! Welcome to my gallery ✨ Use ← → to walk, and step up to a painting to go inside."* (touch variant: "Use ◀ ▶ to walk…"). Dismissed on first movement.
- Near a section frame: *"Press Enter to step into {Section}!"*. Enter → portal ripple (camera zooms into frame, painting ripples outward, screen warps, white flash) → section room, avatar enters from the left.
- The main hall has no portal tiles (frames are the doors).

### 4.3 Section rooms
- Each room has its own wall color/theme. Frames hang along the wall, one per item; walking within proximity range of a frame automatically opens its InfoCard; leaving closes it. Only the nearest frame is ever active.
- Room end: row of portal tiles — 🏠 Home + the other three sections — each with icon and label.
- On a tile: *"Press Enter to go to {Destination}!"*. Enter → ripple portal to another section, or **home fold** to main hall (room shrinks into its painting, pixels scatter like dust, camera pulls back to main hall, painting settles on the wall, avatar pops out in front of it).
- Esc/back button closes an open card; it does not navigate.

| Room | Frames | Card content |
|---|---|---|
| About | Me, Education, Skills, Interests | Me: headshot + bio. Education: MIT, degree, expected June 2028, coursework, honors. Skills: grouped skills. Interests: short list (from bio/résumé themes: AI/ML, NLP research, venture/finance) |
| Projects | One per project in `data.js` (9) | Title, category, description, what I learned, tech tags, image(s), link |
| Experience | One per role (8, below) | Company, role, location, dates, bullets |
| Contact | Email, GitHub, LinkedIn, Résumé | Large clickable link. Résumé frame appears only if `public/resume.pdf` exists (flag in data.js) |

Frame thumbnails: projects use their real images pixelated via `pixelate.js`; experience frames use a pixel monogram of the company initials on a themed color; About/Contact frames use code-drawn icons (About "Me" uses the pixelated headshot).

### 4.4 URL / deep links
Hash mirrors room: `#/about` etc. Loading a deep link skips the intro and spawns the avatar at the room entrance. `#/quick` opens Quick view over the main hall. Browser back/forward changes rooms using the crossfade (no heavy effect).

## 5. Controls, mobile, accessibility

- **Desktop:** ←/→ or A/D walk; Enter/↑/Space interact; Esc closes card/brochure.
- **Mobile (coarse pointer):** large pixel ◀ ▶ buttons (hold to walk) and A button; tapping a frame or tile auto-walks the avatar there. Bubbles use "Tap A" wording.
- **Layout:** canvas integer-scaled to fit; portrait phones show canvas on top, card area below, controls at bottom. No horizontal page scroll.
- **Reduced motion** (`prefers-reduced-motion: reduce`): intro becomes a short fade-in of the finished painting; ripple/fold/zoom replaced by crossfade.
- **Screen readers:** InfoCard and SpeechBubble text rendered in an `aria-live="polite"` region; all controls are labeled `<button>`s; canvas has `role="img"` with a description; Quick view is fully keyboard navigable and linked first in tab order ("Skip to content: Quick view").
- **Storage keys:** `introSeen`, `soundOn`. All access through `storage.js` (never throws).

## 6. Content (data.js)

Content is sourced from the existing `data.js` (profile, 9 projects) plus the résumé provided on 2026-09-28:

**Education:** Massachusetts Institute of Technology, Cambridge, MA — Candidate for Bachelor of Science in Computer Science, Data Science, and Economics, June 2028. GPA 4.7/5.0. Coursework: Algorithms, Machine Learning, Econometrics, Game Theory, Optimization for Business Analytics. Honors: MIT; Jane Street Math Prize for Girls Invitee (top 250 girls, USA/Canada); 3-time Intl. Science and Engineering Fair Finalist; PennApps Hackathon Winner; Bridgewater Associates AI Immersion Hackathon Invitee.

**Skills:**
- Programming: Python, Java, Linux, C/C++, R, SQL, TypeScript, JavaScript, Swift, C#, React, Git, Shell Scripting, Kubernetes
- Systems & Infrastructure: Object-Oriented Programming, Distributed Systems, Docker, CI/CD, Databricks, AWS, Terraform
- Quantitative & ML: Machine Learning, Statistical Analysis, Econometrics, Optimization, PyTorch, Data Analytics
- Financial: LBO Modeling, Financial Modeling, Financial Statement Analysis, Equity Valuation, Market Research, Portfolio Analysis, Bloomberg API
- Tools & Platforms: Bloomberg Terminal, PowerPoint, Word, Excel, Tableau, Power BI, Databricks, AWS

**Experience** (in résumé order):
1. **Disney Streaming** — Software Engineering Intern — Santa Monica, CA — June 2026 – August 2026
   - Developed internal developer tooling for Disney Streaming using Databricks, Apache Spark, AWS, Linux, and Terraform, improving platform scalability and engineering productivity across distributed data pipelines, reducing latency by over 400%
   - Architected AI-assisted knowledge retrieval system leveraging Model Context Protocols (MCPs) to automate access to technical documentation and domain expertise, reducing engineering search time by 150% and automating developer workflows
2. **Acronym** — Machine Learning Intern — New York, NY — September 2026 – Present
   - Building an LLM evaluation pipeline that scores signal extractions against source artifacts using LLM-as-a-Judge, surfacing model and prompt failure modes across unstructured data
   - Analyzing HDBSCAN embedding-based clustering of extracted signals to analyze cluster quality and reduce redundant themes and improve group-level synthesis, enabling more accurate classification of new signals and emerging trends
   - Designing evaluation infrastructure to benchmark LLM models and extraction strategies across quality, cost, and latency
3. **HOF Capital** — Investment Intern — September 2026 – Present
   - Source and conduct market and company diligence on AI, software, and frontier technology startups, assessing founders, products, markets, competitive landscapes, and technical differentiation to identify high-potential investment opportunities
   - Develop investment theses through market research, founder conversations, and analysis of emerging technologies and products
4. **MIT Media Lab** — Research Intern — September 2026 – Present
   - Investigating self-confirming inference in persistent LLM memory by instrumenting an open-source memory system to trace preference updates to interaction evidence and distinguish user beliefs from preferences reinforced by agent interactions
   - Measuring inference provenance with multi-turn interactions and validating automated classifications vs. hand-labeled traces
5. **MIT Department of Economics** — Research Intern — Cambridge, MA — June 2026 – Present
   - Developed and evaluated technical infrastructure for a large-scale RCT studying smartphone use and adolescent well-being
   - Analyzed Android application and Django backend logs to diagnose missing/incomplete smartphone usage records
6. **MIT CSAIL, Decentralized Information Group** — Research Intern — Cambridge, MA — August 2024 – Present
   - Accelerated insurance communication services by >60% by researching development of mathematical metrics for subjective quality evaluation across 10+ large language models (LLMs) in coordination with industry partner Liberty Mutual
   - Designed parallel human/LLM judge studies via 300+ human ratings to create auto-evaluation metrics for Agentic AI models
7. **525 Venture Capital Firm** — Venture Associate Intern — New York, NY — December 2025 – February 2026
   - Built AI-driven investment portfolio management system using voice and text agentic AI models to ingest founder calls, inbound applications, pitch decks, and market research for deal sourcing, generating first-pass deal memos and SWOT analyses
   - Training on historical decisions, diligence frameworks to flag risks, rank diligence questions, support investment decisions
8. **Earthian AI — Dutch Commercial Property Insurance Optimization Startup** — Software Engineering Intern — Enschede, Netherlands — June 2025 – August 2025
   - Improved climate risk analysis and expedited claim processing and underwriting by 200+% and delivered 2x more accurate insights for insurers in energy markets via PyTorch, FastAPI, AWS, React, leading development of full-stack AI chatbot

**Contact:** GitHub https://github.com/srilekha511, LinkedIn https://www.linkedin.com/in/srilekha-mamidala/, email (the current `data.js` value is a placeholder `your.email@example.com`; the real public address is supplied by Srilekha before the Contact room is built).

## 7. Testing

- Add **Vitest** (dev dependency). Unit tests for pure logic:
  - `pixelReveal` order is a permutation of all pixels; sky pixels' mean index < village pixels' mean index.
  - `rippleWarp`, `zoomOut`, `homeFold`, `crossfade` return identity/start state at progress 0 and final state at 1.
  - `rooms.js`: one frame per project and experience entry; each section room has exactly 4 tiles (Home + 3 others), none pointing to itself; main hall has 5 frames in the specified order.
  - Proximity: nearest-frame selection, enter/leave hysteresis (no flicker at the boundary), tile detection.
  - `input.js` key → state mapping; `storage.js` survives a throwing `localStorage`.
  - Content validation: required fields present on every project/experience; every referenced image exists in `public/`.
- Manual verification per stage: dev server in browser at desktop (1440×900) and phone (390×844) sizes; production `vite build` + `vite preview` with `VITE_REPO_NAME=srilekhamamidala` to confirm base-path asset loading.

## 8. Deployment & cleanup

- Keep `.github/workflows/deploy.yml` (builds `frontend/` and deploys `dist/`). All asset URLs go through `import.meta.env.BASE_URL`.
- **Remove `.github/workflows/static.yml`**: it deploys the unbuilt repo root to Pages on every push to `main`, competing with `deploy.yml` (same concurrency group; last one wins). Removal to be confirmed by Srilekha.
- Remove `backend/`, old `pages/`, `components/Navbar*`, `App.css`, and dependencies `axios`, `react-router-dom`. Unused public images (`proejcts.jpg`, `projectsactual.*`, `website.webp`) removed if unreferenced.
- All work on branch `retro-gallery`; merge to `main` (which triggers deploy) only after Srilekha reviews the running site.

## 9. Build order (for the implementation plan)

1. Engine core: loop, renderer/scaling, input, camera, events, storage; blank walkable room.
2. Avatar sprite + walk animation.
3. HallScene with frames, proximity, React overlays (SpeechBubble, InfoCard); rooms from data.js; new data.js content.
4. Cover paintings, section themes, portal tiles, pixelated thumbnails.
5. Transitions: ripple portal, home fold, crossfade; hash routing.
6. Starry Night painting + intro sequence + skip.
7. Quick view, corner menu, audio.
8. Mobile controls/layout, reduced motion, a11y pass.
9. Cleanup, production build check, deploy.
