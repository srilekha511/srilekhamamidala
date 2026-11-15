# Landing page with a portal into the museum

## Why
Google team-matching hosts skim a portfolio in ~30 seconds, often on a phone. Today `srilekha.dev`
opens straight into the pixel museum (with a ~7s intro), and the text version is a dense brochure in
pixel fonts. The front door should be a calm, readable page (in the spirit of lauralz.com: big "hi",
a short "currently" list, links), with the museum as an optional, delightful extra reached through a portal.

## Goals
- `srilekha.dev` shows a one-to-two-screen readable landing page, every visit.
- The pixel Starry Night sits beside the text as the portal; clicking it plays the zoom into the hall.
- A host can see what Srilekha does now and her strongest work without entering the museum.

## Non-goals
- No changes to the museum rooms, engine visuals, or room content.
- No new content written for her; the landing reuses `data.js` (wording edits are hers to make later).

## Anti-goals
- Looking like a copy of lauralz.com: keep Srilekha's own cream / maroon / gold palette and pixel accents.
- Pixel fonts for running text (unreadable at paragraph length).
- Making the landing page slower: the game engine must not load until the portal is used.

## Approaches considered
- **A. Landing is the front page; the museum loads only on entering the portal (chosen).** Light first
  load; the existing intro animation covers the engine loading and makes the portal feel like stepping
  into the painting.
- B. Landing as an overlay on an already-running, paused museum. Instant entry, but every visitor pays
  for the game, and a scrolling page over a fixed canvas is fiddly on phones.
- C. Two separate pages (`/` and `/gallery`). Fastest landing, but entry becomes a page load and loses
  the zoom-into-the-wall moment; splits routing.

## Design
**Routing.** `''` (bare URL) = landing. `#/hall` = museum main hall (was the bare URL). `#/about`,
`#/research`, etc. still deep-link straight into the museum. `#/quick` keeps the full text brochure.
Entering the portal pushes `#/hall`, so Back returns to the landing.

**Landing page content (top to bottom, single column on phones, two columns on desktop):**
- Small header: name on the left, light/dark toggle on the right (shares the museum's stored theme).
- "hi, i'm srilekha" as a large heading; one line from `profile.fullRole`, rephrased in her voice
  ("cs, data science & econ at mit").
- **Currently:** the `now.items` list (already maintained monthly for the Now board).
- **Selected work:** 4–6 items, one line each with a link to that item's room in the museum or its
  external link. Chosen via a `featured` list in `data.js` so she can reorder it. Starting picks
  (my call, easy to change): Disney Streaming (SWE intern), Acronym (ML intern), HackMIT Hardware Hub,
  TRACE, LLM Evaluation @ MIT CSAIL, LLM Memory @ MIT Media Lab.
- **Portal:** the pixel Starry Night in a gold frame with a gentle shimmer and a pixel-font caption
  "step inside the gallery →". Right column on desktop; on phones, between the intro and Selected work.
  It's a real button (keyboard and screen-reader accessible).
- Footer links: email, GitHub, LinkedIn, "full text version" (`#/quick`), and Resume (shown only once
  a PDF is added; there isn't one in `public/` yet).

**Type.** Body and headings in a clean readable font (Inter); Press Start 2P only for tiny accents
(portal caption, section labels).

**Entering the museum.** The game code is loaded lazily on the first portal click (or on a deep link).
The intro then plays: first entry gets the full painting reveal + zoom (~7s, Skip button shown);
later entries in the same browser get only the zoom (~1.4s). Reduced-motion users get the short fade.

**In the museum.** The "Srilekha's Gallery" title becomes a link back to the landing page.
Everything else in the museum behaves as today.

**Link previews.** Update the Open Graph / Twitter description to describe the landing, not the walk-through.

## Left to the builder
Exact spacing, sizes, and dark-mode colours of the landing; the shimmer effect; how the director
starts at the zoom phase; test structure (routing, landing, App flows).
