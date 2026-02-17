import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface InquiryData {
  name: string
  email: string
  phone?: string
  companyName?: string
  interestArea: string
  message?: string
}

const interestAreaLabels: Record<string, string> = {
  general: 'General Donation Information',
  corporate: 'Corporate Sponsorship',
  matching: 'Employer Matching Gifts',
  equipment: 'Equipment Donation',
  volunteer: 'Volunteering',
  other: 'Other',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const data: InquiryData = await req.json()

    const interestLabel = interestAreaLabels[data.interestArea] || data.interestArea

    // Notification email to team managers
    const notificationHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px; }
            .field { margin-bottom: 12px; }
            .field-label { font-weight: bold; color: #1e3a8a; }
            .message-box { background: white; padding: 20px; border-left: 4px solid #facc15; margin: 20px 0; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Donation Inquiry</h1>
              <p>Wings of Steel Youth Sled Hockey</p>
            </div>
            <div class="content">
              <div class="field">
                <span class="field-label">Name:</span> ${data.name}
              </div>
              <div class="field">
                <span class="field-label">Email:</span> <a href="mailto:${data.email}">${data.email}</a>
              </div>
              ${data.phone ? `<div class="field"><span class="field-label">Phone:</span> ${data.phone}</div>` : ''}
              ${data.companyName ? `<div class="field"><span class="field-label">Company:</span> ${data.companyName}</div>` : ''}
              <div class="field">
                <span class="field-label">Interest Area:</span> ${interestLabel}
              </div>
              <div class="field">
                <span class="field-label">Date:</span> ${new Date().toLocaleString()}
              </div>

              ${data.message ? `
                <div class="message-box">
                  <p><strong>Message:</strong></p>
                  <p>${data.message.replace(/\n/g, '<br>')}</p>
                </div>
              ` : ''}

              <p style="text-align: center; margin-top: 30px;">
                <a href="mailto:${data.email}?subject=Re: Your inquiry to Wings of Steel"
                   style="background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block;">
                  Reply to ${data.name}
                </a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `

    // Confirmation email to the submitter
    const confirmationHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px; }
            .logo { font-size: 48px; margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🏒</div>
              <h1>Thank You for Your Interest!</h1>
            </div>
            <div class="content">
              <p>Hi ${data.name},</p>
              <p>Thank you for reaching out to Wings of Steel Youth Sled Hockey! We've received your inquiry about <strong>${interestLabel.toLowerCase()}</strong> and will get back to you within 24-48 hours.</p>

              ${data.message ? `
                <div style="background: #f0f9ff; padding: 20px; border-radius: 10px; margin: 20px 0;">
                  <p><strong>Your Message:</strong></p>
                  <p style="color: #6b7280;">${data.message}</p>
                </div>
              ` : ''}

              <p>In the meantime, you can:</p>
              <ul>
                <li>Make a donation directly on our <a href="https://wingsofsteel.org/donate">donation page</a></li>
                <li>Follow us on <a href="https://www.facebook.com/wingsofsteel">Facebook</a> for team updates</li>
                <li>Call us at <strong>(856) 873-1300</strong> for immediate assistance</li>
              </ul>

              <p><strong>Remember: NO CHILD PAYS TO PLAY!</strong></p>

              <p>Best regards,<br>Kristi Gonzales<br>Wings of Steel Youth Sled Hockey<br>(856) 873-1300</p>
            </div>
          </div>
        </body>
      </html>
    `

    // Send emails via Resend
    const res = await fetch('https://api.resend.com/emails/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify([
        {
          from: 'Wings of Steel <noreply@wingsofsteel.org>',
          to: ['sjsledhockey@hotmail.com', 'kristigonzales1977@yahoo.com'],
          subject: `Donation Inquiry: ${data.name}${data.companyName ? ` (${data.companyName})` : ''} — ${interestLabel}`,
          html: notificationHtml,
          reply_to: data.email,
        },
        {
          from: 'Wings of Steel <noreply@wingsofsteel.org>',
          to: data.email,
          subject: 'Thank you for your interest in Wings of Steel!',
          html: confirmationHtml,
        }
      ]),
    })

    if (!res.ok) {
      const error = await res.text()
      throw new Error(`Failed to send email: ${error}`)
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error) {
    console.error('Error sending donation inquiry email:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
