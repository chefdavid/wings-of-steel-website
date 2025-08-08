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

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const { shopId, order } = JSON.parse(event.body);
  
  if (!shopId || !order) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Shop ID and order data are required' }),
    };
  }

  try {
    const response = await axios.post(
      `https://api.printify.com/v1/shops/${shopId}/orders.json`,
      order,
      {
        headers: {
          'Authorization': `Bearer ${process.env.VITE_PRINTIFY_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response.data),
    };
  } catch (error) {
    console.error('Error creating order:', error.response?.data || error.message);
    return {
      statusCode: error.response?.status || 500,
      headers,
      body: JSON.stringify({ 
        error: error.response?.data || 'Failed to create order' 
      }),
    };
  }
};