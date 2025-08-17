// Local image gallery configuration
// Images are stored in public/images/gallery/{game}/

export interface GalleryImage {
  id: string
  src: string
  thumbnail: string
  alt: string
  width: number
  height: number
}

export interface GalleryFolder {
  name: string
  path: string
  imageCount: number
}

// Generate image paths based on the actual file structure
export const generateLocalImagePaths = (gameNumber: string, count: number): GalleryImage[] => {
  const images: GalleryImage[] = []
  
  for (let i = 1; i <= count; i++) {
    const paddedNum = String(i).padStart(3, '0')
    // Your images are named like "2-001.jpg" in folders like "G2" (uppercase)
    const filename = `${gameNumber}-${paddedNum}.jpg`
    const path = `/images/gallery/G${gameNumber}/${filename}`
    
    images.push({
      id: `${gameNumber}-${paddedNum}`,
      src: path,
      thumbnail: path, // We'll use the same image for both (browser will cache)
      alt: `Game ${gameNumber} - Photo ${i}`,
      width: 1920,
      height: 1080
    })
  }
  
  return images
}

// Gallery folder configuration
export const galleryFolders: GalleryFolder[] = [
  { name: 'All Images', path: '*', imageCount: 1191 },
  { name: 'Game 2', path: 'G2', imageCount: 297 },
  { name: 'Game 14', path: 'G14', imageCount: 298 },
  { name: 'Game 27', path: 'G27', imageCount: 298 },
  { name: 'Game 68', path: 'G68', imageCount: 298 }
]

// Get images for a specific folder with pagination
export const getLocalImages = (folder: string, page: number = 1, limit: number = 50) => {
  let allImages: GalleryImage[] = []
  
  if (folder === '' || folder === '*') {
    // Get all images from all games
    allImages = [
      ...generateLocalImagePaths('2', 297),
      ...generateLocalImagePaths('14', 298),
      ...generateLocalImagePaths('27', 298),
      ...generateLocalImagePaths('68', 298)
    ]
  } else {
    // Get images for specific game (folder is like "G2", "G14", etc.)
    const gameNum = folder.replace('G', '')
    const folderConfig = galleryFolders.find(f => f.path === folder)
    const count = folderConfig?.imageCount || 298
    allImages = generateLocalImagePaths(gameNum, count)
  }
  
  // Apply pagination
  const start = (page - 1) * limit
  const end = start + limit
  const paginatedImages = allImages.slice(start, end)
  
  return {
    images: paginatedImages,
    total: allImages.length,
    totalPages: Math.ceil(allImages.length / limit),
    page,
    limit
  }
}