import type { PrintifyProduct } from '../../services/printify';

// Maps Printify tag tokens onto user-facing category buckets. Order matters:
// the first match wins so apparel-specific tags (T-shirts, Hoodies) are checked
// before the generic "Men's Clothing" / "Women's Clothing" fallback.
const TAG_TO_CATEGORY: Array<{ tags: string[]; category: string }> = [
  { tags: ['t-shirt', 't-shirts', 'tee', 'tank'], category: 'Apparel' },
  { tags: ['hoodie', 'hoodies', 'sweatshirt', 'jacket'], category: 'Apparel' },
  { tags: ["men's clothing", "women's clothing", 'apparel'], category: 'Apparel' },
  { tags: ['hat', 'cap', 'beanie', 'headwear'], category: 'Headwear' },
  { tags: ['mug', 'mugs', 'drinkware', 'bottle', 'tumbler'], category: 'Drinkware' },
  { tags: ['bag', 'tote', 'backpack'], category: 'Accessories' },
  { tags: ['sticker', 'stickers', 'pin'], category: 'Accessories' },
  { tags: ['poster', 'print', 'wall art'], category: 'Home' },
  { tags: ['home & living', 'home', 'blanket', 'pillow'], category: 'Home' },
];

export function getCategory(product: PrintifyProduct): string {
  const tokens = [
    ...(product.tags ?? []).map((t) => t.toLowerCase()),
    product.title.toLowerCase(),
  ];

  for (const { tags, category } of TAG_TO_CATEGORY) {
    if (tokens.some((token) => tags.some((tag) => token.includes(tag)))) {
      return category;
    }
  }
  return 'Other';
}

export interface CategoryBucket {
  name: string;
  count: number;
  productIds: string[];
}

export function buildCategoryBuckets(
  products: PrintifyProduct[],
): CategoryBucket[] {
  const buckets = new Map<string, CategoryBucket>();
  for (const product of products) {
    const name = getCategory(product);
    const bucket = buckets.get(name) ?? {
      name,
      count: 0,
      productIds: [],
    };
    bucket.count += 1;
    bucket.productIds.push(product.id);
    buckets.set(name, bucket);
  }

  const PRIORITY = ['Apparel', 'Headwear', 'Drinkware', 'Accessories', 'Home', 'Other'];
  return Array.from(buckets.values()).sort(
    (a, b) => PRIORITY.indexOf(a.name) - PRIORITY.indexOf(b.name),
  );
}
