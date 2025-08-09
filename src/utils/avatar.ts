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
 * Get avatar URL - uses existing image or generates placeholder
 */
export function getAvatarUrl(
  imageUrl: string | null | undefined,
  firstName: string,
  lastName?: string,
  bgColor?: string,
  size?: number
): string {
  if (imageUrl) {
    return imageUrl;
  }
  
  return generateAvatarUrl(firstName, lastName, bgColor, '#fff', size);
}