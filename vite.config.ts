import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { criticalCSS } from './vite-plugin-critical-css'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), criticalCSS()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // More aggressive code splitting
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('react-router')) {
              return 'router';
            }
            if (id.includes('framer-motion')) {
              return 'animation';
            }
            if (id.includes('react-icons') || id.includes('lucide-react')) {
              return 'icons';
            }
            if (id.includes('@supabase')) {
              return 'supabase';
            }
            if (id.includes('axios')) {
              return 'http';
            }
            if (id.includes('@stripe')) {
              return 'payments';
            }
            // Put other vendor code in a general vendor chunk
            return 'vendor';
          }
        }
      }
    },
    chunkSizeWarningLimit: 600,
    minify: 'terser',
    reportCompressedSize: false,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom']
  }
})
