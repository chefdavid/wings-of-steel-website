import type { PrintifyProduct } from '../services/printify';

export const mockProducts: PrintifyProduct[] = [
  {
    id: '1',
    title: 'Wings of Steel Team Jersey',
    description: 'Official team jersey with Wings of Steel logo',
    tags: ['jersey', 'team', 'official'],
    options: [
      {
        name: 'Size',
        type: 'size',
        values: [
          { id: 1, title: 'Small' },
          { id: 2, title: 'Medium' },
          { id: 3, title: 'Large' },
          { id: 4, title: 'X-Large' },
          { id: 5, title: 'XX-Large' }
        ]
      },
      {
        name: 'Color',
        type: 'color',
        values: [
          { id: 6, title: 'Steel Blue', colors: ['#4682B4'] },
          { id: 7, title: 'Dark Steel', colors: ['#1e3a5f'] }
        ]
      }
    ],
    variants: [
      {
        id: 1,
        sku: 'WOS-JERSEY-S-BLUE',
        cost: 2500,
        price: 4500,
        title: 'Small / Steel Blue',
        grams: 200,
        is_enabled: true,
        is_default: true,
        is_available: true,
        options: [1, 6],
        quantity: 100
      },
      {
        id: 2,
        sku: 'WOS-JERSEY-M-BLUE',
        cost: 2500,
        price: 4500,
        title: 'Medium / Steel Blue',
        grams: 220,
        is_enabled: true,
        is_default: false,
        is_available: true,
        options: [2, 6],
        quantity: 100
      },
      {
        id: 3,
        sku: 'WOS-JERSEY-L-BLUE',
        cost: 2500,
        price: 4500,
        title: 'Large / Steel Blue',
        grams: 240,
        is_enabled: true,
        is_default: false,
        is_available: true,
        options: [3, 6],
        quantity: 100
      }
    ],
    images: [
      {
        src: 'https://via.placeholder.com/400x400/4682B4/FFFFFF?text=Team+Jersey',
        variant_ids: [1, 2, 3],
        position: 'front',
        is_default: true,
        is_selected_for_publishing: true
      }
    ],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    visible: true,
    is_locked: false,
    blueprint_id: 1,
    user_id: 1,
    shop_id: 1,
    print_areas: [],
    sales_channel_properties: []
  },
  {
    id: '2',
    title: 'Wings of Steel Hoodie',
    description: 'Comfortable hoodie with embroidered logo',
    tags: ['hoodie', 'apparel', 'warm'],
    options: [
      {
        name: 'Size',
        type: 'size',
        values: [
          { id: 1, title: 'Small' },
          { id: 2, title: 'Medium' },
          { id: 3, title: 'Large' },
          { id: 4, title: 'X-Large' }
        ]
      },
      {
        name: 'Color',
        type: 'color',
        values: [
          { id: 5, title: 'Black', colors: ['#000000'] },
          { id: 6, title: 'Steel Gray', colors: ['#71797E'] }
        ]
      }
    ],
    variants: [
      {
        id: 4,
        sku: 'WOS-HOODIE-M-BLACK',
        cost: 3000,
        price: 5500,
        title: 'Medium / Black',
        grams: 400,
        is_enabled: true,
        is_default: true,
        is_available: true,
        options: [2, 5],
        quantity: 50
      },
      {
        id: 5,
        sku: 'WOS-HOODIE-L-BLACK',
        cost: 3000,
        price: 5500,
        title: 'Large / Black',
        grams: 420,
        is_enabled: true,
        is_default: false,
        is_available: true,
        options: [3, 5],
        quantity: 50
      }
    ],
    images: [
      {
        src: 'https://via.placeholder.com/400x400/000000/FFFFFF?text=Team+Hoodie',
        variant_ids: [4, 5],
        position: 'front',
        is_default: true,
        is_selected_for_publishing: true
      }
    ],
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
    visible: true,
    is_locked: false,
    blueprint_id: 2,
    user_id: 1,
    shop_id: 1,
    print_areas: [],
    sales_channel_properties: []
  },
  {
    id: '3',
    title: 'Wings of Steel Team Cap',
    description: 'Adjustable cap with embroidered logo',
    tags: ['hat', 'cap', 'accessories'],
    options: [
      {
        name: 'Color',
        type: 'color',
        values: [
          { id: 1, title: 'Navy Blue', colors: ['#000080'] },
          { id: 2, title: 'Black', colors: ['#000000'] }
        ]
      }
    ],
    variants: [
      {
        id: 6,
        sku: 'WOS-CAP-NAVY',
        cost: 1200,
        price: 2500,
        title: 'Navy Blue',
        grams: 100,
        is_enabled: true,
        is_default: true,
        is_available: true,
        options: [1],
        quantity: 100
      },
      {
        id: 7,
        sku: 'WOS-CAP-BLACK',
        cost: 1200,
        price: 2500,
        title: 'Black',
        grams: 100,
        is_enabled: true,
        is_default: false,
        is_available: true,
        options: [2],
        quantity: 100
      }
    ],
    images: [
      {
        src: 'https://via.placeholder.com/400x400/000080/FFFFFF?text=Team+Cap',
        variant_ids: [6],
        position: 'front',
        is_default: true,
        is_selected_for_publishing: true
      },
      {
        src: 'https://via.placeholder.com/400x400/000000/FFFFFF?text=Team+Cap',
        variant_ids: [7],
        position: 'front',
        is_default: false,
        is_selected_for_publishing: true
      }
    ],
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-03T00:00:00Z',
    visible: true,
    is_locked: false,
    blueprint_id: 3,
    user_id: 1,
    shop_id: 1,
    print_areas: [],
    sales_channel_properties: []
  },
  {
    id: '4',
    title: 'Wings of Steel Water Bottle',
    description: 'Stainless steel water bottle with team logo',
    tags: ['bottle', 'accessories', 'drinkware'],
    options: [],
    variants: [
      {
        id: 8,
        sku: 'WOS-BOTTLE',
        cost: 1500,
        price: 3000,
        title: 'Default',
        grams: 300,
        is_enabled: true,
        is_default: true,
        is_available: true,
        options: [],
        quantity: 75
      }
    ],
    images: [
      {
        src: 'https://via.placeholder.com/400x400/4682B4/FFFFFF?text=Water+Bottle',
        variant_ids: [8],
        position: 'front',
        is_default: true,
        is_selected_for_publishing: true
      }
    ],
    created_at: '2024-01-04T00:00:00Z',
    updated_at: '2024-01-04T00:00:00Z',
    visible: true,
    is_locked: false,
    blueprint_id: 4,
    user_id: 1,
    shop_id: 1,
    print_areas: [],
    sales_channel_properties: []
  },
  {
    id: '5',
    title: 'Wings of Steel Sticker Pack',
    description: 'Set of 5 vinyl stickers with various team designs',
    tags: ['sticker', 'accessories'],
    options: [],
    variants: [
      {
        id: 9,
        sku: 'WOS-STICKERS',
        cost: 300,
        price: 800,
        title: 'Default',
        grams: 20,
        is_enabled: true,
        is_default: true,
        is_available: true,
        options: [],
        quantity: 200
      }
    ],
    images: [
      {
        src: 'https://via.placeholder.com/400x400/FFFFFF/4682B4?text=Sticker+Pack',
        variant_ids: [9],
        position: 'front',
        is_default: true,
        is_selected_for_publishing: true
      }
    ],
    created_at: '2024-01-05T00:00:00Z',
    updated_at: '2024-01-05T00:00:00Z',
    visible: true,
    is_locked: false,
    blueprint_id: 5,
    user_id: 1,
    shop_id: 1,
    print_areas: [],
    sales_channel_properties: []
  }
];