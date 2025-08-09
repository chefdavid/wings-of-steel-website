import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { criticalCSS } from './vite-plugin-critical-css'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react(), criticalCSS()],
    server: {
      proxy: {
        '/api/printify': {
          target: 'https://api.printify.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/printify/, ''),
          headers: {
            'Authorization': `Bearer ${env.VITE_PRINTIFY_API_TOKEN || ''}`
          }
        }
      }
    },
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
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'],
      },
    },
    reportCompressedSize: false,
    // Enable source maps for production debugging if needed
    sourcemap: false,
    // Optimize CSS
    cssCodeSplit: true,
    assetsInlineLimit: 4096, // Inline assets smaller than 4kb
  },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom'],
      // Exclude large dependencies from pre-bundling
      exclude: ['@supabase/supabase-js']
    }
  }
})
