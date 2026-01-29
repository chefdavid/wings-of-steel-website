// Admin email addresses for store order notifications
const ADMIN_EMAILS = [
  'jeanmwiederholt@gmail.com',
  'sjsledhockey@hotmail.com',
  'pkjlp@comcast.net'
];

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

  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    console.error('RESEND_API_KEY not configured');
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: false, message: 'Email service not configured' }),
    };
  }

  try {
    const { customer, items, total, paymentId } = JSON.parse(event.body);
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@wingsofsteel.org';

    const formatCurrency = (cents) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(cents / 100);
    };

    const itemsHtml = items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          ${item.title}
          ${item.variant ? `<br><span style="color: #666; font-size: 12px;">${item.variant}</span>` : ''}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${formatCurrency(item.price * item.quantity)}</td>
      </tr>
    `).join('');

    const adminEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Store Order</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #1e3a5f; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: #ffd700; margin: 0; font-size: 24px;">🛒 New Store Order!</h1>
        </div>

        <div style="background: #fff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
          <div style="background: #d4edda; padding: 20px; border-radius: 5px; margin-bottom: 20px; text-align: center;">
            <p style="margin: 0; font-size: 32px; font-weight: bold; color: #155724;">${formatCurrency(total)}</p>
            <p style="margin: 5px 0 0 0; color: #155724;">Store Purchase</p>
          </div>

          <h3 style="margin-top: 0; color: #1e3a5f;">Customer Information</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Name:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${customer.first_name} ${customer.last_name}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Email:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${customer.email}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Phone:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${customer.phone || 'Not provided'}</td>
            </tr>
          </table>

          <h3 style="color: #1e3a5f;">Shipping Address</h3>
          <p style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
            ${customer.first_name} ${customer.last_name}<br>
            ${customer.address1}<br>
            ${customer.address2 ? customer.address2 + '<br>' : ''}
            ${customer.city}, ${customer.region} ${customer.zip}<br>
            ${customer.country}
          </p>

          <h3 style="color: #1e3a5f;">Order Items</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="background: #f5f5f5;">
              <th style="padding: 10px; text-align: left;">Item</th>
              <th style="padding: 10px; text-align: center;">Qty</th>
              <th style="padding: 10px; text-align: right;">Price</th>
            </tr>
            ${itemsHtml}
            <tr style="background: #ffd700;">
              <td colspan="2" style="padding: 10px; font-weight: bold;">Total</td>
              <td style="padding: 10px; text-align: right; font-weight: bold;">${formatCurrency(total)}</td>
            </tr>
          </table>

          <div style="margin-top: 20px; padding: 15px; background: #e3f2fd; border-radius: 5px;">
            <p style="margin: 0; font-size: 12px;">
              <strong>Payment ID:</strong> ${paymentId}<br>
              <strong>Order Status:</strong> Sent to Printify for fulfillment
            </p>
          </div>

          <p style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
            This is an automated notification from the Wings of Steel website.
          </p>
        </div>
      </body>
      </html>
    `;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: ADMIN_EMAILS,
        subject: `🛒 New Store Order: ${formatCurrency(total)} from ${customer.first_name} ${customer.last_name}`,
        html: adminEmailHtml,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Resend API error:', errorText);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: false, message: 'Failed to send notification' }),
      };
    }

    const result = await response.json();
    console.log('Store order notification sent:', result);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, message: 'Notification sent' }),
    };

  } catch (error) {
    console.error('Error sending order notification:', error);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: false, message: error.message }),
    };
  }
};
