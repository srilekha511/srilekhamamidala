import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(__dirname, '..')
const html = readFileSync(resolve(root, 'index.html'), 'utf8')
const SITE = 'https://srilekha511.github.io/srilekhamamidala/'
const meta = (attr, name) => {
  const m = html.match(new RegExp(`<meta\\s+${attr}="${name}"\\s+content="([^"]*)"`))
  return m ? m[1] : null
}

describe('link previews', () => {
  it('has Open Graph tags for LinkedIn, iMessage and Slack', () => {
    expect(meta('property', 'og:type')).toBe('website')
    expect(meta('property', 'og:url')).toBe(SITE)
    expect(meta('property', 'og:title')).toBe("Srilekha's Gallery")
    expect(meta('property', 'og:description')).toMatch(/pixel-art/i)
    expect(meta('property', 'og:image')).toBe(`${SITE}og-image.png`)
    expect(meta('property', 'og:image:width')).toBe('1200')
    expect(meta('property', 'og:image:height')).toBe('630')
    expect(meta('property', 'og:image:alt')).toBeTruthy()
  })
  it('has large-image Twitter/X card tags', () => {
    expect(meta('name', 'twitter:card')).toBe('summary_large_image')
    expect(meta('name', 'twitter:image')).toBe(`${SITE}og-image.png`)
  })
  it('ships a 1200x630 PNG preview image', () => {
    const file = resolve(root, 'public/og-image.png')
    expect(existsSync(file)).toBe(true)
    const png = readFileSync(file)
    expect(png.subarray(1, 4).toString()).toBe('PNG')
    expect(png.readUInt32BE(16)).toBe(1200)
    expect(png.readUInt32BE(20)).toBe(630)
    expect(png.length).toBeLessThan(1024 * 1024) // stays small for crawlers
  })
})
