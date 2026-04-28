# Netlify Email Setup for Pizza, Pins & Pop

## ✅ Email System Using Netlify

The Pizza, Pins & Pop event now uses Netlify's built-in form handling and notification system. No external email configuration needed!

## 📧 How It Works

1. When a customer completes payment, the system:
   - Processes payment via Stripe
   - Saves registration to database
   - Sends data to Netlify function
   - Netlify handles email delivery

2. **No email credentials needed** in `.env` file
3. **Netlify manages email delivery** automatically

## 🚀 Setup Instructions

### Step 1: Deploy to Netlify

Push your code to GitHub and Netlify will automatically deploy.

### Step 2: Configure Email Notifications in Netlify

1. **Go to Netlify Dashboard**
   - Log in to [Netlify](https://app.netlify.com)
   - Select your site

2. **Set Up Form Notifications**
   - Go to **Forms** in the sidebar
   - You'll see `pizza-pins-email-notification` form automatically detected
   - Click on the form name

3. **Add Email Notifications**
   - Click **Settings & Notifications**
   - Under **Form notifications**, click **Add notification**
   - Choose **Email notification**

4. **Configure Customer Email**
   - **Email to notify**: Use field `{{customer_email}}`
   - **Subject**: `🎳 Pizza, Pins & Pop Registration Confirmation`
   - **Email template**:
     ```
     Thank you for registering, {{customer_name}}!

     Event: Pizza, Pins & Pop 2024
     Date: October 26, 2024
     Time: 12PM-2PM
     Location: Laurel Lanes, Maple Shade, NJ

     Total Amount: {{total_amount}}
     Payment ID: {{payment_id}}

     See you there!
     Wings of Steel Team
     ```

5. **Configure Admin Notifications**
   - Add another notification
   - **Email to notify**:
     ```
     jeanmwiederholt@gmail.com, sjsledhockey@hotmail.com, pkjlp@comcast.net
     ```
   - **Subject**: `New Registration: {{customer_name}} - {{total_amount}}`
   - **Include form data**: Check this box

### Step 3: Alternative - Use Netlify Functions Email

If you prefer programmatic control, you can also:

1. **Use Zapier Integration**
   - In Netlify: Forms → Settings → Add notification → Zapier
   - Connect to email service (Gmail, Outlook, etc.)
   - Map form fields to email template

2. **Use Webhook Integration**
   - In Netlify: Forms → Settings → Add notification → Outgoing webhook
   - Point to your email service API
   - Send form data as JSON

3. **Use Netlify Functions with Email API**
   - The `submission-created.js` function runs automatically
   - Logs all registration data
   - Can integrate with any email API later

## 📊 Monitor Submissions

1. **View All Registrations**
   - Netlify Dashboard → Forms
   - Click on `pizza-pins-email-notification`
   - See all submissions with details

2. **Export Data**
   - Download as CSV
   - Contains all registration info
   - Use for attendee list

3. **Spam Protection**
   - Netlify automatically filters spam
   - Uses honeypot field
   - Optional reCAPTCHA available

## 🎯 What Gets Sent

### To Customer ({{customer_email}}):
- Confirmation of registration
- Event details
- Payment confirmation
- Total amount paid

### To Admins (3 email addresses):
- Customer name and contact
- Package selected
- Add-ons purchased
- Special requests
- Payment ID
- Total amount

## 🔧 Testing

1. **Test Mode**:
   - Make a test registration
   - Check Netlify Forms dashboard
   - Verify emails are sent

2. **Check Logs**:
   - Netlify → Functions → View logs
   - See `send-emails-pizza-pins` function
   - Monitor for errors

## 📝 No Configuration Needed!

Unlike traditional email services, Netlify's approach requires:
- ❌ No SMTP credentials
- ❌ No API keys
- ❌ No email service setup
- ✅ Just configure in Netlify UI

## 🚨 Important Notes

1. **Emails from Netlify**: Emails will come from Netlify's servers
2. **Deliverability**: Generally good, but can vary
3. **Customization**: Limited compared to dedicated email services
4. **Free Tier**: 100 form submissions/month on free plan
5. **Backup**: All data stored in Netlify Forms dashboard

## 💡 Advanced Options

If you need more control later:

1. **SendGrid Integration**: Add SendGrid API for better deliverability
2. **Custom Templates**: Use HTML templates with Netlify Functions
3. **Automated Workflows**: Connect to Zapier/Make for complex flows
4. **SMS Notifications**: Add Twilio for text message alerts

## 📞 Support

- Netlify Forms Docs: https://docs.netlify.com/forms/setup/
- Netlify Support: https://www.netlify.com/support/
- Community Forums: https://answers.netlify.com/

The system is designed to work out-of-the-box with Netlify's infrastructure - just configure the notifications in the dashboard and you're ready to go!