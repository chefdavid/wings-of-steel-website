import axios from 'axios';
import { mockProducts } from '../data/mockProducts';

export interface PrintifyProduct {
  id: string;
  title: string;
  description: string;
  tags: string[];
  options: ProductOption[];
  variants: ProductVariant[];
  images: ProductImage[];
  created_at: string;
  updated_at: string;
  visible: boolean;
  is_locked: boolean;
  blueprint_id: number;
  user_id: number;
  shop_id: number;
  print_areas: PrintArea[];
  sales_channel_properties: Record<string, unknown>[];
}

export interface ProductOption {
  name: string;
  type: string;
  values: OptionValue[];
}

export interface OptionValue {
  id: number;
  title: string;
  colors?: string[];
}

export interface ProductVariant {
  id: number;
  sku: string;
  cost: number;
  price: number;
  title: string;
  grams: number;
  is_enabled: boolean;
  is_default: boolean;
  is_available: boolean;
  options: number[];
  quantity: number;
}

export interface ProductImage {
  src: string;
  variant_ids: number[];
  position: string;
  is_default: boolean;
  is_selected_for_publishing: boolean;
}

export interface PrintArea {
  variant_ids: number[];
  placeholders: Placeholder[];
  background: string;
}

export interface Placeholder {
  position: string;
  images: PlaceholderImage[];
}

export interface PlaceholderImage {
  id: string;
  name: string;
  type: string;
  height: number;
  width: number;
  x: number;
  y: number;
  scale: number;
  angle: number;
}

export interface CartItem {
  product: PrintifyProduct;
  variant: ProductVariant;
  quantity: number;
}

export interface Order {
  id?: string;
  address_to: Address;
  line_items: LineItem[];
  shipping_method: number;
  send_shipping_notification: boolean;
  external_id?: string;
}

export interface Address {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  country: string;
  region: string;
  address1: string;
  address2?: string;
  city: string;
  zip: string;
}

export interface LineItem {
  product_id: string;
  variant_id: number;
  quantity: number;
}

class PrintifyService {
  private shopId: string;
  private useNetlifyFunctions: boolean;

  constructor() {
    this.shopId = import.meta.env.VITE_PRINTIFY_SHOP_ID || '';
    // Always use Netlify functions to avoid CORS issues
    this.useNetlifyFunctions = true;

    if (!this.shopId) {
      console.warn('Printify Shop ID not configured. Store features will be limited.');
    }
  }

  async getProducts(limit = 20, page = 1): Promise<PrintifyProduct[]> {
    try {
      console.log('Fetching products from shop:', this.shopId);
      
      if (this.useNetlifyFunctions) {
        // Use Netlify function to avoid CORS
        // For local dev, use the deployed site's functions
        const baseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
          ? 'https://wingsofsteel.netlify.app'
          : '';
        const response = await axios.get(`${baseUrl}/.netlify/functions/printify-products`, {
          params: { shopId: this.shopId, limit, page },
        });
        console.log('Products response:', response.data);
        return response.data.data || response.data || [];
      } else {
        // Direct API call (won't work from browser due to CORS)
        const apiToken = import.meta.env.VITE_PRINTIFY_API_TOKEN;
        const response = await axios.get(
          `https://api.printify.com/v1/shops/${this.shopId}/products.json`,
          {
            params: { limit, page },
            headers: {
              'Authorization': `Bearer ${apiToken}`,
              'Content-Type': 'application/json',
            },
          }
        );
        console.log('Products response:', response.data);
        return response.data.data || response.data || [];
      }
    } catch (error: any) {
      console.error('Error fetching products:', error);
      if (error?.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        console.error('Full error details:', JSON.stringify(error.response.data, null, 2));
      }
      
      // Use mock data in development if API fails
      const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      if (isDevelopment) {
        console.log('Using mock products for local development');
        return mockProducts;
      }
      
      return [];
    }
  }

  async getProduct(productId: string): Promise<PrintifyProduct | null> {
    try {
      if (this.useNetlifyFunctions) {
        // For simplicity, we'll fetch all products and filter
        // In production, you'd create a separate function for single product
        const products = await this.getProducts(50);
        return products.find(p => p.id === productId) || null;
      } else {
        const apiToken = import.meta.env.VITE_PRINTIFY_API_TOKEN;
        const response = await axios.get(
          `https://api.printify.com/v1/shops/${this.shopId}/products/${productId}.json`,
          {
            headers: {
              'Authorization': `Bearer ${apiToken}`,
              'Content-Type': 'application/json',
            },
          }
        );
        return response.data;
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  }

  async createOrder(order: Order): Promise<{ id: string; status: string }> {
    try {
      if (this.useNetlifyFunctions) {
        const baseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
          ? 'https://wingsofsteel.netlify.app'
          : '';
        const response = await axios.post(`${baseUrl}/.netlify/functions/printify-order`, {
          shopId: this.shopId,
          order,
        });
        return response.data;
      } else {
        const apiToken = import.meta.env.VITE_PRINTIFY_API_TOKEN;
        const response = await axios.post(
          `https://api.printify.com/v1/shops/${this.shopId}/orders.json`,
          order,
          {
            headers: {
              'Authorization': `Bearer ${apiToken}`,
              'Content-Type': 'application/json',
            },
          }
        );
        return response.data;
      }
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  async calculateShipping(): Promise<{ shipping_cost: number; estimated_delivery: string }> {
    // For now, return mock data as shipping calculation requires additional setup
    return {
      shipping_cost: 599, // $5.99 in cents
      estimated_delivery: '5-7 business days'
    };
  }

  formatPrice(cents: number): string {
    return `$${(cents / 100).toFixed(2)}`;
  }
}

export const printifyService = new PrintifyService();