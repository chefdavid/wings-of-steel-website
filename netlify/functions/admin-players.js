import { createClient } from '@supabase/supabase-js';
import { handleAdminPlayers } from '../lib/adminPlayersCore.js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: corsHeaders,
    body: JSON.stringify(body),
  };
}

function getClient() {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase service-role credentials are missing.');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Method Not Allowed' });
  }

  try {
    const supabase = getClient();
    const payload = JSON.parse(event.body || '{}');
    const result = await handleAdminPlayers(supabase, payload);
    return jsonResponse(result.statusCode, result.body);
  } catch (error) {
    console.error('admin-players error:', error);
    return jsonResponse(500, { error: error.message || 'Failed to save player' });
  }
};
