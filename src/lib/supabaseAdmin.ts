import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY

console.log('🔐 Supabase Admin Setup:', {
  hasUrl: !!supabaseUrl,
  hasServiceKey: !!supabaseServiceKey,
  serviceKeyLength: supabaseServiceKey?.length,
  serviceKeyPreview: supabaseServiceKey ? `${supabaseServiceKey.substring(0, 20)}...` : 'NOT FOUND'
});

// Only use service role key if it's available
// WARNING: Service role key bypasses RLS - only use for admin operations
export const supabaseAdmin = supabaseServiceKey && supabaseUrl
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

console.log('🔐 Supabase Admin client created:', !!supabaseAdmin);