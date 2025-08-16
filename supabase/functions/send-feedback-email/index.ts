import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const TO_EMAIL = Deno.env.get('FEEDBACK_EMAIL') || 'your-actual-email@gmail.com' // Replace with your email

serve(async (req) => {
  try {
    // Log for debugging
    console.log('Function triggered')
    console.log('RESEND_API_KEY exists:', !!RESEND_API_KEY)
    console.log('TO_EMAIL:', TO_EMAIL)
    
    const { record } = await req.json()
    console.log('Feedback received:', record.text)
    
    // Format the feedback for email
    const emailHtml = `
      <h2>New Website Feedback Received</h2>
      
      <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="color: #333; margin-top: 0;">User Feedback:</h3>
        <p style="font-size: 16px; color: #000;">${record.text}</p>
      </div>
      
      <h3>Location Details:</h3>
      <ul>
        <li><strong>Page URL:</strong> <a href="${record.url}">${record.url}</a></li>
        <li><strong>Element:</strong> ${record.selector || 'Not specified'}</li>
        <li><strong>Position:</strong> x: ${record.position_x}, y: ${record.position_y}</li>
        <li><strong>Screen Size:</strong> ${record.viewport_width}x${record.viewport_height}</li>
        <li><strong>Time:</strong> ${new Date(record.created_at).toLocaleString()}</li>
      </ul>
      
      <h3>Direct Link to Feedback:</h3>
      <p><a href="https://supabase.com/dashboard/project/zfiqvovfhkqiucmuwykw/editor/feedback?filter=id%3Deq%3D${record.id}">View in Supabase Dashboard</a></p>
      
      <hr style="margin: 30px 0;">
      <p style="color: #666; font-size: 12px;">
        This is an automated message from your Wings of Steel website feedback system.
      </p>
    `

    // Check if API key exists
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not set')
      return new Response(
        JSON.stringify({ error: 'Email service not configured. Please set RESEND_API_KEY.' }), 
        { status: 500 }
      )
    }

    // Send email using Resend
    console.log('Sending email to:', TO_EMAIL)
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Wings Feedback <onboarding@resend.dev>',  // Changed to verified domain
        to: [TO_EMAIL],
        subject: `Website Feedback: ${record.text.substring(0, 50)}...`,
        html: emailHtml,
      }),
    })

    const data = await res.json()
    console.log('Resend response:', data)
    
    if (!res.ok) {
      console.error('Resend error:', data)
      return new Response(JSON.stringify({ error: 'Failed to send email', details: data }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      })
    }
    
    return new Response(JSON.stringify({ success: true, data }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})