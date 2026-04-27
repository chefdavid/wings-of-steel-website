// Submits an order to Printify. Uses native fetch (Node 18+ on Netlify) so no
// axios bundling is required. Note: the production fulfillment path now runs
// from stripe-webhook.js after a successful PaymentIntent. This endpoint is
// kept for any direct/manual order replays.

const ALLOWED_ORIGINS = [
  'https://wingsofsteel.org',
  'https://wingsofsteel.netlify.app',
];

const corsHeadersFor = (origin) => {
  const isLocalDev = /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
  const allowed = ALLOWED_ORIGINS.includes(origin) || isLocalDev;
  return {
    'Access-Control-Allow-Origin': allowed ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };
};

export const handler = async (event) => {
  const origin = event.headers.origin || event.headers.Origin || '';
  const headers = corsHeadersFor(origin);

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid JSON body' }),
    };
  }

  const { shopId: bodyShopId, order } = payload;
  const shopId =
    bodyShopId ||
    process.env.PRINTIFY_SHOP_ID ||
    process.env.VITE_PRINTIFY_SHOP_ID;
  const apiToken =
    process.env.PRINTIFY_API_TOKEN || process.env.VITE_PRINTIFY_API_TOKEN;

  if (!shopId || !order) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Shop ID and order data are required' }),
    };
  }
  if (!apiToken) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'API Token not configured' }),
    };
  }

  try {
    const response = await fetch(
      `https://api.printify.com/v1/shops/${shopId}/orders.json`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(order),
      },
    );

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    if (!response.ok) {
      console.error('Printify order error', response.status, data);
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({
          error: data?.message || 'Failed to create order',
          details: data,
        }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data),
    };
  } catch (err) {
    console.error('Printify fetch threw:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message || 'Failed to create order' }),
    };
  }
};
