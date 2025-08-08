import axios from 'axios';

export const handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  const { shopId, limit = 50, page = 1 } = event.queryStringParameters || {};
  
  console.log('Function called with:', { shopId, limit, page });
  console.log('API Token exists:', !!process.env.VITE_PRINTIFY_API_TOKEN);
  
  if (!shopId) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Shop ID is required' }),
    };
  }

  if (!process.env.VITE_PRINTIFY_API_TOKEN) {
    console.error('API Token not found in environment');
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'API Token not configured' }),
    };
  }

  try {
    console.log('Calling Printify API...');
    const response = await axios.get(
      `https://api.printify.com/v1/shops/${shopId}/products.json`,
      {
        params: { limit, page },
        headers: {
          'Authorization': `Bearer ${process.env.VITE_PRINTIFY_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Printify API response received, status:', response.status);
    console.log('Response data structure:', Object.keys(response.data));
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response.data),
    };
  } catch (error) {
    console.error('Error fetching products:', error.message);
    if (error.response) {
      console.error('Printify API error status:', error.response.status);
      console.error('Printify API error data:', JSON.stringify(error.response.data, null, 2));
    }
    
    return {
      statusCode: error.response?.status || 500,
      headers,
      body: JSON.stringify({ 
        error: error.response?.data || error.message || 'Failed to fetch products',
        details: error.response?.data
      }),
    };
  }
};