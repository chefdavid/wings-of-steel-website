import { useState, useEffect, useRef } from 'react'

interface OptimizedImageProps {
  src: string
  webpSrc?: string
  alt: string
  className?: string
  width?: number
  height?: number
  loading?: 'lazy' | 'eager'
  onLoad?: () => void
  sizes?: string
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  webpSrc,
  alt,
  className = '',
  width,
  height,
  loading = 'lazy',
  onLoad,
  sizes
}) => {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    if (loading === 'eager') {
      setIsIntersecting(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true)
          observer.disconnect()
        }
      },
      { rootMargin: '50px' }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [loading])

  const handleLoad = () => {
    setHasLoaded(true)
    onLoad?.()
  }

  // Generate srcset for responsive images
  const generateSrcSet = (baseSrc: string) => {
    if (!baseSrc.includes('http')) return undefined
    
    const ext = baseSrc.split('.').pop()
    const base = baseSrc.substring(0, baseSrc.lastIndexOf('.'))
    
    return `${base}.${ext} 1x, ${base}@2x.${ext} 2x`
  }

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      {!hasLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      <picture>
        {webpSrc && isIntersecting && (
          <source 
            srcSet={webpSrc}
            type="image/webp"
          />
        )}
        <img
          ref={imgRef}
          src={isIntersecting ? src : undefined}
          srcSet={isIntersecting ? generateSrcSet(src) : undefined}
          sizes={sizes}
          alt={alt}
          width={width}
          height={height}
          className={`${className} ${hasLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
          onLoad={handleLoad}
          loading={loading}
        />
      </picture>
    </div>
  )
}

export default OptimizedImage