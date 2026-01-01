import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync } from 'fs'
import { join } from 'path'

// Get the repository name from environment variable or use default
// For GitHub Pages, the base path should be '/repository-name/'
// If deploying to root domain (username.github.io), use '/'
// 
// IMPORTANT: Make sure this matches your actual GitHub repository name!
// Repository name: srilekhamamidala
const repositoryName = process.env.VITE_REPO_NAME || 'srilekhamamidala'
const base = repositoryName ? `/${repositoryName}/` : '/'

export default defineConfig({
  plugins: [
    react(),
    // Plugin to copy index.html to 404.html for GitHub Pages
    {
      name: 'copy-404',
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
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
})

