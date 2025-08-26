# Supabase Edge Functions Setup

## Email Notification Function for Team Registrations

### Prerequisites
1. Install Supabase CLI: `npm install -g supabase`
2. Set up a Resend.com account for sending emails
3. Get your Resend API key from https://resend.com/api-keys

### Deployment Steps

1. **Login to Supabase:**
   ```bash
   supabase login
   ```

2. **Link your project:**
   ```bash
   supabase link --project-ref [your-project-ref]
   ```
   
3. **Set the Resend API key secret:**
   ```bash
   supabase secrets set RESEND_API_KEY=re_amiHo6Q1_8TTenvL2dzKehwTisVwxLFZX
   ```

4. **Deploy the registration email function:**
   ```bash
   supabase functions deploy send-registration-email
   ```

### Email Recipients
The function sends TWO emails:

**1. Registration notification to team managers:**
- jeanmwiederholt@gmail.com
- sjsledhockey@hotmail.com

**2. Thank you confirmation to the submitter:**
- Sent to the email address provided in the registration form
- Includes registration summary and next steps

### What Happens When Someone Registers:
1. Form data is saved to the `team_registrations` table
2. Two emails are sent automatically:
   - Team managers receive detailed registration info
   - Parent/guardian receives a thank you confirmation
3. Both emails are professionally formatted HTML templates
4. If email fails, the registration is still saved (no data loss)

### Testing
You can test the function locally:
```bash
supabase functions serve send-registration-email
```

Then make a POST request to test it.

### Monitoring
- Check function logs in Supabase Dashboard > Functions
- Failed emails are logged but don't prevent registration submission
- All registrations are saved to the database regardless of email status