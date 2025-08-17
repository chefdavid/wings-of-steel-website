// Cloudinary service to fetch all images dynamically
// Uses Cloudinary's client-side search API (no auth required)

export interface CloudinaryResource {
  public_id: string
  resource_type: string
  type: string
  format: string
  version: number
  url: string
  secure_url: string
  width: number
  height: number
  bytes: number
  duration?: number
  tags?: string[]
  folder?: string
  created_at: string
}

export interface CloudinarySearchResponse {
  resources: CloudinaryResource[]
  total_count: number
  next_cursor?: string
}

export class CloudinaryImageService {
  private cloudName: string
  private baseUrl: string

  constructor(cloudName: string) {
    this.cloudName = cloudName
    this.baseUrl = `https://res.cloudinary.com/${cloudName}`
  }

  // Build optimized URLs for images
  getThumbnailUrl(publicId: string): string {
    return `${this.baseUrl}/image/upload/c_fill,w_400,h_300,g_auto,q_auto,f_auto/${publicId}`
  }

  getOptimizedUrl(publicId: string, width: number = 1920): string {
    return `${this.baseUrl}/image/upload/w_${width},q_auto,f_auto/${publicId}`
  }

  // Fetch images using the client-side list API
  // Note: This requires enabling "Resource list" in Cloudinary settings
  async fetchAllImages(): Promise<CloudinaryResource[]> {
    try {
      // Using the client-side resource list endpoint
      // This needs to be enabled in Cloudinary Settings > Security > Resource list
      const response = await fetch(
        `${this.baseUrl}/image/list/all.json`
      )

      if (!response.ok) {
        console.warn('Resource list not enabled. Using fallback method.')
        return this.getFallbackImages()
      }

      const data = await response.json()
      return data.resources || []
    } catch (error) {
      console.error('Error fetching Cloudinary images:', error)
      return this.getFallbackImages()
    }
  }

  // Alternative: Use a tag-based approach (all images must be tagged)
  async fetchImagesByTag(tag: string): Promise<CloudinaryResource[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/image/list/${tag}.json`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch images by tag')
      }

      const data = await response.json()
      return data.resources || []
    } catch (error) {
      console.error('Error fetching images by tag:', error)
      return []
    }
  }

  // Categorize images based on folder or naming pattern
  categorizeImage(resource: CloudinaryResource): string {
    const publicId = resource.public_id.toLowerCase()
    const folder = resource.folder?.toLowerCase() || ''

    // Check folder structure first
    if (folder.includes('game') || publicId.includes('game')) return 'game'
    if (folder.includes('practice') || publicId.includes('practice')) return 'practice'
    if (folder.includes('event') || publicId.includes('event')) return 'events'
    if (folder.includes('team') || publicId.includes('team')) return 'team'
    
    // Check for player photos pattern (number-number_id)
    if (/^\d+-\d+_/.test(resource.public_id)) return 'team'
    
    // Default to team
    return 'team'
  }

  // Get alt text from public ID
  getAltText(resource: CloudinaryResource): string {
    const publicId = resource.public_id
    
    // For player photos
    if (/^(\d+)-\d+_/.test(publicId)) {
      const match = publicId.match(/^(\d+)/)
      if (match) {
        return `Wings of Steel Player #${match[1]}`
      }
    }
    
    // Clean up the public ID for display
    const name = publicId
      .split('/').pop() || publicId // Get filename
      .replace(/_/g, ' ') // Replace underscores with spaces
      .replace(/-/g, ' ') // Replace dashes with spaces
      .replace(/\.[^/.]+$/, '') // Remove extension
      .replace(/\b\w/g, l => l.toUpperCase()) // Capitalize words
    
    return `Wings of Steel - ${name}`
  }

  // Fallback to hardcoded images if API fails
  private getFallbackImages(): CloudinaryResource[] {
    // Return the images we already know about
    const knownPublicIds = [
      '2-249_mnpyun',
      '14-017_zbegnj', 
      '27-009_xsko9u',
      '68-256_mwkbmh',
      '68-003_erdusf'
    ]

    return knownPublicIds.map(id => ({
      public_id: id,
      resource_type: 'image',
      type: 'upload',
      format: 'jpg',
      version: 1,
      url: `http://res.cloudinary.com/${this.cloudName}/image/upload/${id}`,
      secure_url: `https://res.cloudinary.com/${this.cloudName}/image/upload/${id}`,
      width: 1920,
      height: 1080,
      bytes: 0,
      created_at: new Date().toISOString()
    }))
  }
}