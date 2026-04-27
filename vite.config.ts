import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { criticalCSS } from './vite-plugin-critical-css'

// Dev-only middleware that fulfills the Netlify function endpoints the
// frontend hits in production. Lets `vite dev` work without `netlify dev`
// (which has been crashing locally) while keeping the Printify token in
// the Vite Node process — never bundled to the browser.
function netlifyFunctionsDevProxy(env: Record<string, string>): Plugin {
  const shopId = env.PRINTIFY_SHOP_ID || env.VITE_PRINTIFY_SHOP_ID || ''
  const token =
    env.PRINTIFY_API_KEY ||
    env.PRINTIFY_API_TOKEN ||
    env.VITE_PRINTIFY_API_TOKEN ||
    ''

  return {
    name: 'netlify-functions-dev-proxy',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || ''
        const isProductsCall = url.startsWith('/.netlify/functions/printify-products')
        if (!isProductsCall) return next()
        console.log(`[printify-dev-proxy] ${req.method} ${url}`)
        if (!token || !shopId) {
          res.statusCode = 500
          res.setHeader('content-type', 'application/json')
          res.end(JSON.stringify({
            error: 'Dev proxy missing PRINTIFY_API_TOKEN or PRINTIFY_SHOP_ID. Add them to .env.local.',
          }))
          return
        }
        try {
          const upstream = new URL(`https://api.printify.com/v1/shops/${shopId}/products.json`)
          const incoming = new URL(url, 'http://localhost')
          incoming.searchParams.forEach((v, k) => {
            if (k !== 'shopId') upstream.searchParams.set(k, v)
          })
          if (!upstream.searchParams.get('limit')) upstream.searchParams.set('limit', '50')
          const upstreamRes = await fetch(upstream, {
            headers: { Authorization: `Bearer ${token}` },
          })
          const text = await upstreamRes.text()
          res.statusCode = upstreamRes.status
          res.setHeader('content-type', 'application/json')
          res.end(text)
        } catch (err) {
          res.statusCode = 500
          res.setHeader('content-type', 'application/json')
          res.end(JSON.stringify({ error: (err as Error).message }))
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    base: '/',
    plugins: [react(), criticalCSS(), netlifyFunctionsDevProxy(env)],
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
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        warnings: false,
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
      include: ['react', 'react-dom', 'react-router-dom', '@supabase/supabase-js'],
    }
  }
})
