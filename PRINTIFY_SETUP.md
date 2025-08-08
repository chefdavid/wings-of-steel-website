# Printify Store Integration

## Setup Instructions

### 1. Get Printify API Credentials

1. Sign up for a Printify account at [printify.com](https://printify.com)
2. Go to your account settings
3. Navigate to the API section
4. Generate a Personal Access Token
5. Note your Shop ID from the shop settings

### 2. Configure Environment Variables

Create a `.env` file in the project root (copy from `.env.example`):

```bash
VITE_PRINTIFY_API_TOKEN=your_printify_api_token_here
VITE_PRINTIFY_SHOP_ID=your_shop_id_here
```

### 3. Create Products in Printify

1. Log into your Printify dashboard
2. Create products with your Wings of Steel designs
3. Set pricing for each product
4. Publish products to make them available via API

## Features

- **Product Listing**: Browse all available merchandise
- **Product Details**: View detailed product information and variants
- **Shopping Cart**: Add items to cart with persistent storage
- **Checkout**: Complete orders with shipping information
- **Responsive Design**: Optimized for mobile and desktop

## API Integration

The integration uses Printify's REST API to:
- Fetch product catalog
- Display product variants and pricing
- Create orders when customers checkout

## Testing

1. Start the development server: `npm run dev`
2. Navigate to any team page (e.g., `/team/youth`)
3. Click on "Store" in the navigation
4. Products will load from your Printify account

## Deployment

For production deployment on Netlify:
1. Add environment variables in Netlify dashboard
2. Deploy the site
3. Test the store functionality

## Support

For Printify API issues, refer to [developers.printify.com](https://developers.printify.com)