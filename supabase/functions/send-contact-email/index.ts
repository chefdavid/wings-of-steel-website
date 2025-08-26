import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ContactData {
  name: string
  email: string
  message: string
  type: 'contact' | 'mailing_list'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const contactData: ContactData = await req.json()

    if (contactData.type === 'mailing_list') {
      // Mailing list notification to team managers
      const managerHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>New Mailing List Subscriber</h1>
                <p>Wings of Steel Youth Sled Hockey</p>
              </div>
              <div class="content">
                <p><strong>Name:</strong> ${contactData.name}</p>
                <p><strong>Email:</strong> ${contactData.email}</p>
                <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
              </div>
            </div>
          </body>
        </html>
      `

      // Thank you email to subscriber
      const subscriberHtml = `
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
                <h1>Welcome to Wings of Steel!</h1>
              </div>
              <div class="content">
                <p>Hi ${contactData.name},</p>
                <p>Thank you for subscribing to our mailing list! You'll now receive updates about:</p>
                <ul>
                  <li>Upcoming games and tournaments</li>
                  <li>Team news and achievements</li>
                  <li>Special events and fundraisers</li>
                  <li>Ways to support our mission</li>
                </ul>
                <p><strong>Remember: NO CHILD PAYS TO PLAY!</strong></p>
                <p>If you have any questions, feel free to contact us at info@WingsofSteel.org</p>
                <p>Go Wings of Steel!</p>
              </div>
            </div>
          </body>
        </html>
      `

      // Send emails
      const res = await fetch('https://api.resend.com/emails/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify([
          {
            from: 'Wings of Steel <noreply@wingsofsteel.org>',
            to: ['jeanmwiederholt@gmail.com', 'sjsledhockey@hotmail.com'],
            subject: `New Mailing List Subscriber: ${contactData.name}`,
            html: managerHtml,
          },
          {
            from: 'Wings of Steel <noreply@wingsofsteel.org>',
            to: contactData.email,
            subject: 'Welcome to Wings of Steel Mailing List!',
            html: subscriberHtml,
          }
        ]),
      })

      if (!res.ok) {
        const error = await res.text()
        throw new Error(`Failed to send email: ${error}`)
      }

    } else {
      // Contact form - send to team managers and confirmation to sender
      const managerHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px; }
              .message-box { background: white; padding: 20px; border-left: 4px solid #3b82f6; margin: 20px 0; border-radius: 5px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>New Contact Form Message</h1>
                <p>Wings of Steel Youth Sled Hockey</p>
              </div>
              <div class="content">
                <p><strong>From:</strong> ${contactData.name}</p>
                <p><strong>Email:</strong> <a href="mailto:${contactData.email}">${contactData.email}</a></p>
                <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
                
                <div class="message-box">
                  <p><strong>Message:</strong></p>
                  <p>${contactData.message.replace(/\n/g, '<br>')}</p>
                </div>
                
                <p style="text-align: center; margin-top: 30px;">
                  <a href="mailto:${contactData.email}?subject=Re: Your message to Wings of Steel" 
                     style="background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block;">
                    Reply to ${contactData.name}
                  </a>
                </p>
              </div>
            </div>
          </body>
        </html>
      `

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
                <h1>Thank You for Contacting Us!</h1>
              </div>
              <div class="content">
                <p>Hi ${contactData.name},</p>
                <p>We've received your message and appreciate you reaching out to Wings of Steel Youth Sled Hockey.</p>
                <p>Our team will review your message and get back to you within 24-48 hours.</p>
                
                <div style="background: #f0f9ff; padding: 20px; border-radius: 10px; margin: 20px 0;">
                  <p><strong>Your Message:</strong></p>
                  <p style="color: #6b7280;">${contactData.message}</p>
                </div>
                
                <p>In the meantime, feel free to:</p>
                <ul>
                  <li>Visit our website for more information</li>
                  <li>Follow us on social media for updates</li>
                  <li>Call us at (856) 888-1011 if urgent</li>
                </ul>
                
                <p><strong>Remember: NO CHILD PAYS TO PLAY!</strong></p>
                
                <p>Best regards,<br>Wings of Steel Team</p>
              </div>
            </div>
          </body>
        </html>
      `

      // Send emails
      const res = await fetch('https://api.resend.com/emails/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify([
          {
            from: 'Wings of Steel <noreply@wingsofsteel.org>',
            to: ['jeanmwiederholt@gmail.com', 'sjsledhockey@hotmail.com'],
            subject: `Contact Form: ${contactData.name}`,
            html: managerHtml,
            reply_to: contactData.email,
          },
          {
            from: 'Wings of Steel <noreply@wingsofsteel.org>',
            to: contactData.email,
            subject: 'Thank you for contacting Wings of Steel',
            html: confirmationHtml,
          }
        ]),
      })

      if (!res.ok) {
        const error = await res.text()
        throw new Error(`Failed to send email: ${error}`)
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error sending email:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})