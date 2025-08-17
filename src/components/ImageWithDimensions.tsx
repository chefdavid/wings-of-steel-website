import { useState, useEffect, useRef } from 'react'
import { Item } from 'react-photoswipe-gallery'
import { motion } from 'framer-motion'

interface ImageWithDimensionsProps {
  src: string
  alt: string
  index: number
}

const ImageWithDimensions: React.FC<ImageWithDimensionsProps> = ({ src, alt, index }) => {
  const [dimensions, setDimensions] = useState({ width: 1600, height: 1200 })
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    // Preload image to get actual dimensions
    const img = new Image()
    img.onload = () => {
      setDimensions({
        width: img.naturalWidth || 1600,
        height: img.naturalHeight || 1200
      })
      setImageLoaded(true)
    }
    img.onerror = () => {
      setImageError(true)
      setImageLoaded(true)
    }
    img.src = src
  }, [src])

  if (imageError) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ delay: Math.min(index * 0.02, 0.3) }}
        className="group relative overflow-hidden rounded-lg bg-steel-gray/10 shadow-lg aspect-[4/3]"
      >
        <div className="w-full h-full flex items-center justify-center bg-steel-gray/20">
          <div className="text-center p-4">
            <svg className="w-12 h-12 mx-auto text-steel-gray/50 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-xs text-steel-gray/70">Image unavailable</p>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: Math.min(index * 0.02, 0.3) }}
      className="group relative overflow-hidden rounded-lg bg-steel-gray/10 shadow-lg hover:shadow-xl hover:shadow-steel-blue/20 transition-all duration-300"
    >
      <Item
        original={src}
        thumbnail={src}
        width={dimensions.width}
        height={dimensions.height}
        alt={alt}
      >
        {({ ref, open }) => (
          <div className="relative aspect-[4/3] cursor-pointer" onClick={open}>
            {/* Loading placeholder */}
            {!imageLoaded && (
              <div className="absolute inset-0 bg-steel-gray/20 animate-pulse" />
            )}
            
            {/* Actual image */}
            <img 
              ref={(el) => {
                imgRef.current = el
                if (ref && typeof ref === 'function') ref(el)
              }}
              src={src} 
              alt={alt}
              className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
            
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-0 left-0 right-0 p-2">
                <p className="text-white text-xs font-oswald line-clamp-1">{alt}</p>
              </div>
            </div>
          </div>
        )}
      </Item>
    </motion.div>
  )
}

export default ImageWithDimensions