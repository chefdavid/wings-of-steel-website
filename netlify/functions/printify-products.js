// Lists Printify products for the storefront. Uses native fetch (Node 18+ on
// Netlify) so no axios bundling is required.

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:4173',
  'http://localhost:4174',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:4173',
  'http://127.0.0.1:4174',
  'https://wingsofsteel.org',
  'https://wingsofsteel.netlify.app',
];

const corsHeadersFor = (origin) => {
  const isLocalDev = /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
  const allowed = ALLOWED_ORIGINS.includes(origin) || isLocalDev;
  return {
    'Access-Control-Allow-Origin': allowed ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
  };
};

export const handler = async (event) => {
  const origin = event.headers.origin || event.headers.Origin || '';
  const headers = corsHeadersFor(origin);

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const {
    shopId: queryShopId,
    limit = 50,
    page = 1,
  } = event.queryStringParameters || {};
  const shopId =
    queryShopId ||
    process.env.PRINTIFY_SHOP_ID ||
    process.env.VITE_PRINTIFY_SHOP_ID;
  // PRINTIFY_API_KEY is the canonical name (matches the TSavo MCP). The
  // _TOKEN fallbacks keep older deploys working during a rename.
  const apiToken =
    process.env.PRINTIFY_API_KEY ||
    process.env.PRINTIFY_API_TOKEN ||
    process.env.VITE_PRINTIFY_API_TOKEN;

  if (!shopId) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Shop ID is required' }),
    };
  }
  if (!apiToken) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'API Token not configured' }),
    };
  }

  const url = new URL(
    `https://api.printify.com/v1/shops/${shopId}/products.json`,
  );
  url.searchParams.set('limit', String(limit));
  url.searchParams.set('page', String(page));

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    if (!response.ok) {
      console.error('Printify API error', response.status, data);
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({
          error: data?.message || 'Failed to fetch products',
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
      body: JSON.stringify({
        error: err.message || 'Failed to fetch products',
      }),
    };
  }
};
