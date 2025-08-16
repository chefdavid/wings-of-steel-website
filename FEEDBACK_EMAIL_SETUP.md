# Email Notifications for Feedback System

## Quick Setup Guide

### Step 1: Deploy the Edge Function
```bash
# In your terminal, run:
npx supabase functions deploy send-feedback-email
```

### Step 2: Set Environment Variables in Supabase
Go to your Supabase Dashboard > Project Settings > Edge Functions and add:
- `RESEND_API_KEY`: Your Resend API key (get one free at resend.com)
- `FEEDBACK_EMAIL`: Your email address to receive notifications

### Step 3: Create Database Webhook (Easier Method)
1. Go to Supabase Dashboard > Database > Webhooks
2. Click "Create a new webhook"
3. Configure:
   - Name: `feedback-email-notification`
   - Table: `feedback`
   - Events: `Insert`
   - Type: `Supabase Edge Functions`
   - Edge Function: `send-feedback-email`
4. Click "Create webhook"

## How It Works

When someone submits feedback:
1. ✅ Feedback saves to database
2. ✅ Webhook triggers automatically
3. ✅ Email sent to you with:
   - The user's comment
   - Direct link to the exact page/location
   - Screenshot position coordinates
   - Direct link to Supabase dashboard
   - Timestamp

## View Feedback Dashboard

Go to: http://localhost:5173/feedback

This shows:
- All feedback submissions
- Filter by pending/resolved
- Mark as resolved
- Delete old feedback
- Click links to go directly to problem pages

## Email Service Options

### Option A: Resend (Recommended - Free tier available)
1. Sign up at https://resend.com
2. Get your API key
3. Add it to Supabase environment variables

### Option B: SendGrid
Replace the email sending code in the Edge Function with SendGrid API

### Option C: Your SMTP Server
Use Deno's SMTP libraries in the Edge Function

## Testing

1. Submit test feedback on your site
2. Check your email within seconds
3. View in dashboard at /feedback

## Troubleshooting

**Not receiving emails?**
- Check Supabase Function logs: Dashboard > Functions > Logs
- Verify RESEND_API_KEY is set correctly
- Check spam folder
- Verify webhook is enabled in Database > Webhooks

**Want to change email address?**
- Update FEEDBACK_EMAIL in Supabase Edge Functions settings

## Direct Supabase Links

Your project dashboard: https://supabase.com/dashboard/project/zfiqvovfhkqiucmuwykw
Feedback table: https://supabase.com/dashboard/project/zfiqvovfhkqiucmuwykw/editor/feedback