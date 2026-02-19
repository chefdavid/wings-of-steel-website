const ADMIN_EMAILS = [
  'jeanmwiederholt@gmail.com',
  'sjsledhockey@hotmail.com',
];

export const handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    console.error('RESEND_API_KEY not configured');
    return { statusCode: 200, headers, body: JSON.stringify({ success: false, message: 'Email service not configured' }) };
  }

  try {
    const data = JSON.parse(event.body);
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'Wings of Steel <noreply@wingsofsteel.org>';

    const experienceLabels = {
      beginner: 'No Experience / Beginner',
      some: 'Some Experience (1-2 years)',
      experienced: 'Experienced (3+ years)',
      sled: 'Previous Sled Hockey Experience',
    };
    const experienceDisplay = experienceLabels[data.experienceLevel] || data.experienceLevel;

    // Calculate age
    const birth = new Date(data.dateOfBirth);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;

    // --- Admin notification email ---
    const adminHtml = `
      <!DOCTYPE html><html><head><style>
        body{font-family:Arial,sans-serif;line-height:1.6;color:#333}
        .container{max-width:600px;margin:0 auto;padding:20px}
        .header{background:linear-gradient(135deg,#1e3a8a,#1e40af);color:#fff;padding:30px;text-align:center;border-radius:10px 10px 0 0}
        .content{background:#f9fafb;padding:30px;border:1px solid #e5e7eb;border-radius:0 0 10px 10px}
        .section{margin-bottom:20px;padding:15px;background:#fff;border-radius:8px;border:1px solid #e5e7eb}
        .section-title{color:#1e3a8a;font-size:16px;font-weight:bold;margin-bottom:10px;border-bottom:2px solid #3b82f6;padding-bottom:5px}
        .field{margin-bottom:10px}.label{font-weight:bold;color:#6b7280;font-size:12px;text-transform:uppercase}.value{color:#111827;font-size:14px;margin-top:2px}
        .highlight{background:#fef3c7;padding:15px;border-left:4px solid #f59e0b;margin:20px 0;border-radius:4px}
      </style></head><body><div class="container">
        <div class="header">
          <h1 style="margin:0">New Team Registration</h1>
          <p style="margin:10px 0 0;opacity:.9">Wings of Steel Youth Sled Hockey</p>
        </div>
        <div class="content">
          <div class="highlight"><strong>New registration received!</strong><br>Please contact the family within 24-48 hours.</div>
          <div class="section">
            <div class="section-title">Player Information</div>
            <div class="field"><div class="label">Player Name</div><div class="value">${data.playerName}</div></div>
            <div class="field"><div class="label">Date of Birth / Age</div><div class="value">${data.dateOfBirth} (${age} years old)</div></div>
            ${data.diagnosis ? `<div class="field"><div class="label">Diagnosis</div><div class="value">${data.diagnosis}</div></div>` : ''}
            <div class="field"><div class="label">Experience</div><div class="value">${experienceDisplay}</div></div>
          </div>
          <div class="section">
            <div class="section-title">Parent/Guardian</div>
            <div class="field"><div class="label">Name</div><div class="value">${data.parentName}</div></div>
            <div class="field"><div class="label">Email</div><div class="value"><a href="mailto:${data.email}">${data.email}</a></div></div>
            <div class="field"><div class="label">Phone</div><div class="value"><a href="tel:${data.phone}">${data.phone}</a></div></div>
          </div>
          <div class="section">
            <div class="section-title">Address</div>
            <div class="value">${data.address}<br>${data.city}, ${data.state} ${data.zipCode}</div>
          </div>
          <div class="section">
            <div class="section-title">Emergency Contact</div>
            <div class="field"><div class="label">Name</div><div class="value">${data.emergencyContact}</div></div>
            <div class="field"><div class="label">Phone</div><div class="value"><a href="tel:${data.emergencyPhone}">${data.emergencyPhone}</a></div></div>
          </div>
          ${data.howHeard || data.additionalInfo ? `<div class="section"><div class="section-title">Additional</div>
            ${data.howHeard ? `<div class="field"><div class="label">How They Heard</div><div class="value">${data.howHeard}</div></div>` : ''}
            ${data.additionalInfo ? `<div class="field"><div class="label">Notes</div><div class="value">${data.additionalInfo}</div></div>` : ''}
          </div>` : ''}
          <div class="highlight" style="background:#dcfce7;border-left-color:#22c55e">
            <strong>Next Steps:</strong>
            <ol style="margin:10px 0 0 20px;padding:0">
              <li>Contact the family within 24-48 hours</li>
              <li>Schedule a visit to practice</li>
              <li>Prepare equipment if needed</li>
            </ol>
          </div>
        </div>
      </div></body></html>`;

    // --- Confirmation email to the submitter ---
    const confirmHtml = `
      <!DOCTYPE html><html><head><style>
        body{font-family:Arial,sans-serif;line-height:1.6;color:#333}
        .container{max-width:600px;margin:0 auto;padding:20px}
        .header{background:linear-gradient(135deg,#1e3a8a,#1e40af);color:#fff;padding:40px 30px;text-align:center;border-radius:10px 10px 0 0}
        .content{background:#fff;padding:30px;border:1px solid #e5e7eb;border-radius:0 0 10px 10px}
        .highlight{background:#fef3c7;padding:20px;border-left:4px solid #f59e0b;margin:20px 0;border-radius:5px}
        .footer{text-align:center;margin-top:30px;padding:20px;background:#f9fafb;border-radius:10px}
      </style></head><body><div class="container">
        <div class="header">
          <div style="font-size:48px;margin-bottom:10px">&#127954;</div>
          <h1 style="margin:0">Thank You for Registering!</h1>
          <p style="margin:10px 0 0;opacity:.9">Wings of Steel Youth Sled Hockey</p>
        </div>
        <div class="content">
          <p style="font-size:18px;color:#1e3a8a">Dear ${data.parentName},</p>
          <p>Thank you for registering <strong>${data.playerName}</strong> for Wings of Steel Youth Sled Hockey! We're thrilled that you're interested in joining our championship team.</p>
          <div class="highlight">
            <strong style="font-size:18px">What Happens Next?</strong>
            <ol style="margin:10px 0 0;padding-left:20px">
              <li>Our team will review your registration</li>
              <li>We'll contact you within <strong>24-48 hours</strong></li>
              <li>We'll schedule a time for ${data.playerName} to visit a practice</li>
              <li>All equipment will be provided &mdash; <strong>NO COST TO YOU!</strong></li>
            </ol>
          </div>
          <div style="margin:25px 0">
            <h2 style="color:#1e3a8a">Important Information</h2>
            <p><strong>Practice Location:</strong><br>Flyers Skate Zone<br>601 Laurel Oak Road<br>Voorhees, NJ 08043</p>
            <p><strong>What to Bring:</strong><br>&bull; Warm clothes (rink can be cold)<br>&bull; Water bottle<br>&bull; Lots of enthusiasm!</p>
          </div>
          <div style="background:#f0f9ff;padding:20px;border-radius:10px">
            <h3 style="color:#1e3a8a;margin-top:0">Registration Summary</h3>
            <p style="margin:5px 0"><strong>Player:</strong> ${data.playerName}</p>
            <p style="margin:5px 0"><strong>Experience:</strong> ${experienceDisplay}</p>
            <p style="margin:5px 0"><strong>Registered:</strong> ${new Date().toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })}</p>
          </div>
          <div style="margin:25px 0">
            <h3 style="color:#1e3a8a">Questions?</h3>
            <p>Email: <a href="mailto:info@WingsofSteel.org">info@WingsofSteel.org</a><br>Phone: <a href="tel:856-888-1011">(856) 888-1011</a></p>
          </div>
          <div style="text-align:center;margin-top:30px">
            <p style="font-size:18px;color:#1e3a8a;font-weight:bold">We can't wait to welcome ${data.playerName} to the team!</p>
          </div>
        </div>
        <div class="footer">
          <p style="margin:0;font-weight:bold;color:#1e3a8a">Wings of Steel Youth Sled Hockey</p>
          <p style="margin:5px 0;color:#6b7280">Breaking Barriers &amp; Building Champions</p>
          <p style="margin:5px 0;color:#f59e0b;font-weight:bold">NO CHILD PAYS TO PLAY</p>
        </div>
      </div></body></html>`;

    // Send both emails via Resend batch API
    const response = await fetch('https://api.resend.com/emails/batch', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([
        {
          from: fromEmail,
          to: ADMIN_EMAILS,
          subject: `New Team Registration: ${data.playerName}`,
          html: adminHtml,
          reply_to: data.email,
        },
        {
          from: fromEmail,
          to: data.email,
          subject: 'Thank You for Registering with Wings of Steel!',
          html: confirmHtml,
        },
      ]),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Resend API error:', errorText);
      return { statusCode: 200, headers, body: JSON.stringify({ success: false, message: 'Email send failed', error: errorText }) };
    }

    const result = await response.json();
    console.log('Registration emails sent:', result);

    return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
  } catch (error) {
    console.error('Error sending registration email:', error);
    return { statusCode: 200, headers, body: JSON.stringify({ success: false, message: error.message }) };
  }
};
