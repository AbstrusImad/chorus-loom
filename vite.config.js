import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Chorus Loom is a fully local single page application.
// base '/' keeps asset paths root relative for static hosting (Cloudflare Pages).
export default defineConfig({
  base: '/',
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})
