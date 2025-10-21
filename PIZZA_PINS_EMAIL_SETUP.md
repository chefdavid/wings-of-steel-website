# Pizza Pins & Pop Email Notifications Setup

## Issue
Email notifications are not being sent when someone registers for the Pizza Pins & Pop event.

## Root Cause
The component was calling the wrong Netlify function (`send-emails-pizza-pins` instead of `send-pizza-pins-emails`), and email environment variables may not be configured in Netlify.

## Fix Applied
- Updated `PizzaPinsAndPop.tsx` to call the correct function: `send-pizza-pins-emails`

## Required: Configure Email Service in Netlify

You need to add email service credentials to your Netlify environment variables. Choose ONE of the following options:

### Option 1: Gmail (Easiest)
1. Go to your Google Account settings
2. Enable 2-factor authentication
3. Generate an "App Password" for email
4. In Netlify dashboard, add these environment variables:
   - `GMAIL_USER`: Your Gmail address (e.g., yourema il@gmail.com)
   - `GMAIL_APP_PASSWORD`: The app-specific password you generated

### Option 2: SendGrid (Recommended for Production)
1. Sign up at https://sendgrid.com (free tier available)
2. Generate an API key
3. In Netlify dashboard, add this environment variable:
   - `SENDGRID_API_KEY`: Your SendGrid API key

### Option 3: Any SMTP Service (Hotmail, Yahoo, etc.)
In Netlify dashboard, add these environment variables:
- `SMTP_HOST`: SMTP server address (e.g., smtp-mail.outlook.com)
- `SMTP_PORT`: Usually 587
- `SMTP_USER`: Your email address
- `SMTP_PASS`: Your email password
- `SMTP_SECURE`: Set to "true" if using port 465

## How to Add Environment Variables in Netlify

1. Go to your Netlify dashboard
2. Select your site
3. Go to "Site settings" → "Environment variables"
4. Click "Add a variable"
5. Add the required variables based on your chosen email service
6. Redeploy your site after adding variables

## Testing

After configuring the environment variables:
1. Redeploy your site
2. Make a test registration (use Stripe test mode)
3. Check that you receive:
   - Customer confirmation email
   - Admin notification emails to: jeanmwiederholt@gmail.com, sjsledhockey@hotmail.com, pkjlp@comcast.net

## Admin Email Recipients

Emails are sent to these addresses:
- jeanmwiederholt@gmail.com
- sjsledhockey@hotmail.com
- pkjlp@comcast.net

To change these, edit the `ADMIN_EMAILS` array in `netlify/functions/send-pizza-pins-emails.js`
