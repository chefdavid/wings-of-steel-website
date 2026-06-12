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
  const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL || ''
  const supabaseServiceKey =
    env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_SERVICE_ROLE_KEY || ''

  return {
    name: 'netlify-functions-dev-proxy',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || ''
        const isAdminPlayersCall = url.startsWith('/.netlify/functions/admin-players')
        if (isAdminPlayersCall) {
          if (req.method === 'OPTIONS') {
            res.statusCode = 200
            res.setHeader('Access-Control-Allow-Origin', '*')
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
            res.end('')
            return
          }
          if (req.method !== 'POST') {
            res.statusCode = 405
            res.setHeader('content-type', 'application/json')
            res.end(JSON.stringify({ error: 'Method Not Allowed' }))
            return
          }
          if (!supabaseUrl || !supabaseServiceKey) {
            res.statusCode = 500
            res.setHeader('content-type', 'application/json')
            res.end(JSON.stringify({
              error:
                'Dev proxy missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Use netlify dev or add them to .env.local.',
            }))
            return
          }
          try {
            const chunks: Buffer[] = []
            for await (const chunk of req) chunks.push(chunk as Buffer)
            const body = Buffer.concat(chunks).toString('utf8')
            const { createClient } = await import('@supabase/supabase-js')
            const supabase = createClient(supabaseUrl, supabaseServiceKey, {
              auth: { autoRefreshToken: false, persistSession: false },
            })
            const payload = JSON.parse(body || '{}')
            const { action, id, playerData, teamAssignment } = payload

            const isMissingActiveColumn = (error: { message?: string; code?: string }) =>
              error?.message?.includes('active') || error?.code === 'PGRST204'

            if (action === 'update') {
              let { data, error } = await supabase
                .from('players')
                .update(playerData)
                .eq('id', id)
                .select()
              if (error && isMissingActiveColumn(error)) {
                const { active: _active, ...withoutActive } = playerData
                void _active
                ;({ data, error } = await supabase
                  .from('players')
                  .update(withoutActive)
                  .eq('id', id)
                  .select())
              }
              if (error) throw error
              if (!data?.length) throw new Error('Player update returned no rows.')
              res.statusCode = 200
              res.setHeader('content-type', 'application/json')
              res.end(JSON.stringify({ player: data[0] }))
              return
            }

            if (action === 'insert') {
              let { data, error } = await supabase.from('players').insert([playerData]).select()
              if (error && isMissingActiveColumn(error)) {
                const { active: _active, ...withoutActive } = playerData
                void _active
                ;({ data, error } = await supabase.from('players').insert([withoutActive]).select())
              }
              if (error) throw error
              if (!data?.length) throw new Error('Player insert returned no rows.')
              let warning: string | undefined
              if (teamAssignment) {
                const { error: teamError } = await supabase.from('player_teams').insert([
                  {
                    player_id: data[0].id,
                    team_type: 'youth',
                    jersey_number: teamAssignment.jersey_number,
                    position: teamAssignment.position,
                    is_captain: teamAssignment.tags?.some((tag: string) =>
                      tag.toLowerCase().includes('captain')
                    ),
                  },
                ])
                if (teamError) {
                  warning = 'Player was saved but could not be assigned to the youth team.'
                }
              }
              res.statusCode = 200
              res.setHeader('content-type', 'application/json')
              res.end(JSON.stringify({ player: data[0], warning }))
              return
            }

            if (action === 'delete') {
              const { data, error } = await supabase.from('players').delete().eq('id', id).select('id')
              if (error) throw error
              if (!data?.length) throw new Error('Player delete returned no rows.')
              res.statusCode = 200
              res.setHeader('content-type', 'application/json')
              res.end(JSON.stringify({ ok: true }))
              return
            }

            res.statusCode = 400
            res.setHeader('content-type', 'application/json')
            res.end(JSON.stringify({ error: `Unknown action: ${action}` }))
          } catch (err) {
            res.statusCode = 500
            res.setHeader('content-type', 'application/json')
            res.end(JSON.stringify({ error: (err as Error).message }))
          }
          return
        }

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
          if (!id.includes('node_modules')) return;

          // Extract the exact installed package name so `react` doesn't
          // greedily swallow `react-router`, `react-icons`, etc., which
          // previously produced a circular vendor <-> react-vendor chunk.
          const normalized = id.replace(/\\/g, '/');
          const match = normalized.match(/node_modules\/(@[^/]+\/[^/]+|[^/]+)/);
          if (!match) return;
          const pkg = match[1];

          if (pkg === 'react' || pkg === 'react-dom' || pkg === 'scheduler') {
            return 'react-vendor';
          }
          if (
            pkg === 'react-router' ||
            pkg === 'react-router-dom' ||
            pkg === '@remix-run/router'
          ) {
            return 'router';
          }
          if (pkg === 'framer-motion') return 'animation';
          if (pkg === 'react-icons' || pkg === 'lucide-react') return 'icons';
          if (pkg.startsWith('@supabase')) return 'supabase';
          if (pkg === 'axios') return 'http';
          if (pkg.startsWith('@stripe')) return 'payments';
          return 'vendor';
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
