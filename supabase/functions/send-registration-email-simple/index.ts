import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const registrationData = await req.json()

    // Calculate age
    const birthDate = new Date(registrationData.dateOfBirth)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }

    // Format experience level
    const experienceLevel = {
      'beginner': 'No Experience / Beginner',
      'some': 'Some Experience (1-2 years)',
      'experienced': 'Experienced (3+ years)',
      'sled': 'Previous Sled Hockey Experience'
    }[registrationData.experienceLevel] || registrationData.experienceLevel

    // Create a simple text email
    const emailBody = `
New Team Registration Received!

PLAYER INFORMATION
==================
Name: ${registrationData.playerName}
Date of Birth: ${registrationData.dateOfBirth} (Age: ${age})
Experience: ${experienceLevel}
${registrationData.diagnosis ? `Diagnosis: ${registrationData.diagnosis}` : ''}

PARENT/GUARDIAN CONTACT
=======================
Name: ${registrationData.parentName}
Email: ${registrationData.email}
Phone: ${registrationData.phone}

ADDRESS
=======
${registrationData.address}
${registrationData.city}, ${registrationData.state} ${registrationData.zipCode}

EMERGENCY CONTACT
=================
Name: ${registrationData.emergencyContact}
Phone: ${registrationData.emergencyPhone}

${registrationData.howHeard ? `How they heard about us: ${registrationData.howHeard}\n` : ''}
${registrationData.additionalInfo ? `Additional Information: ${registrationData.additionalInfo}\n` : ''}

Submitted: ${new Date().toLocaleString()}

Please contact this family within 24-48 hours.

---
Wings of Steel Youth Sled Hockey
No Child Pays to Play
    `

    // Store the email notification request in a table
    // This can be processed by a webhook or external service
    const { error } = await supabaseClient
      .from('email_queue')
      .insert({
        to: ['jeanmwiederholt@gmail.com', 'sjsledhockey@hotmail.com'],
        subject: `New Team Registration: ${registrationData.playerName}`,
        body: emailBody,
        reply_to: registrationData.email,
        created_at: new Date().toISOString(),
        status: 'pending'
      })

    if (error) throw error

    return new Response(
      JSON.stringify({ success: true, message: 'Email queued for sending' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})