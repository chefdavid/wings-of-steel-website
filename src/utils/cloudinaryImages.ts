// Cloudinary image configuration for Wings of Steel
// These are the actual images from your Cloudinary account

export interface CloudinaryImageData {
  publicId: string  // The full path in Cloudinary
  alt: string       // Description for accessibility
  category: 'team' | 'game' | 'practice' | 'events'
  width?: number    // Optional: actual image dimensions
  height?: number
}

// Your actual Cloudinary images
export const cloudinaryImages: CloudinaryImageData[] = [
  // Team/Player photos
  {
    publicId: '2-249_mnpyun',
    alt: 'Wings of Steel Player #2',
    category: 'team',
  },
  {
    publicId: '14-017_zbegnj',
    alt: 'Wings of Steel Player #14',
    category: 'team',
  },
  {
    publicId: '27-009_xsko9u',
    alt: 'Wings of Steel Player #27',
    category: 'team',
  },
  {
    publicId: '68-256_mwkbmh',
    alt: 'Wings of Steel Player #68',
    category: 'team',
  },
  {
    publicId: '68-003_erdusf',
    alt: 'Wings of Steel Player #68 - Action Shot',
    category: 'team',
  },
  // You can add more images here as you find their public IDs
  // Categories available: 'team', 'game', 'practice', 'events'
]

// Helper to check if we have real images configured
export const hasConfiguredImages = () => cloudinaryImages.length > 0

// Helper to get test images if none configured
export const getTestImages = (): CloudinaryImageData[] => [
  {
    publicId: 'samples/animals/three-dogs',
    alt: 'Sample image - Three dogs',
    category: 'team',
    width: 1920,
    height: 1280
  },
  {
    publicId: 'samples/landscapes/nature-mountains',
    alt: 'Sample image - Mountains',
    category: 'events',
    width: 1920,
    height: 1080
  },
  {
    publicId: 'samples/people/smiling-man',
    alt: 'Sample image - Smiling man',
    category: 'team',
    width: 640,
    height: 640
  },
]

// Helper to get all unique public IDs from your Cloudinary
export const getAllImageIds = () => {
  return cloudinaryImages.map(img => img.publicId)
}

// Helper to get images by category
export const getImagesByCategory = (category: string) => {
  if (category === 'all') return cloudinaryImages
  return cloudinaryImages.filter(img => img.category === category)
}