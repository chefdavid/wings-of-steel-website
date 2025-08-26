import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RegistrationData {
  playerName: string
  dateOfBirth: string
  parentName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  diagnosis?: string
  experienceLevel: string
  additionalInfo?: string
  emergencyContact: string
  emergencyPhone: string
  howHeard?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const registrationData: RegistrationData = await req.json()

    // Format experience level for display
    const experienceLevelDisplay = {
      'beginner': 'No Experience / Beginner',
      'some': 'Some Experience (1-2 years)',
      'experienced': 'Experienced (3+ years)',
      'sled': 'Previous Sled Hockey Experience'
    }[registrationData.experienceLevel] || registrationData.experienceLevel

    // Calculate age from date of birth
    const birthDate = new Date(registrationData.dateOfBirth)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }

    // Create HTML email template
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px; }
            .section { margin-bottom: 25px; padding: 15px; background: white; border-radius: 8px; border: 1px solid #e5e7eb; }
            .section-title { color: #1e3a8a; font-size: 18px; font-weight: bold; margin-bottom: 10px; border-bottom: 2px solid #3b82f6; padding-bottom: 5px; }
            .field { margin-bottom: 12px; }
            .label { font-weight: bold; color: #6b7280; font-size: 12px; text-transform: uppercase; }
            .value { color: #111827; font-size: 14px; margin-top: 2px; }
            .highlight { background: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
            .badge { display: inline-block; padding: 4px 12px; background: #3b82f6; color: white; border-radius: 12px; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">🏒 New Team Registration</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Wings of Steel Youth Sled Hockey</p>
            </div>
            
            <div class="content">
              <div class="highlight">
                <strong>New registration received!</strong><br>
                Please review the information below and contact the family within 24-48 hours.
              </div>

              <div class="section">
                <div class="section-title">👤 Player Information</div>
                <div class="field">
                  <div class="label">Player Name</div>
                  <div class="value">${registrationData.playerName}</div>
                </div>
                <div class="field">
                  <div class="label">Date of Birth / Age</div>
                  <div class="value">${registrationData.dateOfBirth} (${age} years old)</div>
                </div>
                ${registrationData.diagnosis ? `
                <div class="field">
                  <div class="label">Diagnosis/Disability</div>
                  <div class="value">${registrationData.diagnosis}</div>
                </div>
                ` : ''}
                <div class="field">
                  <div class="label">Hockey Experience</div>
                  <div class="value"><span class="badge">${experienceLevelDisplay}</span></div>
                </div>
              </div>

              <div class="section">
                <div class="section-title">👨‍👩‍👧 Parent/Guardian Contact</div>
                <div class="field">
                  <div class="label">Parent/Guardian Name</div>
                  <div class="value">${registrationData.parentName}</div>
                </div>
                <div class="field">
                  <div class="label">Email</div>
                  <div class="value"><a href="mailto:${registrationData.email}">${registrationData.email}</a></div>
                </div>
                <div class="field">
                  <div class="label">Phone</div>
                  <div class="value"><a href="tel:${registrationData.phone}">${registrationData.phone}</a></div>
                </div>
              </div>

              <div class="section">
                <div class="section-title">📍 Location</div>
                <div class="field">
                  <div class="label">Address</div>
                  <div class="value">
                    ${registrationData.address}<br>
                    ${registrationData.city}, ${registrationData.state} ${registrationData.zipCode}
                  </div>
                </div>
              </div>

              <div class="section">
                <div class="section-title">🚨 Emergency Contact</div>
                <div class="field">
                  <div class="label">Emergency Contact Name</div>
                  <div class="value">${registrationData.emergencyContact}</div>
                </div>
                <div class="field">
                  <div class="label">Emergency Phone</div>
                  <div class="value"><a href="tel:${registrationData.emergencyPhone}">${registrationData.emergencyPhone}</a></div>
                </div>
              </div>

              ${registrationData.additionalInfo || registrationData.howHeard ? `
              <div class="section">
                <div class="section-title">📝 Additional Information</div>
                ${registrationData.howHeard ? `
                <div class="field">
                  <div class="label">How They Heard About Us</div>
                  <div class="value">${registrationData.howHeard}</div>
                </div>
                ` : ''}
                ${registrationData.additionalInfo ? `
                <div class="field">
                  <div class="label">Additional Notes</div>
                  <div class="value">${registrationData.additionalInfo}</div>
                </div>
                ` : ''}
              </div>
              ` : ''}

              <div class="highlight" style="background: #dcfce7; border-left-color: #22c55e;">
                <strong>Next Steps:</strong>
                <ol style="margin: 10px 0 0 20px; padding: 0;">
                  <li>Contact the family within 24-48 hours</li>
                  <li>Schedule a time for them to visit practice</li>
                  <li>Prepare equipment if needed</li>
                  <li>Update registration status in the admin panel</li>
                </ol>
              </div>
            </div>

            <div class="footer">
              <p>This registration was submitted on ${new Date().toLocaleString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</p>
              <p>Wings of Steel Youth Sled Hockey - No Child Pays to Play</p>
            </div>
          </div>
        </body>
      </html>
    `

    // Plain text version for email clients that don't support HTML
    const textContent = `
NEW TEAM REGISTRATION - Wings of Steel Youth Sled Hockey

PLAYER INFORMATION
Name: ${registrationData.playerName}
Date of Birth: ${registrationData.dateOfBirth} (${age} years old)
${registrationData.diagnosis ? `Diagnosis/Disability: ${registrationData.diagnosis}` : ''}
Hockey Experience: ${experienceLevelDisplay}

PARENT/GUARDIAN CONTACT
Name: ${registrationData.parentName}
Email: ${registrationData.email}
Phone: ${registrationData.phone}

ADDRESS
${registrationData.address}
${registrationData.city}, ${registrationData.state} ${registrationData.zipCode}

EMERGENCY CONTACT
Name: ${registrationData.emergencyContact}
Phone: ${registrationData.emergencyPhone}

${registrationData.howHeard ? `How They Heard About Us: ${registrationData.howHeard}` : ''}
${registrationData.additionalInfo ? `Additional Notes: ${registrationData.additionalInfo}` : ''}

Submitted: ${new Date().toLocaleString()}

Please contact this family within 24-48 hours.
    `

    // Create thank you email for the submitter
    const thankYouHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px; }
            .highlight { background: #fef3c7; padding: 20px; border-left: 4px solid #f59e0b; margin: 20px 0; border-radius: 5px; }
            .section { margin: 25px 0; }
            .footer { text-align: center; margin-top: 30px; padding: 20px; background: #f9fafb; border-radius: 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #3b82f6; color: white; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; }
            .logo { font-size: 48px; margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🏒</div>
              <h1 style="margin: 0;">Thank You for Registering!</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Wings of Steel Youth Sled Hockey</p>
            </div>
            
            <div class="content">
              <p style="font-size: 18px; color: #1e3a8a;">Dear ${registrationData.parentName},</p>
              
              <p>Thank you for registering <strong>${registrationData.playerName}</strong> for Wings of Steel Youth Sled Hockey! We're thrilled that you're interested in joining our championship team.</p>
              
              <div class="highlight">
                <strong style="font-size: 18px;">What Happens Next?</strong>
                <ol style="margin: 10px 0 0 0; padding-left: 20px;">
                  <li>Our team will review your registration</li>
                  <li>We'll contact you within 24-48 hours</li>
                  <li>We'll schedule a time for ${registrationData.playerName} to visit a practice</li>
                  <li>All equipment will be provided - <strong>NO COST TO YOU!</strong></li>
                </ol>
              </div>

              <div class="section">
                <h2 style="color: #1e3a8a;">Important Information</h2>
                <p><strong>Practice Location:</strong><br>
                Flyers Skate Zone<br>
                601 Laurel Oak Road<br>
                Voorhees, NJ 08043</p>
                
                <p><strong>What to Bring:</strong><br>
                • Warm clothes (rink can be cold)<br>
                • Water bottle<br>
                • Lots of enthusiasm!</p>
                
                <p><strong>Our Mission:</strong><br>
                At Wings of Steel, we believe every child deserves the opportunity to play sled hockey, regardless of financial circumstances. That's why we proudly maintain our commitment: <strong style="color: #f59e0b;">NO CHILD PAYS TO PLAY!</strong></p>
              </div>

              <div class="section" style="background: #f0f9ff; padding: 20px; border-radius: 10px;">
                <h3 style="color: #1e3a8a; margin-top: 0;">Registration Summary</h3>
                <p style="margin: 5px 0;"><strong>Player:</strong> ${registrationData.playerName}</p>
                <p style="margin: 5px 0;"><strong>Experience Level:</strong> ${experienceLevelDisplay}</p>
                <p style="margin: 5px 0;"><strong>Registration Date:</strong> ${new Date().toLocaleDateString()}</p>
              </div>

              <div class="section">
                <h3 style="color: #1e3a8a;">Questions?</h3>
                <p>If you have any questions or need to update your information, please don't hesitate to contact us:</p>
                <p>
                  📧 Email: <a href="mailto:info@WingsofSteel.org">info@WingsofSteel.org</a><br>
                  📞 Phone: <a href="tel:856-888-1011">(856) 888-1011</a>
                </p>
              </div>

              <div style="text-align: center; margin-top: 30px;">
                <p style="font-size: 18px; color: #1e3a8a; font-weight: bold;">
                  We can't wait to welcome ${registrationData.playerName} to the team!
                </p>
              </div>
            </div>

            <div class="footer">
              <p style="margin: 0; font-weight: bold; color: #1e3a8a;">Wings of Steel Youth Sled Hockey</p>
              <p style="margin: 5px 0; color: #6b7280;">Breaking Barriers & Building Champions</p>
              <p style="margin: 5px 0; color: #f59e0b; font-weight: bold;">NO CHILD PAYS TO PLAY</p>
            </div>
          </div>
        </body>
      </html>
    `

    const thankYouText = `
Thank You for Registering!

Dear ${registrationData.parentName},

Thank you for registering ${registrationData.playerName} for Wings of Steel Youth Sled Hockey! 
We're thrilled that you're interested in joining our championship team.

WHAT HAPPENS NEXT?
1. Our team will review your registration
2. We'll contact you within 24-48 hours
3. We'll schedule a time for ${registrationData.playerName} to visit a practice
4. All equipment will be provided - NO COST TO YOU!

PRACTICE LOCATION:
Flyers Skate Zone
601 Laurel Oak Road
Voorhees, NJ 08043

WHAT TO BRING:
• Warm clothes (rink can be cold)
• Water bottle
• Lots of enthusiasm!

REGISTRATION SUMMARY:
Player: ${registrationData.playerName}
Experience Level: ${experienceLevelDisplay}
Registration Date: ${new Date().toLocaleDateString()}

If you have any questions, please contact us:
Email: info@WingsofSteel.org
Phone: (856) 888-1011

We can't wait to welcome ${registrationData.playerName} to the team!

---
Wings of Steel Youth Sled Hockey
Breaking Barriers & Building Champions
NO CHILD PAYS TO PLAY
    `

    // Send both emails using Resend API batch endpoint
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
          subject: `New Team Registration: ${registrationData.playerName}`,
          html: htmlContent,
          text: textContent,
          reply_to: registrationData.email,
        },
        {
          from: 'Wings of Steel <noreply@wingsofsteel.org>',
          to: registrationData.email,
          subject: 'Thank You for Registering with Wings of Steel!',
          html: thankYouHtml,
          text: thankYouText,
        }
      ]),
    })

    if (!res.ok) {
      const error = await res.text()
      throw new Error(`Failed to send email: ${error}`)
    }

    const data = await res.json()

    return new Response(
      JSON.stringify({ success: true, messageIds: data.data }),
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