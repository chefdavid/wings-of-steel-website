import { Handler } from '@netlify/functions'
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dmieri6cl',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export const handler: Handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
  }

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    }
  }

  try {
    // Fetch all images from Cloudinary
    // Using search API to get all images with pagination support
    const maxResults = 500 // Cloudinary max is 500 per request
    
    const result = await cloudinary.search
      .expression('resource_type:image')
      .sort_by('created_at', 'desc')
      .max_results(maxResults)
      .execute()

    // Transform the response to only include needed data
    const images = result.resources.map((resource: any) => ({
      public_id: resource.public_id,
      width: resource.width,
      height: resource.height,
      format: resource.format,
      bytes: resource.bytes,
      created_at: resource.created_at,
      folder: resource.folder || '',
      tags: resource.tags || [],
      // Generate URLs on the fly
      thumbnail_url: cloudinary.url(resource.public_id, {
        width: 400,
        height: 300,
        crop: 'fill',
        gravity: 'auto',
        quality: 'auto',
        format: 'auto',
      }),
      optimized_url: cloudinary.url(resource.public_id, {
        width: 1920,
        quality: 'auto',
        format: 'auto',
      }),
    }))

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        total: result.total_count,
        images,
      }),
    }
  } catch (error) {
    console.error('Error fetching Cloudinary images:', error)
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Failed to fetch images',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    }
  }
}