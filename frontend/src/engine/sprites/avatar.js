// Chibi Srilekha: mid-length black hair, light brown skin, glasses, maroon MIT hoodie.
export const AVATAR_W = 16
export const AVATAR_H = 24

export const AVATAR_PALETTE = {
  k: '#1b1b24', // hair
  s: '#c68e5e', // skin
  g: '#6f7488', // glasses frame (light enough to read against dark eyes)
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
