import { drawPixelArt } from '../sprites/pixelArt.js'
import { AVATAR_FRAMES, AVATAR_PALETTE } from '../sprites/avatar.js'
import { ICONS } from '../sprites/icons.js'

// Little pixel scenes for gallery frames, each drawn on a 42×32 canvas (the item frame's inner area)
// and centred in whatever rect it's given. Projects and roles pick one with `art` in data.js.
const ART_W = 42
const ART_H = 32

const SHIELD = ['xxxxxxxx', 'xoooooox', 'xooooocx', 'xoooocox', 'xcoocoox', 'xoccooox', '.xoooox.', '..xoox..', '...xx...']
const ROBOT = ['...xx...', '.xxxxxx.', '.x.xx.x.', '.xxxxxx.', '..x..x..', '.xxxxxx.', 'x.xxxx.x', '..x..x..']
const ROCKET = ['...xx...', '..xxxx..', '..x..x..', '..xxxx..', '.xxxxxx.', 'x.xxxx.x', '..x..x..', '.x....x.']
const BUBBLE = ['xxxxxxxx', 'x......x', 'x.x.x..x', 'x......x', 'xxxxxxxx', '.xx.....', '.x......', '........']
const GEAR = ['...xx...', '.x.xx.x.', '..xxxx..', 'xxx..xxx', 'xxx..xxx', '..xxxx..', '.x.xx.x.', '...xx...']
const CHART = ['........', '......x.', '....x.x.', '....x.x.', '..x.x.x.', '..x.x.x.', 'x.x.x.x.', 'xxxxxxxx']
const COIN = ['..xxxx..', '.xyyyyx.', 'xyyxxyyx', 'xyxyyyyx', 'xyyxxyyx', 'xyyyyxyx', '.xyxxyx.', '..xxxx..']
const TERMINAL = ['xxxxxxxx', 'x......x', 'x.x....x', 'x..x...x', 'x.x....x', 'x...xx.x', 'x......x', 'xxxxxxxx']
const CLOUD = ['........', '...xx...', '..xxxx..', '.xxxxxx.', 'xxxxxxxx', 'xxxxxxxx', '.xxxxxx.', '........']
const OCTOCAT = [
  '.....xxxxxx.....', '...xxxxxxxxxx...', '..xxxxxxxxxxxx..', '.xxxoxxxxxxoxxx.', '.xxxooooooooxxx.', 'xxxooooooooooxxx',
  'xxxooooooooooxxx', 'xxxooooooooooxxx', 'xxxooooooooooxxx', 'xxxxooooooooxxxx', '.xxxxooooooxxxx.', '.xoxxxooooxxxxx.',
  '..xooxooooxxxx..', '...xxxooooxxx...', '.....xooooxx....', '......xxxx......',
]
const LINKEDIN = [
  '.xxxxxxxxxxxx.', 'xxxxxxxxxxxxxx', 'xxooxxxxxxxxxx', 'xxooxxxxxxxxxx', 'xxxxxxxxxxxxxx', 'xxooxoooooxxxx', 'xxooxooxxooxxx',
  'xxooxooxxooxxx', 'xxooxooxxooxxx', 'xxooxooxxooxxx', 'xxooxooxxooxxx', 'xxxxxxxxxxxxxx', 'xxxxxxxxxxxxxx', '.xxxxxxxxxxxx.',
]
// 8×8 icons for the For Fun interests, in the order they appear in data.js.
export const HOBBY_ICONS = {
  dance: { rows: ['...xx...', 'x..xx..x', '.xxxxxx.', '...xx...', '..xxxx..', '.xxxxxx.', 'xxxxxxxx', '..x..x..'], palette: { x: '#8a1f2b' } },
  travel: { rows: ['..xxxx..', '..x..x..', '.xxxxxx.', 'xxxxxxxx', 'xppppppx', 'xpxxxxpx', 'xppppppx', '.xxxxxx.'], palette: { x: '#2d6a4f', p: '#6fb38a' } },
  cooking: { rows: ['.s..s...', '..s..s..', '.s..s...', 'xxxxxxxx', '.xxxxxx.', '.xxxxxx.', '.xxxxxx.', '..xxxx..'], palette: { x: '#34466b', s: '#9aa7b8' } },
  eagles: { rows: ['........', '..xxxx..', '.xxwxwx.', 'xxwwwwxx', '.xxwxwx.', '..xxxx..', '........', '........'], palette: { x: '#004c54', w: '#ffffff' } },
  painting: { rows: ['..xxxx..', '.xrxxbx.', 'xxxxxxyx', 'xgxx..xx', 'xxxx..x.', 'xxxxxx..', '.xxxxx..', '..xxx...'], palette: { x: '#c9a36a', r: '#e05a3a', b: '#1f6fb3', y: '#f2c94c', g: '#2e7d32' } },
  singing: { rows: ['...xxxxx', '...x...x', '...x...x', '...x...x', '.xxx.xxx', 'xxxx.xxx', '.xx...x.', '........'], palette: { x: '#6a3f8a' } },
}

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
  // ---- Experience ----
  // Disney Streaming: a fairytale castle and a play button
  castleStream(r, px, t) {
    r(0, 0, 42, 32, '#2a3a78'); r(0, 28, 42, 4, '#1b2a58')
    for (const [sx, sy] of [[16, 3], [36, 5], [30, 2], [6, 16]]) if (Math.floor(t * 2 + sx) % 3) r(sx, sy, 1, 1, '#f6d743')
    r(10, 11, 5, 17, '#e9e3f5'); r(27, 11, 5, 17, '#e9e3f5'); r(14, 16, 14, 12, '#e9e3f5'); r(18, 7, 6, 9, '#e9e3f5')
    r(10, 8, 5, 3, '#6a8fd0'); r(11, 6, 3, 2, '#6a8fd0'); r(12, 4, 1, 2, '#6a8fd0')
    r(27, 8, 5, 3, '#6a8fd0'); r(28, 6, 3, 2, '#6a8fd0'); r(29, 4, 1, 2, '#6a8fd0')
    r(18, 4, 6, 3, '#6a8fd0'); r(19, 2, 4, 2, '#6a8fd0'); r(20, 0, 2, 2, '#6a8fd0')
    r(19, 22, 4, 6, '#34466b'); r(20, 10, 2, 3, '#34466b'); r(12, 14, 1, 2, '#34466b'); r(29, 14, 1, 2, '#34466b')
    r(2, 3, 9, 9, '#e05a7a'); r(5, 5, 1, 5, '#ffffff'); r(6, 6, 1, 3, '#ffffff'); r(7, 7, 1, 1, '#ffffff')
  },
  // Acronym: clustered signals judged by an LLM (gavel)
  clusterJudge(r) {
    r(0, 0, 42, 32, '#f4f0ff')
    for (const [dx, dy] of [[5, 5], [9, 4], [7, 9], [11, 8], [4, 10]]) r(dx, dy, 2, 2, '#6a3f8a')
    for (const [dx, dy] of [[6, 20], [10, 22], [4, 24], [9, 26], [12, 19]]) r(dx, dy, 2, 2, '#2d6a4f')
    for (const [dx, dy] of [[19, 10], [23, 8], [21, 14], [25, 12], [18, 16]]) r(dx, dy, 2, 2, '#e05a3a')
    r(3, 3, 11, 1, '#c9bfe0'); r(3, 13, 11, 1, '#c9bfe0')
    r(28, 14, 11, 6, '#8a6420'); r(29, 15, 9, 4, '#b08040'); r(32, 20, 3, 8, '#6b4a32'); r(26, 28, 15, 3, '#5a3a2f')
  },
  // HOF Capital: a startup rocket under a diligence magnifier
  rocketDiligence(r) {
    r(0, 0, 42, 32, '#dff1ff')
    r(10, 1, 4, 2, '#e05a3a'); r(9, 3, 6, 3, '#e05a3a'); r(8, 6, 8, 16, '#fbf3e0'); r(10, 9, 4, 4, '#6fb3d9')
    r(5, 17, 3, 5, '#e05a3a'); r(16, 17, 3, 5, '#e05a3a'); r(10, 22, 4, 4, '#f2a93b'); r(11, 26, 2, 3, '#f6d743')
    r(24, 6, 12, 12, '#34466b'); r(26, 8, 8, 8, '#cfe8f7')
    r(27, 13, 1, 2, '#2d6a4f'); r(29, 11, 1, 4, '#2d6a4f'); r(31, 9, 1, 6, '#2d6a4f')
    r(34, 18, 3, 3, '#6b4a32'); r(36, 21, 3, 3, '#6b4a32'); r(38, 24, 3, 3, '#6b4a32')
  },
  // MIT Media Lab: a memory chip caught in a self-reinforcing loop
  memoryLoop(r, px, t) {
    r(0, 0, 42, 32, '#fbe3e6')
    r(8, 3, 26, 2, '#6a3f8a'); r(36, 6, 2, 20, '#6a3f8a'); r(8, 27, 26, 2, '#6a3f8a'); r(4, 6, 2, 20, '#6a3f8a')
    r(32, 1, 2, 6, '#6a3f8a'); r(8, 25, 2, 6, '#6a3f8a')
    for (const dx of [15, 19, 23]) { r(dx, 7, 2, 2, '#9aa7b8'); r(dx, 23, 2, 2, '#9aa7b8') }
    r(13, 9, 16, 14, '#2b2b2b'); r(15, 11, 2, 2, '#f2c94c')
    r(19, 13, 4, 6, Math.floor(t * 2) % 2 ? '#f4a6c8' : '#e05a7a'); r(18, 14, 6, 3, Math.floor(t * 2) % 2 ? '#f4a6c8' : '#e05a7a')
  },
  // MIT Economics: smartphones and adolescent well-being
  phoneWellbeing(r, px) {
    r(0, 0, 42, 32, '#fff1d6')
    r(4, 2, 14, 28, '#2b2b2b'); r(6, 5, 10, 20, '#dff1ff'); r(10, 27, 2, 1, '#666677')
    r(7, 7, 3, 3, '#e05a3a'); r(12, 7, 3, 3, '#2d6a4f'); r(7, 12, 3, 3, '#1f4e6e'); r(12, 12, 3, 3, '#f2c94c')
    px(ICONS.heart, { x: '#e05a7a' }, 24, 2)
    r(22, 22, 3, 7, '#2d6a4f'); r(26, 24, 3, 5, '#2d6a4f'); r(30, 19, 3, 10, '#2d6a4f'); r(34, 25, 3, 4, '#2d6a4f'); r(21, 29, 18, 1, '#1e3a2e')
  },
  // 525 VC: voice-agent deal memos with a SWOT grid
  voiceMemo(r) {
    r(0, 0, 42, 32, '#f7e2cf')
    r(6, 3, 8, 11, '#34466b'); r(7, 5, 6, 1, '#6f7488'); r(7, 8, 6, 1, '#6f7488'); r(7, 11, 6, 1, '#6f7488')
    r(4, 12, 2, 5, '#6b4a32'); r(14, 12, 2, 5, '#6b4a32'); r(4, 17, 12, 2, '#6b4a32'); r(9, 19, 2, 7, '#6b4a32'); r(5, 26, 10, 2, '#5a3a2f')
    r(19, 2, 21, 28, '#8a3a12'); r(20, 3, 19, 26, '#fbf3e0'); r(22, 5, 12, 2, '#8a3a12')
    r(22, 10, 7, 7, '#2d6a4f'); r(30, 10, 7, 7, '#e05a3a'); r(22, 19, 7, 7, '#1f4e6e'); r(30, 19, 7, 7, '#f2c94c')
  },
  // Earthian AI: climate-risk cover for energy markets (globe, umbrella, wind turbine)
  climateGlobe(r, px, t) {
    r(0, 0, 42, 32, '#dff1ff')
    r(12, 8, 10, 2, '#1f6fb3'); r(10, 10, 14, 14, '#1f6fb3'); r(12, 24, 10, 2, '#1f6fb3')
    r(12, 12, 5, 4, '#2e7d32'); r(17, 18, 6, 4, '#2e7d32'); r(19, 10, 3, 3, '#2e7d32')
    r(10, 1, 14, 1, '#e05a7a'); r(8, 2, 18, 3, '#e05a7a'); r(16, 5, 2, 4, '#6b4a32')
    r(33, 12, 2, 18, '#fbf3e0'); r(32, 10, 4, 3, '#c9c9d6')
    if (Math.floor(t * 3) % 2) { r(33, 3, 2, 7, '#fbf3e0'); r(26, 11, 6, 2, '#fbf3e0'); r(36, 11, 5, 2, '#fbf3e0') }
    else { r(28, 6, 5, 2, '#fbf3e0'); r(36, 6, 4, 2, '#fbf3e0'); r(33, 13, 2, 0, '#fbf3e0'); r(34, 13, 5, 2, '#fbf3e0') }
    r(0, 30, 42, 2, '#9ccf8a')
  },

  // ---- About ----
  avatar(r, px, t) {
    r(0, 0, 42, 32, '#f2d0a9'); r(0, 24, 42, 8, '#e8b98a')
    drawPixelArtScaled(px, AVATAR_FRAMES.idle.slice(0, 16), AVATAR_PALETTE, 5, 0, 2)
    if (Math.floor(t * 2) % 2) { r(3, 5, 1, 1, '#ffffff'); r(38, 9, 1, 1, '#ffffff') } else { r(2, 11, 1, 1, '#ffffff'); r(37, 3, 1, 1, '#ffffff') }
  },
  mit(r) {
    r(0, 0, 42, 32, '#fbf3e0')
    for (let dy = 2; dy < 32; dy += 5) for (let dx = (dy % 2) * 3 + 1; dx < 42; dx += 6) r(dx, dy, 1, 1, '#efe2c8') // paper grain
    r(4, 28, 36, 1, '#e3d3b4')
    r(6, 6, 4, 20, '#8a1f2b'); r(11, 6, 4, 13, '#8a1f2b'); r(16, 6, 4, 20, '#8a1f2b')
    r(21, 10, 4, 16, '#8b959e')
    r(26, 6, 12, 4, '#8a1f2b'); r(29, 10, 4, 16, '#8a1f2b')
  },
  inventory(r, px, t) {
    r(0, 0, 42, 32, '#3b2f4a')
    const items = [[ICONS.code, { x: '#1f4e6e' }], [GEAR, { x: '#6f7488' }], [CHART, { x: '#2d6a4f' }],
      [COIN, { x: '#8a6420', y: '#f2c94c' }], [TERMINAL, { x: '#2b2b2b' }], [CLOUD, { x: '#6fb3d9' }]]
    const glint = Math.floor(t * 2) % items.length
    items.forEach(([rows, pal], i) => {
      const sx = 2 + (i % 3) * 13, sy = 4 + Math.floor(i / 3) * 13
      r(sx, sy, 12, 12, '#8a6420'); r(sx + 1, sy + 1, 10, 10, '#f4e6c8')
      px(rows, pal, sx + 2, sy + 2)
      if (i === glint) r(sx + 9, sy + 2, 1, 1, '#ffffff')
    })
  },
  // For Fun: a heart ringed by the non-academic interests
  interests(r, px, t) {
    r(0, 0, 42, 32, '#fde7d6')
    drawPixelArtScaled(px, ICONS.heart, { x: '#e05a7a' }, 13, 8, 2)
    if (Math.floor(t * 2) % 2) { r(12, 6, 1, 1, '#ffffff'); r(29, 24, 1, 1, '#ffffff') } else { r(29, 7, 1, 1, '#ffffff'); r(12, 24, 1, 1, '#ffffff') }
    const slots = [[2, 2], [32, 2], [2, 12], [32, 12], [2, 22], [32, 22]]
    Object.values(HOBBY_ICONS).forEach(({ rows, palette }, i) => px(rows, palette, ...slots[i]))
  },

  // ---- Contact ----
  email(r, px, t) {
    r(0, 0, 42, 32, '#f4d6e0')
    drawPixelArtScaled(px, ICONS.envelope, { x: '#8a1f2b' }, 9, 4, 3)
    px(ICONS.heart, { x: '#e05a7a' }, 32, 2 + (Math.floor(t * 4) % 2))
  },
  github(r, px) {
    r(0, 0, 42, 32, '#f0f0f3')
    drawPixelArtScaled(px, OCTOCAT, { x: '#1b1f24', o: '#f0f0f3' }, 5, 0, 2)
  },
  linkedin(r, px) {
    r(0, 0, 42, 32, '#e8f1fa')
    drawPixelArtScaled(px, LINKEDIN, { x: '#0a66c2', o: '#ffffff' }, 7, 2, 2)
  },
  // Default: an idea lightbulb
  idea(r) {
    r(0, 0, 42, 32, '#fff6d6')
    r(17, 4, 8, 1, '#f6d743'); r(15, 5, 12, 11, '#f6d743'); r(17, 16, 8, 1, '#f6d743'); r(18, 7, 2, 3, '#ffffff')
    r(17, 17, 8, 3, '#c9c9d6'); r(18, 20, 6, 2, '#9aa7b8')
    r(20, 0, 2, 3, '#f2a93b'); r(9, 10, 4, 1, '#f2a93b'); r(29, 10, 4, 1, '#f2a93b'); r(11, 4, 2, 2, '#f2a93b'); r(29, 4, 2, 2, '#f2a93b')
  },
}

export const FRAME_ART = SCENES

// px(rows, palette, dx, dy, scale) draws pixel art relative to the scene origin.
function drawPixelArtScaled(px, rows, palette, dx, dy, scale) {
  px(rows, palette, dx, dy, scale)
}

export function drawFrameArt(ctx, name, x, y, w, h, t = 0) {
  const scene = SCENES[name] ?? SCENES.idea
  const ox = x + Math.floor((w - ART_W) / 2)
  const oy = y + Math.floor((h - ART_H) / 2)
  const r = (dx, dy, rw, rh, color) => {
    ctx.fillStyle = color
    ctx.fillRect(ox + dx, oy + dy, rw, rh)
  }
  const px = (rows, palette, dx, dy, scale = 1) => drawPixelArt(ctx, rows, palette, ox + dx, oy + dy, { scale })
  scene(r, px, t)
}
