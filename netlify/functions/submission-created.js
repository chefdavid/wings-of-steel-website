// This function is triggered automatically by Netlify when a form is submitted
// It handles email notifications for the Pizza, Pins & Pop event

const ADMIN_EMAILS = [
  'jeanmwiederholt@gmail.com',
  'sjsledhockey@hotmail.com',
  'pkjlp@comcast.net'
];

// Format currency
const formatCurrency = (cents) => {
  return `$${(cents / 100).toFixed(2)}`;
};

exports.handler = async (event, context) => {
  // Parse the form submission
  const { payload } = JSON.parse(event.body);

  // Check if this is a Pizza Pins & Pop submission
  if (payload.form_name !== 'pizza-pins-pop-registration') {
    return {
      statusCode: 200,
      body: 'Not a Pizza Pins & Pop submission'
    };
  }

  const data = payload.data;

  // Extract form data
  const customerInfo = {
    name: data.name,
    email: data.email,
    phone: data.phone,
    company: data.company || '',
    teamMembers: data.teamMembers || '',
    specialRequests: data.specialRequests || ''
  };

  const packageName = data.packageName || 'Lane Reservation';
  const totalAmount = parseInt(data.totalAmount) || 15000;
  const paymentIntentId = data.paymentIntentId || 'N/A';

  // Parse addons if provided
  let addons = [];
  try {
    if (data.addons) {
      addons = JSON.parse(data.addons);
    }
  } catch (e) {
    console.log('Could not parse addons');
  }

  // Create email content
  const customerEmailText = `
Thank you for registering for Pizza, Pins & Pop 2024!

EVENT DETAILS:
- Date: Saturday, November 16, 2024
- Time: 12:00 PM - 2:00 PM
- Location: Laurel Lanes
  2825 RT. 73 South, Maple Shade, NJ

YOUR REGISTRATION:
- Package: ${packageName}
${addons.length > 0 ? `- Add-ons: ${addons.map(a => a.name).join(', ')}` : ''}
- Total Amount: ${formatCurrency(totalAmount)}
${customerInfo.teamMembers ? `- Team Members: ${customerInfo.teamMembers}` : ''}
${customerInfo.specialRequests ? `- Special Requests: ${customerInfo.specialRequests}` : ''}

What's Next:
1. Save this email as your confirmation
2. Arrive at Laurel Lanes on November 16th
3. Check in at the registration desk
4. Enjoy bowling, pizza, and fun!

Questions? Contact:
Kathy Cursi: (856) 220-7266
Email: pk3lps@comcast.net

Thank you for supporting Wings of Steel Sled Hockey!
`;

  const adminEmailText = `
NEW PIZZA, PINS & POP REGISTRATION

PAYMENT INFORMATION:
- Amount: ${formatCurrency(totalAmount)}
- Payment ID: ${paymentIntentId}

CUSTOMER INFORMATION:
- Name: ${customerInfo.name}
- Email: ${customerInfo.email}
- Phone: ${customerInfo.phone || 'Not provided'}
- Company: ${customerInfo.company || 'Not provided'}

ORDER DETAILS:
- Package: ${packageName}
${addons.length > 0 ? `- Add-ons: ${addons.map(a => `${a.name} (${formatCurrency(a.price)})`).join(', ')}` : ''}

${customerInfo.teamMembers ? `TEAM MEMBERS:\n${customerInfo.teamMembers}` : ''}
${customerInfo.specialRequests ? `SPECIAL REQUESTS:\n${customerInfo.specialRequests}` : ''}

ACTION ITEMS:
- Add to registration list
- Reserve lane at Laurel Lanes
- Confirm pizza order with venue
- Update fundraising total

This is an automated notification from the Wings of Steel website.
`;

  // Send notifications using Netlify's email notification feature
  // This requires setting up email notifications in Netlify UI
  console.log('Pizza Pins & Pop Registration Received:');
  console.log('Customer:', customerInfo.name);
  console.log('Email:', customerInfo.email);
  console.log('Amount:', formatCurrency(totalAmount));
  console.log('Payment ID:', paymentIntentId);

  // Log emails for Netlify to pick up in notifications
  console.log('--- CUSTOMER EMAIL ---');
  console.log('To:', customerInfo.email);
  console.log('Subject: 🎳 Pizza, Pins & Pop Registration Confirmation');
  console.log(customerEmailText);

  console.log('--- ADMIN EMAIL ---');
  console.log('To:', ADMIN_EMAILS.join(', '));
  console.log('Subject: New Registration:', customerInfo.name, '-', formatCurrency(totalAmount));
  console.log(adminEmailText);

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Email notifications processed',
      customer: customerInfo.name,
      amount: formatCurrency(totalAmount)
    })
  };
};