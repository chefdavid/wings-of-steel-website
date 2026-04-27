import axios from 'axios';

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
  private functionBaseUrl: string;

  constructor() {
    this.shopId = import.meta.env.VITE_PRINTIFY_SHOP_ID || '';
    this.functionBaseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'https://wingsofsteel.netlify.app'
      : '';

    if (!this.shopId) {
      console.warn('Printify Shop ID not configured. Store features will be limited.');
    }
  }

  async getProducts(limit = 20, page = 1): Promise<PrintifyProduct[]> {
    try {
      const response = await axios.get(`${this.functionBaseUrl}/.netlify/functions/printify-products`, {
        params: { shopId: this.shopId, limit, page },
      });
      return response.data.data || response.data || [];
    } catch (error: any) {
      console.error('Error fetching products:', error);
      if (error?.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        console.error('Full error details:', JSON.stringify(error.response.data, null, 2));
      }
      return [];
    }
  }

  async getProduct(productId: string): Promise<PrintifyProduct | null> {
    try {
      const products = await this.getProducts(50);
      return products.find(p => p.id === productId) || null;
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  }

  async createOrder(order: Order): Promise<{ id: string; status: string }> {
    try {
      const response = await axios.post(`${this.functionBaseUrl}/.netlify/functions/printify-order`, {
        shopId: this.shopId,
        order,
      });
      return response.data;
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
