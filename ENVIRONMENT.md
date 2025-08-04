# Environment Variables Setup

This document explains how to set up environment variables for local development and deployment.

## Required Environment Variables

The application requires the following environment variables:

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous/public key
- `VITE_SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (for admin operations)
- `SUPABASE_SERVICE_ROLE_KEY`: Same as above, used by Node.js scripts

## Local Development Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Fill in your actual Supabase credentials in the `.env` file.

3. Get your credentials from your Supabase project dashboard:
   - Go to Settings > API
   - Copy the Project URL and anon key
   - Copy the service_role key (keep it secure!)

## Netlify Deployment Setup

The environment variables are already configured in the Netlify dashboard under:
**Site settings > Environment variables**

The following variables are set:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Security Notes

- Never commit `.env` files to version control
- The `.env` file is ignored by git
- Service role keys have admin privileges - keep them secure
- Only the `VITE_` prefixed variables are exposed to the browser
- Netlify's secret scanning is configured to allow these expected environment variables

## Troubleshooting

If you get "Missing environment variables" errors:
1. Make sure you have a `.env` file in the project root
2. Verify all required variables are set
3. For Netlify builds, check the environment variables in the dashboard
4. Restart your development server after adding new variables