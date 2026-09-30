import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync } from 'fs'
import { join } from 'path'

// The site is served from the root of https://srilekha.dev (GitHub Pages custom domain).
// Set VITE_BASE to build for a sub-path instead, e.g. VITE_BASE=/srilekhamamidala/.
const base = process.env.VITE_BASE ?? '/'

export default defineConfig({
  plugins: [
    react(),
    // Plugin to copy index.html to 404.html for GitHub Pages
    {
      name: 'copy-404',
      apply: 'build',
      closeBundle() {
        const distPath = join(__dirname, 'dist')
        try {
          copyFileSync(
            join(distPath, 'index.html'),
            join(distPath, '404.html')
          )
          console.log('✓ Copied index.html to 404.html')
        } catch (err) {
          console.warn('Could not copy index.html to 404.html:', err.message)
        }
      }
    }
  ],
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
})

