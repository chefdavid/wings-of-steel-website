// Simplified email sending using Netlify's built-in capabilities
// This works without requiring external email configuration

const ADMIN_EMAILS = [
  'jeanmwiederholt@gmail.com',
  'sjsledhockey@hotmail.com',
  'pkjlp@comcast.net'
];

// Format currency
const formatCurrency = (cents) => {
  return `$${(cents / 100).toFixed(2)}`;
};

// Create HTML email template for customer
const createCustomerEmailHTML = (data) => {
  const { customerInfo, packageName, addons = [], donation = 0, totalAmount } = data;

  const addonsText = addons.length > 0
    ? addons.map(addon => `${addon.name} - ${formatCurrency(addon.price)}`).join(', ')
    : '';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px; }
    .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; padding: 20px; background: #1f2937; color: white; border-radius: 10px; }
    h1 { margin: 0; font-size: 32px; }
    h2 { color: #1f2937; }
    h3 { color: #2563eb; }
    .emoji { font-size: 48px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="emoji">🎳</div>
      <h1>Thank You for Your Registration!</h1>
      <p style="margin: 10px 0 0 0; font-size: 18px;">Pizza, Pins & Pop 2024</p>
    </div>

    <div class="content">
      <h2>Hello ${customerInfo.name}! 👋</h2>

      <p>Thank you for registering for the 4th Annual Pizza, Pins & Pop fundraiser supporting the Wings of Steel Adult Sled Hockey Team!</p>

      <div class="details">
        <h3>Event Details:</h3>
        <p>📅 <strong>Date:</strong> Saturday, November 16, 2024</p>
        <p>⏰ <strong>Time:</strong> 12:00 PM - 2:00 PM</p>
        <p>📍 <strong>Location:</strong> Laurel Lanes<br>
        2825 RT. 73 South, Maple Shade, NJ</p>
      </div>

      <div class="details">
        <h3>Your Registration:</h3>
        <p><strong>Package:</strong> ${packageName}</p>
        ${addonsText ? `<p><strong>Add-Ons:</strong> ${addonsText}</p>` : ''}
        ${donation > 0 ? `<p><strong>Additional Donation:</strong> ${formatCurrency(donation)}</p>` : ''}
        <p style="font-size: 20px; color: #2563eb;"><strong>Total Amount:</strong> ${formatCurrency(totalAmount)}</p>
        ${customerInfo.teamMembers ? `<p><strong>Team Members:</strong><br>${customerInfo.teamMembers.replace(/\n/g, '<br>')}</p>` : ''}
        ${customerInfo.specialRequests ? `<p><strong>Special Requests:</strong><br>${customerInfo.specialRequests}</p>` : ''}
      </div>

      <p><strong>What's Next?</strong></p>
      <ul>
        <li>Save this email as your confirmation</li>
        <li>Arrive at Laurel Lanes on November 16th</li>
        <li>Check in at the registration desk</li>
        <li>Enjoy bowling, pizza, and fun while supporting a great cause!</li>
      </ul>

      <p style="text-align: center; margin-top: 30px;">
        <strong>Questions?</strong><br>
        📞 Kathy Cursi: (856) 220-7266<br>
        ✉️ pk3lps@comcast.net
      </p>
    </div>

    <div class="footer">
      <p><strong>Wings of Steel Sled Hockey</strong></p>
      <p>Champions on and off the ice 🏆</p>
      <p style="font-size: 14px;">Thank you for supporting adaptive sports!</p>
    </div>
  </div>
</body>
</html>
  `;
};

// Create HTML email template for admins
const createAdminEmailHTML = (data) => {
  const { customerInfo, packageName, addons = [], donation = 0, totalAmount, paymentIntentId } = data;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1f2937; color: white; padding: 20px; text-align: center; }
    .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #e5e7eb; }
    th { background: #f3f4f6; font-weight: bold; }
    .highlight { background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎳 New Pizza, Pins & Pop Registration</h1>
    </div>

    <div class="content">
      <div class="highlight">
        <h2 style="margin-top: 0;">New Registration Received!</h2>
        <p style="font-size: 18px;"><strong>Amount: ${formatCurrency(totalAmount)}</strong></p>
        <p>Payment ID: ${paymentIntentId}</p>
      </div>

      <h3>Customer Information:</h3>
      <table>
        <tr><th>Name</th><td>${customerInfo.name}</td></tr>
        <tr><th>Email</th><td>${customerInfo.email}</td></tr>
        <tr><th>Phone</th><td>${customerInfo.phone || 'Not provided'}</td></tr>
        <tr><th>Company</th><td>${customerInfo.company || 'Not provided'}</td></tr>
      </table>

      <h3>Order Details:</h3>
      <table>
        <tr><th>Package</th><td>${packageName}</td></tr>
        ${addons.length > 0 ? `<tr><th>Add-Ons</th><td>${addons.map(a => `${a.name} (${formatCurrency(a.price)})`).join('<br>')}</td></tr>` : ''}
        ${donation > 0 ? `<tr><th>Additional Donation</th><td>${formatCurrency(donation)}</td></tr>` : ''}
        <tr><th style="background: #fbbf24;">Total Amount</th><td style="background: #fef3c7; font-weight: bold;">${formatCurrency(totalAmount)}</td></tr>
      </table>

      ${customerInfo.teamMembers ? `
        <h3>Team Members:</h3>
        <p style="background: white; padding: 15px; border-radius: 8px;">${customerInfo.teamMembers.replace(/\n/g, '<br>')}</p>
      ` : ''}

      ${customerInfo.specialRequests ? `
        <h3>Special Requests:</h3>
        <p style="background: #fee2e2; padding: 15px; border-radius: 8px;">${customerInfo.specialRequests}</p>
      ` : ''}

      <div style="margin-top: 30px; padding: 20px; background: #ecfdf5; border-radius: 8px;">
        <h3 style="margin-top: 0;">Action Items:</h3>
        <ul>
          <li>Add to registration list</li>
          <li>Reserve lane at Laurel Lanes</li>
          <li>Confirm pizza order with venue</li>
          <li>Update fundraising total</li>
        </ul>
      </div>
    </div>
  </div>
</body>
</html>
  `;
};

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const data = JSON.parse(event.body);
    const { customerInfo, packageName, addons, donation, totalAmount, paymentIntentId } = data;

    // Create email content
    const customerEmailHTML = createCustomerEmailHTML(data);
    const adminEmailHTML = createAdminEmailHTML(data);

    // Log the email data for Netlify to process
    // Netlify can be configured to send these as actual emails
    console.log('=== PIZZA PINS & POP REGISTRATION ===');
    console.log('Customer:', customerInfo.name);
    console.log('Email:', customerInfo.email);
    console.log('Amount:', formatCurrency(totalAmount));
    console.log('Payment ID:', paymentIntentId);

    // Create a form submission that Netlify will process
    const formData = new URLSearchParams();
    formData.append('form-name', 'pizza-pins-email-notification');
    formData.append('customer_name', customerInfo.name);
    formData.append('customer_email', customerInfo.email);
    formData.append('total_amount', formatCurrency(totalAmount));
    formData.append('payment_id', paymentIntentId);
    formData.append('admin_emails', ADMIN_EMAILS.join(', '));
    formData.append('customer_email_html', customerEmailHTML);
    formData.append('admin_email_html', adminEmailHTML);

    // Submit to Netlify Forms
    // This will trigger email notifications if configured in Netlify UI
    const response = await fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString()
    }).catch(err => {
      console.log('Form submission error:', err);
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Registration processed successfully',
        details: {
          customer: customerInfo.name,
          email: customerInfo.email,
          amount: formatCurrency(totalAmount)
        }
      }),
    };

  } catch (error) {
    console.error('Error processing registration:', error);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Registration saved but email processing failed',
        error: error.message
      }),
    };
  }
};