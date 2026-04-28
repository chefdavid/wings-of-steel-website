# Email Setup for Pizza, Pins & Pop Event

## ✅ Email Notifications Configured

The Pizza, Pins & Pop event now sends automatic email notifications:

### **Who Gets Emails:**

1. **Customer** - Receives a beautiful confirmation email with:
   - Event details (date, time, location)
   - Their registration details
   - Package and add-ons purchased
   - Total amount paid
   - What to expect next

2. **Admin Team** - All three addresses receive notifications:
   - jeanmwiederholt@gmail.com
   - sjsledhockey@hotmail.com
   - pkjlp@comcast.net

   Admin emails include:
   - Complete customer information
   - Order details with pricing
   - Payment ID for tracking
   - Special requests highlighted
   - Action items checklist

## 📧 Setting Up Email Service

Choose ONE of these options and add to your `.env` file:

### Option 1: Gmail (Easiest)
```env
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx
```

**To get Gmail App Password:**
1. Go to https://myaccount.google.com/security
2. Enable 2-factor authentication (required)
3. Go to "App passwords"
4. Generate a password for "Mail"
5. Use the 16-character password (no spaces)

### Option 2: SendGrid (Most Reliable)
```env
SENDGRID_API_KEY=SG.your-sendgrid-api-key-here
```

**To get SendGrid API Key:**
1. Sign up at https://sendgrid.com (free tier available)
2. Go to Settings → API Keys
3. Create a Full Access API key
4. Copy the key (starts with SG.)

### Option 3: Outlook/Hotmail
```env
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

### Option 4: Yahoo Mail
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-app-password
```

## 🚀 Deployment to Netlify

After setting up locally, add the same environment variables to Netlify:

1. Go to Netlify Dashboard
2. Site Settings → Environment Variables
3. Add your email configuration:
   - For Gmail: Add `GMAIL_USER` and `GMAIL_APP_PASSWORD`
   - For SendGrid: Add `SENDGRID_API_KEY`
   - For SMTP: Add all SMTP_* variables

## 📬 Email Templates

### Customer Email Features:
- Colorful header with bowling emoji
- Event details clearly displayed
- Registration summary with pricing
- Team members list (if provided)
- Special requests highlighted
- Contact information for questions
- Professional footer

### Admin Email Features:
- Clear "New Registration" header
- Total amount prominently displayed
- Customer info in table format
- All order details organized
- Special requests in red highlight
- Action items checklist
- Payment ID for tracking

## 🧪 Testing Emails

1. **Local Testing:**
   - Set up email configuration in `.env`
   - Go to `/pizza-pins-pop`
   - Complete a test registration
   - Check both customer and admin inboxes

2. **Test with Stripe TEST mode:**
   - Use card: 4242 4242 4242 4242
   - Any future date, any CVC
   - Emails will still send in test mode

3. **Check Spam Folder:**
   - First emails might go to spam
   - Mark as "Not Spam" to train filter

## 🔍 Troubleshooting

### Emails Not Sending:

1. **Check Environment Variables:**
   ```bash
   # In Netlify Functions logs, look for:
   "No email configuration found"
   ```

2. **Gmail Issues:**
   - Must use App Password, not regular password
   - 2FA must be enabled
   - Less secure apps won't work

3. **SendGrid Issues:**
   - Verify sender domain if required
   - Check API key permissions
   - Monitor SendGrid dashboard for bounces

4. **SMTP Issues:**
   - Check firewall/port blocking
   - Verify credentials are correct
   - Some providers require app passwords

### Email Going to Spam:

1. Add sender to contacts
2. Use a verified domain (SendGrid)
3. Avoid spam trigger words
4. Include unsubscribe option (for marketing)

## 📊 Monitoring

- Emails are logged in Netlify Functions logs
- Check for success/failure messages
- Payment still processes even if email fails
- Database stores all registration data as backup

## 🎯 What Happens on Each Registration:

1. Customer completes payment
2. Payment processed via Stripe
3. Registration saved to Supabase
4. Customer email sent immediately
5. Admin notifications sent to all 3 addresses
6. Success page shown to customer

## 💡 Future Enhancements:

- Add calendar invite attachment
- Include QR code for check-in
- Send reminder email 1 week before
- Add SMS notifications option
- Create email templates for other events

The email system is designed to never block a registration - even if emails fail, the payment and registration will still complete successfully!