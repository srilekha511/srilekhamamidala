import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Get the repository name from environment variable or use default
// For GitHub Pages, the base path should be '/repository-name/'
// If deploying to root domain, use '/'
const repositoryName = process.env.VITE_REPO_NAME || ''
const base = repositoryName ? `/${repositoryName}/` : '/'

export default defineConfig({
  plugins: [react()],
  base: base,
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true
      }
    }
  }
})

