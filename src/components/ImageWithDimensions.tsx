import { useState } from 'react'
import { Item } from 'react-photoswipe-gallery'
import { motion } from 'framer-motion'

interface ImageWithDimensionsProps {
  src: string
  thumbnail: string
  width: number
  height: number
  alt: string
  index: number
}

const ImageWithDimensions: React.FC<ImageWithDimensionsProps> = ({
  src,
  thumbnail,
  width,
  height,
  alt,
  index,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

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
        thumbnail={thumbnail}
        width={width}
        height={height}
        alt={alt}
      >
        {({ ref, open }) => (
          <div className="relative aspect-[4/3] cursor-pointer" onClick={open}>
            {!imageLoaded && (
              <div className="absolute inset-0 bg-steel-gray/20 animate-pulse" />
            )}
            <img
              ref={ref as React.Ref<HTMLImageElement>}
              src={thumbnail}
              alt={alt}
              width={width}
              height={height}
              className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              loading="lazy"
              decoding="async"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
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
