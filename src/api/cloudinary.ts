// API endpoint for fetching Cloudinary images in development
// This will be handled by Vite's dev server

import { v2 as cloudinary } from 'cloudinary'

// This function will be called by our Vite plugin
export async function fetchCloudinaryImages() {
  // Configure Cloudinary with environment variables
  cloudinary.config({
    cloud_name: import.meta.env.CLOUDINARY_CLOUD_NAME || 'dmieri6cl',
    api_key: import.meta.env.CLOUDINARY_API_KEY,
    api_secret: import.meta.env.CLOUDINARY_API_SECRET,
  })

  try {
    // Fetch all images from Cloudinary
    const result = await cloudinary.search
      .expression('resource_type:image')
      .sort_by('created_at', 'desc')
      .max_results(500) // Get up to 500 images
      .execute()

    // Transform the response
    const images = result.resources.map((resource: any) => ({
      public_id: resource.public_id,
      width: resource.width,
      height: resource.height,
      format: resource.format,
      bytes: resource.bytes,
      created_at: resource.created_at,
      folder: resource.folder || '',
      tags: resource.tags || [],
      secure_url: resource.secure_url,
    }))

    return {
      success: true,
      total: result.total_count,
      images,
    }
  } catch (error) {
    console.error('Error fetching Cloudinary images:', error)
    return {
      success: false,
      error: 'Failed to fetch images',
      message: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}