import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Minimal typing for the Node global (no @types/node dependency needed).
declare const process: { env: Record<string, string | undefined> }

// ETERNUM build config — kept intentionally lean so the cosmos boots fast.
//
// `base` is '/' for local dev and root deploys (Vercel/Netlify), but the
// GitHub Pages workflow sets GITHUB_PAGES=true so assets resolve under the
// project subpath https://<user>.github.io/don-portfolio/.
const base = process.env.GITHUB_PAGES === 'true' ? '/don-portfolio/' : '/'

export default defineConfig({
  base,
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
  },
  build: {
    target: 'esnext',
    sourcemap: false,
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        // Function form so it works with both rollup-vite and rolldown-vite.
        // Splits the heavy vendor libs into cacheable chunks; admin route
        // never pulls in framer-motion.
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) return 'react'
          if (/[\\/]node_modules[\\/](framer-motion|motion-dom|motion-utils)[\\/]/.test(id)) return 'motion'
        },
      },
    },
  },
})
