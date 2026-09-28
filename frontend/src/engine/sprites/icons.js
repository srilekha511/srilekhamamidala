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
