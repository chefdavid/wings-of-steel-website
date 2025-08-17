import { motion } from 'framer-motion'

const GalleryHero = () => {
  // Using image from Game 14 folder as hero
  const heroImageUrl = '/images/gallery/G14/14-139.jpg'
  
  return (
    <div className="relative h-[70vh] min-h-[500px] max-h-[700px] w-full overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img 
          src={heroImageUrl}
          alt="Wings of Steel Tournament Action - Intense gameplay moment"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        {/* Multi-layer gradient overlay for better text readability and visual depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-dark-steel" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-steel via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-4xl"
        >
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bebas text-white mb-4 tracking-wider drop-shadow-2xl">
            Tournament Gallery
          </h1>
          
          <p className="text-xl sm:text-2xl text-ice-blue font-oswald mb-8 drop-shadow-lg">
            Capturing Every Moment of Victory
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <motion.div 
              className="bg-dark-steel/90 backdrop-blur-md px-8 py-4 rounded-lg border border-steel-blue/40 shadow-2xl"
              whileHover={{ scale: 1.05, borderColor: 'rgb(59, 130, 246, 0.6)' }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="text-4xl font-bebas text-ice-blue">1,191</div>
              <div className="text-sm text-steel-gray uppercase tracking-wider font-medium">Action Photos</div>
            </motion.div>
            
            <motion.div 
              className="bg-dark-steel/90 backdrop-blur-md px-8 py-4 rounded-lg border border-steel-blue/40 shadow-2xl"
              whileHover={{ scale: 1.05, borderColor: 'rgb(59, 130, 246, 0.6)' }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="text-4xl font-bebas text-ice-blue">4</div>
              <div className="text-sm text-steel-gray uppercase tracking-wider font-medium">Tournament Games</div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="mt-8"
          >
            <p className="text-steel-gray text-lg italic">
              "Every save, every goal, every celebration captured"
            </p>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <svg className="w-6 h-6 text-ice-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </div>
    </div>
  )
}

export default GalleryHero