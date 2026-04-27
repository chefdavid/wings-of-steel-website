import type { PrintifyProduct, ProductImage } from '../../services/printify';

// Printify often marks a flat-lay or detail shot as the default image, so
// images[0] / is_default don't reliably point at the front-facing product
// view. Rank candidates: front > default > published > first available.
const POSITION_RANK: Record<string, number> = {
  front: 0,
  other: 3,
  back: 4,
};

function score(img: ProductImage): number {
  const positionScore = POSITION_RANK[img.position?.toLowerCase()] ?? 2;
  const defaultBonus = img.is_default ? -0.5 : 0;
  const publishedBonus = img.is_selected_for_publishing ? -0.25 : 0;
  return positionScore + defaultBonus + publishedBonus;
}

export function getPrimaryImage(product: PrintifyProduct): string {
  const images = product.images ?? [];
  if (images.length === 0) return '';
  const ranked = [...images].sort((a, b) => score(a) - score(b));
  return ranked[0].src;
}

// Pick the best image for a single variant (e.g. a specific color), falling
// back through "any image tagged with that variant" → primary product image.
export function getVariantImage(
  product: PrintifyProduct,
  variantId: number,
): string {
  const images = product.images ?? [];
  const candidates = images.filter((img) =>
    img.variant_ids?.includes(variantId),
  );
  if (candidates.length === 0) return getPrimaryImage(product);
  const ranked = [...candidates].sort((a, b) => score(a) - score(b));
  return ranked[0].src;
}
