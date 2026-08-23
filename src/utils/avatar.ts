/**
 * Generate avatar initials from name
 */
export function getInitials(firstName: string, lastName?: string): string {
  const first = firstName?.charAt(0)?.toUpperCase() || '';
  const last = lastName?.charAt(0)?.toUpperCase() || '';
  return first + last;
}

/**
 * Generate avatar SVG data URL
 */
export function generateAvatarUrl(
  firstName: string,
  lastName?: string,
  bgColor: string = '#4682B4',
  textColor: string = '#fff',
  size: number = 128
): string {
  const initials = getInitials(firstName, lastName);
  
  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="${bgColor}" />
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" 
            fill="${textColor}" font-family="Oswald, sans-serif" font-size="${size * 0.4}" font-weight="600">
        ${initials}
      </text>
    </svg>
  `;
  
  // Convert to data URL
  const encoded = encodeURIComponent(svg);
  return `data:image/svg+xml,${encoded}`;
}

/**
 * Rewrite a Supabase Storage public URL to go through the image transformation
 * endpoint at a given render width.
 *
 *   /storage/v1/object/public/<path>
 *   -> /storage/v1/render/image/public/<path>?width=<w>&resize=contain&quality=75
 *
 * `resize=contain` is load-bearing, not decoration. Supabase's default resize
 * mode does NOT preserve aspect ratio when only a width is given — a 450x600
 * portrait comes back as 450->256 wide but still 600 tall, i.e. horizontally
 * squashed, and `object-cover` then happily renders the distortion. With
 * `contain` the same request returns 410x547. Verified 2026-08-23 across
 * portrait, landscape and square sources.
 *
 * Storage serves the original bytes — a player headshot is an 800x800 JPEG at
 * 152 KB painted into a 205px card, and a story cover is a 1178x670 JPEG at
 * 209 KB painted into a 382px slot. Asking the transform endpoint for the size
 * we actually render, and letting it negotiate WebP, measured 152 KB -> 41 KB
 * and 209 KB -> 89 KB on 2026-08-23.
 *
 * This deliberately leaves the stored object alone rather than downscaling it:
 * the same objects back the PhotoSwipe lightboxes on /gallery and
 * /game-highlights, which do want full resolution.
 *
 * Anything that is not a Supabase Storage public URL — a local /images/ path, a
 * data: URI, an external host — is returned untouched.
 */
export function storageImageUrl(url: string, renderWidth: number): string {
  if (!url || !url.includes('/storage/v1/object/public/')) return url;
  // Don't touch a URL that already carries its own query string.
  if (url.includes('?')) return url;

  const transformed = url.replace(
    '/storage/v1/object/public/',
    '/storage/v1/render/image/public/'
  );
  return `${transformed}?width=${Math.round(renderWidth)}&resize=contain&quality=75`;
}

/**
 * Get avatar URL - uses existing image or generates placeholder.
 *
 * `size` is the CSS pixel size of the slot the image lands in. Real images are
 * requested at 2x that so they stay sharp on retina; the generated placeholder
 * is drawn at 1x since it is vector.
 */
export function getAvatarUrl(
  imageUrl: string | null | undefined,
  firstName: string,
  lastName?: string,
  bgColor?: string,
  size?: number
): string {
  if (imageUrl) {
    return size ? storageImageUrl(imageUrl, size * 2) : imageUrl;
  }

  return generateAvatarUrl(firstName, lastName, bgColor, '#fff', size);
}