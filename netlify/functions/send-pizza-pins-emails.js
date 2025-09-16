import nodemailer from 'nodemailer';

// Email configuration
const ADMIN_EMAILS = [
  'jeanmwiederholt@gmail.com',
  'sjsledhockey@hotmail.com',
  'pkjlp@comcast.net'
];

// Create a transporter using SMTP
// You can use Gmail, SendGrid, or any SMTP service
const createTransporter = () => {
  // Option 1: Using Gmail (requires app-specific password)
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    return nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });
  }

  // Option 2: Using SendGrid SMTP
  if (process.env.SENDGRID_API_KEY) {
    return nodemailer.createTransporter({
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
      }
    });
  }

  // Option 3: Using generic SMTP (Outlook, Yahoo, etc.)
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  console.error('No email configuration found. Please set up email environment variables.');
  return null;
};

// Format currency
const formatCurrency = (cents) => {
  return `$${(cents / 100).toFixed(2)}`;
};

// Create HTML email template for customer
const createCustomerEmailHTML = (data) => {
  const { customerInfo, packageName, addons = [], donation = 0, totalAmount } = data;

  const addonsHTML = addons.length > 0
    ? `
      <h3 style="color: #2563eb; margin-top: 20px;">Add-Ons:</h3>
      <ul style="list-style: none; padding: 0;">
        ${addons.map(addon => `<li>• ${addon.name} - ${formatCurrency(addon.price)}</li>`).join('')}
      </ul>
    `
    : '';

  const donationHTML = donation > 0
    ? `<p><strong>Additional Donation:</strong> ${formatCurrency(donation)}</p>`
    : '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px; }
        .emoji { font-size: 48px; }
        h1 { margin: 0; font-size: 32px; }
        h2 { color: #1f2937; margin-top: 0; }
        .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; padding: 20px; background: #1f2937; color: white; border-radius: 10px; }
        .btn { display: inline-block; padding: 12px 30px; background: #fbbf24; color: #1f2937; text-decoration: none; border-radius: 25px; font-weight: bold; margin-top: 20px; }
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
            <h3 style="color: #2563eb; margin-top: 0;">Event Details:</h3>
            <p>📅 <strong>Date:</strong> Saturday, October 26, 2024</p>
            <p>⏰ <strong>Time:</strong> 12:00 PM - 2:00 PM</p>
            <p>📍 <strong>Location:</strong> Laurel Lanes<br>
            2825 RT. 73 South, Maple Shade, NJ</p>
          </div>

          <div class="details">
            <h3 style="color: #2563eb; margin-top: 0;">Your Registration:</h3>
            <p><strong>Package:</strong> ${packageName}</p>
            ${addonsHTML}
            ${donationHTML}
            <p style="font-size: 20px; color: #2563eb; margin-top: 20px;">
              <strong>Total Amount:</strong> ${formatCurrency(totalAmount)}
            </p>
            ${customerInfo.teamMembers ? `
              <p><strong>Team Members:</strong><br>${customerInfo.teamMembers.replace(/\n/g, '<br>')}</p>
            ` : ''}
            ${customerInfo.specialRequests ? `
              <p><strong>Special Requests:</strong><br>${customerInfo.specialRequests}</p>
            ` : ''}
          </div>

          <p>Your support means the world to our team! Every dollar raised goes directly to supporting our athletes with equipment, ice time, travel expenses, and tournament fees.</p>

          <p style="margin-top: 30px;"><strong>What's Next?</strong></p>
          <ul style="padding-left: 20px;">
            <li>Save this email as your confirmation</li>
            <li>Arrive at Laurel Lanes on October 26th</li>
            <li>Check in at the registration desk</li>
            <li>Enjoy bowling, pizza, and fun while supporting a great cause!</li>
          </ul>

          <div style="text-align: center; margin-top: 30px;">
            <p>Questions? Contact us:</p>
            <p>📞 Kathy Cursi: (856) 220-7266<br>
            ✉️ pk3lps@comcast.net</p>
          </div>
        </div>

        <div class="footer">
          <p style="margin: 0;"><strong>Wings of Steel Sled Hockey</strong></p>
          <p style="margin: 5px 0;">Champions on and off the ice 🏆</p>
          <p style="margin: 10px 0 0 0; font-size: 14px;">Thank you for supporting adaptive sports!</p>
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
            <p style="font-size: 18px; margin: 5px 0;"><strong>Amount: ${formatCurrency(totalAmount)}</strong></p>
            <p style="margin: 5px 0;">Payment ID: ${paymentIntentId}</p>
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
            ${addons.length > 0 ? `
              <tr><th>Add-Ons</th><td>${addons.map(a => `${a.name} (${formatCurrency(a.price)})`).join('<br>')}</td></tr>
            ` : ''}
            ${donation > 0 ? `
              <tr><th>Additional Donation</th><td>${formatCurrency(donation)}</td></tr>
            ` : ''}
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
            <h3 style="margin-top: 0; color: #065f46;">Action Items:</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Add to registration list</li>
              <li>Reserve lane at Laurel Lanes</li>
              <li>Confirm pizza order with venue</li>
              <li>Update fundraising total</li>
            </ul>
          </div>

          <p style="text-align: center; margin-top: 30px; color: #6b7280;">
            This is an automated notification from the Wings of Steel website.<br>
            Payment processed via Stripe.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const handler = async (event, context) => {
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

    // Create transporter
    const transporter = createTransporter();

    if (!transporter) {
      console.error('Email service not configured');
      // Don't fail the request if email isn't configured
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Email service not configured but registration successful'
        }),
      };
    }

    const fromEmail = process.env.GMAIL_USER || process.env.SMTP_USER || 'noreply@wingsofsteel.org';
    const emailPromises = [];

    // Send customer confirmation email
    if (customerInfo.email) {
      const customerMailOptions = {
        from: `"Wings of Steel" <${fromEmail}>`,
        to: customerInfo.email,
        subject: '🎳 Pizza, Pins & Pop Registration Confirmation',
        html: createCustomerEmailHTML(data),
        text: `Thank you for registering for Pizza, Pins & Pop 2024!\n\nEvent Details:\n- Date: October 26, 2024\n- Time: 12PM-2PM\n- Location: Laurel Lanes, Maple Shade, NJ\n\nYour total: ${formatCurrency(totalAmount)}\n\nSee you there!\n\nWings of Steel Sled Hockey Team`
      };

      emailPromises.push(
        transporter.sendMail(customerMailOptions)
          .then(() => console.log(`Customer email sent to ${customerInfo.email}`))
          .catch(err => console.error(`Failed to send customer email: ${err.message}`))
      );
    }

    // Send admin notification emails
    const adminMailOptions = {
      from: `"Wings of Steel Website" <${fromEmail}>`,
      to: ADMIN_EMAILS.join(', '),
      subject: `🎳 New Registration: ${customerInfo.name} - ${formatCurrency(totalAmount)}`,
      html: createAdminEmailHTML(data),
      text: `New Pizza, Pins & Pop Registration\n\nCustomer: ${customerInfo.name}\nEmail: ${customerInfo.email}\nPhone: ${customerInfo.phone}\nPackage: ${packageName}\nTotal: ${formatCurrency(totalAmount)}\nPayment ID: ${paymentIntentId}\n\nPlease add to registration list.`
    };

    emailPromises.push(
      transporter.sendMail(adminMailOptions)
        .then(() => console.log('Admin notification emails sent'))
        .catch(err => console.error(`Failed to send admin emails: ${err.message}`))
    );

    // Wait for all emails to send
    await Promise.allSettled(emailPromises);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Emails sent successfully'
      }),
    };

  } catch (error) {
    console.error('Error sending emails:', error);

    // Don't fail the whole request if email fails
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Registration successful but email sending failed',
        error: error.message
      }),
    };
  }
};