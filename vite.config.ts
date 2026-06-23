import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ETERNUM build config — kept intentionally lean so the cosmos boots fast.
export default defineConfig({
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
