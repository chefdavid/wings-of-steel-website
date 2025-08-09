import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { criticalCSS } from './vite-plugin-critical-css'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), criticalCSS()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['framer-motion', 'lucide-react', 'react-icons'],
          'vendor-payments': ['@stripe/react-stripe-js', '@stripe/stripe-js'],
          'vendor-data': ['@supabase/supabase-js', 'axios'],
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
