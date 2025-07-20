import { motion } from 'framer-motion';
import { FaHockeyPuck, FaTrophy, FaUsers, FaHeart } from 'react-icons/fa';

const Hero = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://cdn.midjourney.com/eeee2fd6-e61e-4939-a6d9-d0af69074a40/0_2.png')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex justify-center mb-8"
          >
            <FaHockeyPuck className="text-6xl text-ice-blue animate-pulse" />
          </motion.div>

          <div className="mb-8">
            <h1 className="text-4xl md:text-6xl font-sport text-white tracking-wide mb-2">
              BREAKING BARRIERS &
            </h1>
            <h1 className="text-4xl md:text-6xl font-sport text-yellow-400 tracking-wide">
              BUILDING CHAMPIONS
            </h1>
          </div>
          
          <p className="text-xl md:text-2xl text-ice-blue font-display mb-2">
            WINGS OF STEEL
          </p>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center mt-8">
            <div className="flex items-center gap-2 bg-yellow-400 text-black px-6 py-3 rounded-lg font-medium">
              <FaTrophy className="text-black" />
              <span>2025 USA Sled Hockey Champions 1st Place</span>
            </div>
            <div className="flex items-center gap-2 bg-yellow-400 text-black px-6 py-3 rounded-lg font-medium">
              <FaTrophy className="text-black" />
              <span>2024 USA Sled Hockey Champions 1st Place</span>
            </div>
          </div>

          <p className="text-lg md:text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
            Discover the Passion of Wings of Steel Sled Hockey! 
            Explore our Journey, Triumphs, and Community Spirit.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="#get-involved"
              className="bg-yellow-400 text-black px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-300 transition-colors duration-300 shadow-lg flex items-center gap-2"
            >
              <FaUsers />
              JOIN THE TEAM
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="#get-involved"
              className="bg-white text-black px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all duration-300 shadow-lg flex items-center gap-2"
            >
              <FaHeart className="text-yellow-500" />
              DONATE NOW
            </motion.a>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="text-xl font-bold text-yellow-400 mt-8"
          >
            No child pays to play
          </motion.p>
        </motion.div>
      </div>

      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white rounded-full mt-2 animate-bounce"></div>
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;