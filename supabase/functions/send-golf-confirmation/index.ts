import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { to, registrationId, isCaptain, playerName } = await req.json()

    // Fetch registration details
    const { data: registration, error: fetchError } = await supabase
      .from('golf_registrations')
      .select('*')
      .eq('id', registrationId)
      .single()

    if (fetchError || !registration) {
      throw new Error('Registration not found')
    }

    const captain = registration.captain_info
    const players = registration.players
    const total = registration.total_amount

    // Create email content
    let subject = 'Wings of Steel Golf Outing - Registration Confirmation'
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1e3a5f 0%, #4a7ba7 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #ddd; border-radius: 0 0 10px 10px; }
          .highlight { background: #f0f8ff; padding: 15px; border-left: 4px solid #4a7ba7; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 30px; background: #ffd700; color: #1e3a5f; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background: #f5f5f5; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Tom Brake Memorial Golf Outing</h1>
            <h2>April 25, 2025 • Ron Jaworski's Ramblewood Country Club</h2>
          </div>
          <div class="content">
    `

    if (isCaptain) {
      htmlContent += `
        <h2>Thank You, ${captain.firstName}!</h2>
        <p>Your registration for the Tom Brake Memorial Golf Outing has been received.</p>
        
        <div class="highlight">
          <h3>Registration Details</h3>
          <p><strong>Confirmation #:</strong> ${registrationId.slice(0, 8).toUpperCase()}</p>
          <p><strong>Team Captain:</strong> ${captain.firstName} ${captain.lastName}</p>
          <p><strong>Company:</strong> ${captain.company || 'N/A'}</p>
          <p><strong>Total Amount:</strong> $${total}</p>
        </div>

        <h3>Registered Players</h3>
        <table>
          <tr>
            <th>Player Name</th>
            <th>Shirt Size</th>
            <th>Mulligans</th>
          </tr>
      `
      
      players.forEach((player: any, index: number) => {
        const mulliganCount = registration.mulligans[`player${index + 1}`] || 0
        htmlContent += `
          <tr>
            <td>${player.firstName} ${player.lastName} ${player.nickname ? `"${player.nickname}"` : ''}</td>
            <td>${player.shirtSize}</td>
            <td>${mulliganCount}</td>
          </tr>
        `
      })

      htmlContent += `
        </table>

        <h3>Add-Ons & Extras</h3>
        <ul>
      `

      const addOns = registration.add_ons
      if (addOns.dinnerGuests > 0) {
        htmlContent += `<li>${addOns.dinnerGuests} Extra Dinner Guest(s) - $${addOns.dinnerGuests * 50}</li>`
      }
      if (addOns.raffleTickets > 0) {
        htmlContent += `<li>${addOns.raffleTickets} Raffle Ticket Bundle(s) - $${addOns.raffleTickets * 20}</li>`
      }
      if (addOns.sponsorHole) {
        htmlContent += `<li>Hole Sponsorship - $100</li>`
      }
      if (addOns.beatThePro > 0) {
        htmlContent += `<li>${addOns.beatThePro} Beat the Pro Attempt(s) - $${addOns.beatThePro * 20}</li>`
      }
      if (addOns.skinsGame > 0) {
        htmlContent += `<li>${addOns.skinsGame} Skins Game Entry(s) - $${addOns.skinsGame * 25}</li>`
      }

      htmlContent += `
        </ul>

        <div class="highlight" style="background: #fff3cd; border-color: #ffc107;">
          <h3>Payment Instructions</h3>
          <p>Please complete your payment using one of the following methods:</p>
          <ol>
            <li><strong>Online:</strong> Pay securely at wingsofsteel.org/golf-payment</li>
            <li><strong>Check:</strong> Make payable to "Wings of Steel" and mail to:<br>
            Lori Kile c/o Wings of Steel<br>
            1007 Elmwood Ave<br>
            Blackwood, NJ 08012</li>
            <li><strong>Credit Card:</strong> Call (856) 555-0123</li>
          </ol>
          <p><em>Payment is due by April 1, 2025 to secure your spot.</em></p>
        </div>
      `
    } else {
      // Individual player email
      htmlContent += `
        <h2>You're Registered, ${playerName}!</h2>
        <p>${captain.firstName} ${captain.lastName} has registered you for the Tom Brake Memorial Golf Outing.</p>
        
        <div class="highlight">
          <h3>Event Details</h3>
          <p><strong>Date:</strong> Friday, April 25, 2025</p>
          <p><strong>Location:</strong> Ron Jaworski's Ramblewood Country Club<br>
          200 Country Club Parkway, Mt. Laurel, NJ 08054</p>
          <p><strong>Schedule:</strong><br>
          11:00 AM - Registration<br>
          11:15 AM - Lunch<br>
          1:00 PM - Shotgun Start</p>
        </div>
      `
    }

    htmlContent += `
          <h3>What's Included</h3>
          <ul>
            <li>Green fees and cart</li>
            <li>Catered lunch and dinner</li>
            <li>Hot dog and beer on the course</li>
            <li>Team gift and event t-shirt</li>
            <li>Entry into all contests and prizes</li>
          </ul>

          <h3>Your Impact</h3>
          <p>Your participation ensures that <strong>no child pays to play</strong> sled hockey with Wings of Steel. 
          This event funds over 75% of our annual operating budget, providing equipment, ice time, and tournament 
          travel for our athletes.</p>

          <center>
            <a href="https://wingsofsteel.org/golf-outing" class="button">View Event Details</a>
          </center>

          <div class="footer">
            <p>Wings of Steel Sled Hockey • 501(c)(3) Nonprofit • EIN: 45-3553926</p>
            <p>Questions? Contact us at golf@wingsofsteel.org or (856) 555-0123</p>
          </div>
        </div>
      </body>
      </html>
    `

    // Create notification email for team managers
    const managerNotificationHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1e3a5f 0%, #4a7ba7 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #ddd; border-radius: 0 0 10px 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Golf Outing Registration</h1>
          </div>
          <div class="content">
            <h2>Registration Details:</h2>
            <p><strong>Captain:</strong> ${captain.name}</p>
            <p><strong>Email:</strong> ${captain.email}</p>
            <p><strong>Phone:</strong> ${captain.phone}</p>
            <p><strong>Company:</strong> ${captain.company || 'Not provided'}</p>
            <p><strong>Number of Players:</strong> ${players.length}</p>
            <p><strong>Total Amount:</strong> $${total}</p>
            <p><strong>Registration ID:</strong> ${registrationId}</p>
            <h3>Players:</h3>
            <ol>
              ${players.map(p => `<li>${p.name || 'TBD'} ${p.email ? `(${p.email})` : ''}</li>`).join('')}
            </ol>
          </div>
        </div>
      </body>
      </html>
    `

    // Send emails using Resend API
    const emailsToSend = [
      {
        from: 'Wings of Steel <noreply@wingsofsteel.org>',
        to: to,
        subject: subject,
        html: htmlContent,
      }
    ]

    // Only send manager notification for captain registration (not individual players)
    if (isCaptain) {
      emailsToSend.push({
        from: 'Wings of Steel <noreply@wingsofsteel.org>',
        to: ['jeanmwiederholt@gmail.com', 'sjsledhockey@hotmail.com'],
        subject: `New Golf Registration: ${captain.name}`,
        html: managerNotificationHtml,
        reply_to: captain.email,
      })
    }

    const res = await fetch('https://api.resend.com/emails/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify(emailsToSend),
    })

    if (!res.ok) {
      const error = await res.text()
      throw new Error(`Failed to send email: ${error}`)
    }

    // Update registration to mark confirmation as sent
    if (isCaptain) {
      await supabase
        .from('golf_registrations')
        .update({ confirmation_sent: true })
        .eq('id', registrationId)
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Confirmation email queued' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})