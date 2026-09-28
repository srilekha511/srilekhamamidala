import { drawPixelArt } from '../sprites/pixelArt.js'

// Little pixel scenes for project frames, each drawn on a 42×32 canvas (the item frame's inner area)
// and centred in whatever rect it's given. Pick one per project with `art` in data.js.
const ART_W = 42
const ART_H = 32

const SHIELD = ['xxxxxxxx', 'xoooooox', 'xooooocx', 'xoooocox', 'xcoocoox', 'xoccooox', '.xoooox.', '..xoox..', '...xx...']
const BOLT = ['....xxxx', '...xxxx.', '..xxxx..', '.xxxx...', 'xxxxxxxx', '...xxxx.', '..xxxx..', '.xxxx...', 'xxx.....', 'xx......']

const SCENES = {
  // AI-powered insurance chatbot: chat bubbles next to a shield
  chatbot(r, px) {
    r(0, 0, 42, 32, '#dff1ff')
    r(3, 4, 24, 13, '#2f4a5a'); r(4, 5, 22, 11, '#ffffff'); r(7, 17, 3, 3, '#2f4a5a')
    for (const dx of [9, 14, 19]) r(dx, 9, 2, 2, '#2f4a5a')
    r(15, 20, 16, 9, '#1f4e6e'); r(16, 21, 14, 7, '#8ad0f0'); r(27, 29, 2, 2, '#1f4e6e')
    r(18, 23, 9, 1, '#1f4e6e'); r(18, 25, 6, 1, '#1f4e6e')
    px(SHIELD, { x: '#1f4e6e', o: '#6fb3d9', c: '#ffffff' }, 32, 4)
  },
  // LLM vs human judgement of formality: a robot in a bow tie facing a person
  formality(r) {
    r(0, 0, 42, 32, '#f7ecd9')
    r(10, 3, 2, 3, '#7a8699'); r(9, 2, 4, 1, '#e05a7a')
    r(5, 6, 12, 11, '#9aa7b8'); r(8, 9, 2, 2, '#1f4e6e'); r(13, 9, 2, 2, '#1f4e6e'); r(8, 14, 7, 1, '#5b6475')
    r(6, 20, 10, 12, '#7a8699')
    r(7, 18, 3, 3, '#8a1f2b'); r(12, 18, 3, 3, '#8a1f2b'); r(10, 19, 2, 1, '#5e1420')
    r(27, 5, 10, 3, '#1b1b24'); r(27, 8, 10, 9, '#c68e5e'); r(26, 6, 2, 8, '#1b1b24'); r(36, 6, 2, 8, '#1b1b24')
    r(29, 11, 2, 1, '#1b1b24'); r(33, 11, 2, 1, '#1b1b24'); r(30, 14, 4, 1, '#9c4a4a')
    r(26, 18, 12, 14, '#2f5a45'); r(31, 18, 2, 5, '#ffffff')
    r(19, 7, 5, 4, '#ffffff'); r(20, 8, 1, 1, '#6a3f8a'); r(22, 8, 1, 1, '#6a3f8a'); r(21, 11, 1, 1, '#ffffff')
  },
  // Scraping election legislation into knowledge graphs: capitol dome under a node graph
  election(r) {
    r(0, 0, 42, 32, '#bcd6ef')
    r(4, 5, 1, 9, '#6a3f8a'); r(6, 6, 1, 1, '#6a3f8a'); r(7, 7, 1, 1, '#6a3f8a'); r(8, 8, 1, 1, '#6a3f8a')
    r(8, 12, 1, 1, '#6a3f8a'); r(7, 13, 1, 1, '#6a3f8a'); r(6, 14, 1, 1, '#6a3f8a')
    r(3, 3, 3, 3, '#8a1f2b'); r(9, 9, 3, 3, '#8a1f2b'); r(3, 14, 3, 3, '#8a1f2b')
    r(20, 3, 2, 3, '#b8b0a0'); r(18, 6, 6, 3, '#f4f1ea'); r(15, 9, 12, 8, '#f4f1ea'); r(15, 16, 12, 1, '#b8b0a0')
    r(8, 17, 26, 2, '#e0d9cb')
    r(9, 19, 24, 8, '#f4f1ea')
    for (const cx of [11, 15, 19, 23, 27, 31]) r(cx, 20, 1, 7, '#b8b0a0')
    r(6, 27, 30, 3, '#d8d2c4'); r(4, 30, 34, 2, '#b8b0a0')
  },
  // dermalab: magnifying glass over a hand, plus the PennApps trophy
  dermalab(r) {
    r(0, 0, 42, 32, '#fbe3e6')
    r(8, 8, 3, 7, '#c68e5e'); r(12, 6, 3, 9, '#c68e5e'); r(16, 7, 3, 8, '#c68e5e'); r(20, 10, 3, 5, '#c68e5e')
    r(8, 14, 15, 14, '#c68e5e'); r(4, 17, 4, 4, '#c68e5e')
    r(10, 15, 9, 9, '#34466b'); r(11, 16, 7, 7, '#cfe8f7'); r(13, 18, 3, 3, '#8a3a3a')
    r(18, 23, 3, 3, '#6b4a32'); r(20, 25, 3, 3, '#6b4a32'); r(22, 27, 3, 3, '#6b4a32')
    r(28, 7, 2, 4, '#d4a93a'); r(39, 7, 2, 4, '#d4a93a')
    r(30, 6, 9, 7, '#f2c94c'); r(34, 8, 1, 1, '#ffffff'); r(33, 13, 3, 4, '#d4a93a'); r(31, 17, 7, 2, '#8a6420')
  },
  // WhartonMunicode, LLMs for legal code: scales of justice over an open law book
  legal(r) {
    r(0, 0, 42, 32, '#efe4d2')
    r(19, 2, 4, 2, '#d4a93a'); r(20, 4, 2, 14, '#8a6420'); r(8, 5, 26, 2, '#d4a93a')
    r(9, 7, 1, 6, '#8a6420'); r(15, 7, 1, 6, '#8a6420'); r(8, 13, 9, 2, '#d4a93a')
    r(26, 7, 1, 6, '#8a6420'); r(32, 7, 1, 6, '#8a6420'); r(25, 13, 9, 2, '#d4a93a')
    r(17, 17, 8, 2, '#8a6420')
    r(3, 28, 36, 3, '#8a1f2b'); r(4, 20, 16, 9, '#fbf3e0'); r(22, 20, 16, 9, '#fbf3e0'); r(20, 20, 2, 10, '#5e1420')
    for (const ly of [22, 24, 26]) { r(6, ly, 11, 1, '#b8a888'); r(24, ly, 11, 1, '#b8a888') }
  },
  // Dementia risk from lifestyle/genetic networks: a brain wired as a graph
  brainNetwork(r) {
    r(0, 0, 42, 32, '#e9e0f5')
    r(10, 5, 22, 1, '#f4a6c8'); r(8, 6, 26, 19, '#f4a6c8'); r(10, 25, 22, 1, '#f4a6c8'); r(20, 6, 1, 19, '#d97aa5')
    r(11, 11, 6, 1, '#d97aa5'); r(24, 13, 6, 1, '#d97aa5'); r(12, 18, 5, 1, '#d97aa5'); r(25, 20, 5, 1, '#d97aa5')
    r(19, 26, 4, 4, '#d97aa5')
    r(15, 9, 11, 1, '#1f4e6e'); r(14, 10, 1, 10, '#1f4e6e'); r(27, 11, 1, 10, '#1f4e6e'); r(16, 21, 11, 1, '#1f4e6e'); r(21, 10, 1, 5, '#1f4e6e')
    for (const [nx, ny] of [[13, 8], [26, 8], [13, 20], [26, 20], [20, 14]]) r(nx, ny, 3, 3, '#1f4e6e')
  },
  // NeuroCADR, drug repurposing for epilepsy: a capsule and a lightning-bolt neuron
  drugRepurposing(r, px, t) {
    r(0, 0, 42, 32, '#e0f0ea')
    r(5, 13, 1, 7, '#e05a7a'); r(6, 12, 9, 9, '#e05a7a'); r(15, 12, 9, 9, '#fbf3e0'); r(24, 13, 1, 7, '#fbf3e0')
    r(6, 11, 18, 1, '#1e5a3e'); r(6, 21, 18, 1, '#1e5a3e'); r(8, 14, 4, 1, '#ffffff')
    px(BOLT, { x: Math.floor(t * 3) % 2 ? '#f6d743' : '#f2a93b' }, 30, 5)
    r(28, 22, 2, 2, '#1e5a3e'); r(33, 25, 2, 2, '#1e5a3e'); r(38, 21, 2, 2, '#1e5a3e')
    r(30, 23, 3, 1, '#1e5a3e'); r(35, 23, 3, 1, '#1e5a3e')
  },
  // ML food shelf-life app: a phone with an apple, freshness bar, and a clock
  foodShelfLife(r) {
    r(0, 0, 42, 32, '#fff1d6')
    r(5, 2, 18, 29, '#2b2b2b'); r(7, 5, 14, 20, '#dff1ff'); r(13, 27, 2, 2, '#666677')
    r(13, 8, 1, 3, '#6b4a32'); r(14, 8, 2, 2, '#2e7d32'); r(11, 11, 6, 1, '#e05a3a'); r(10, 12, 8, 7, '#e05a3a'); r(11, 13, 2, 2, '#f4a28c')
    r(9, 21, 10, 2, '#c9c9d6'); r(9, 21, 6, 2, '#2e7d32')
    r(26, 5, 3, 2, '#8a3a12'); r(37, 5, 3, 2, '#8a3a12')
    r(26, 7, 14, 14, '#8a3a12'); r(27, 8, 12, 12, '#fbf3e0'); r(32, 10, 1, 5, '#1b1b24'); r(33, 14, 4, 1, '#1b1b24')
  },
  // Performance campaign manager: a megaphone and rising results
  campaign(r) {
    r(0, 0, 42, 32, '#e8f4e0')
    r(4, 13, 6, 6, '#8a1f2b'); r(10, 11, 3, 10, '#e05a3a'); r(13, 9, 3, 14, '#e05a3a'); r(16, 7, 3, 18, '#e05a3a'); r(6, 19, 2, 5, '#5e1420')
    r(22, 20, 4, 9, '#2d6a4f'); r(27, 16, 4, 13, '#2d6a4f'); r(32, 11, 4, 18, '#2d6a4f'); r(37, 6, 4, 23, '#2d6a4f')
    r(21, 29, 21, 1, '#1e3a2e')
  },
  // Default: an idea lightbulb
  idea(r) {
    r(0, 0, 42, 32, '#fff6d6')
    r(17, 4, 8, 1, '#f6d743'); r(15, 5, 12, 11, '#f6d743'); r(17, 16, 8, 1, '#f6d743'); r(18, 7, 2, 3, '#ffffff')
    r(17, 17, 8, 3, '#c9c9d6'); r(18, 20, 6, 2, '#9aa7b8')
    r(20, 0, 2, 3, '#f2a93b'); r(9, 10, 4, 1, '#f2a93b'); r(29, 10, 4, 1, '#f2a93b'); r(11, 4, 2, 2, '#f2a93b'); r(29, 4, 2, 2, '#f2a93b')
  },
}

export const PROJECT_ART = SCENES

export function drawProjectArt(ctx, name, x, y, w, h, t = 0) {
  const scene = SCENES[name] ?? SCENES.idea
  const ox = x + Math.floor((w - ART_W) / 2)
  const oy = y + Math.floor((h - ART_H) / 2)
  const r = (dx, dy, rw, rh, color) => {
    ctx.fillStyle = color
    ctx.fillRect(ox + dx, oy + dy, rw, rh)
  }
  const px = (rows, palette, dx, dy) => drawPixelArt(ctx, rows, palette, ox + dx, oy + dy)
  scene(r, px, t)
}
