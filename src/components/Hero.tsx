import { motion } from 'framer-motion';
import { FaHockeyPuck, FaTrophy, FaUsers, FaHeart } from 'react-icons/fa';
import { useSiteSections } from '../hooks';
import { useTeam } from '../hooks/useTeam';
import TeamIndicator from './TeamIndicator';

const Hero = () => {
  const { sections, loading } = useSiteSections();
  const { teamConfig } = useTeam();
  const heroData = sections['hero']?.content as {
    title?: string;
    subtitle?: string;
    tagline?: string;
    description?: string;
  } | undefined;

  if (loading) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-dark-steel">
        <div className="animate-pulse text-ice-blue">Loading...</div>
      </section>
    );
  }

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/images/hockey-sticks2.webp')`,
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
            className="flex justify-center items-center gap-4 mb-4 md:mb-6"
          >
            <FaHockeyPuck className="text-5xl md:text-6xl text-ice-blue animate-pulse" />
            <TeamIndicator size="lg" showDescription />
          </motion.div>

          <div className="mb-4 md:mb-6">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-sport text-white tracking-wide mb-1">
              BREAKING BARRIERS &
            </h1>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-sport text-yellow-400 tracking-wide">
              BUILDING CHAMPIONS
            </h1>
          </div>
          
          <p className="text-lg md:text-2xl text-ice-blue font-display mb-3 md:mb-4">
            {heroData?.title || teamConfig.name}
          </p>
          
          <div className="flex flex-col md:flex-row gap-2 md:gap-3 justify-center items-center mb-4 md:mb-6">
            <div className="flex items-center justify-center gap-2 bg-yellow-400 text-black px-3 py-1.5 md:px-4 md:py-2 rounded-lg font-medium text-xs md:text-sm w-full max-w-xs md:w-auto">
              <FaTrophy className="text-black flex-shrink-0 text-sm" />
              <span className="text-center">{heroData?.subtitle || '2023 National Champions'}</span>
            </div>
            <div className="flex items-center justify-center gap-2 bg-yellow-400 text-black px-3 py-1.5 md:px-4 md:py-2 rounded-lg font-medium text-xs md:text-sm w-full max-w-xs md:w-auto">
              <FaTrophy className="text-black flex-shrink-0 text-sm" />
              <span className="text-center">2025 USA Sled Hockey Champions 1st Place</span>
            </div>
          </div>

          <p className="text-base md:text-lg text-gray-200 max-w-2xl mx-auto leading-relaxed mb-6 md:mb-8 px-2">
            {heroData?.description || teamConfig.description}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center mb-6 md:mb-8">
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="#get-involved"
              className="bg-yellow-400 text-black px-6 py-3 md:px-8 md:py-4 rounded-lg font-bold text-base md:text-lg hover:bg-yellow-300 transition-colors duration-300 shadow-lg flex items-center justify-center gap-2"
            >
              <FaUsers className="text-lg md:text-xl" />
              JOIN THE TEAM
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="#get-involved"
              className="bg-white text-black px-6 py-3 md:px-8 md:py-4 rounded-lg font-bold text-base md:text-lg hover:bg-gray-100 transition-all duration-300 shadow-lg flex items-center justify-center gap-2"
            >
              <FaHeart className="text-yellow-500 text-lg md:text-xl" />
              DONATE NOW
            </motion.a>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="text-lg md:text-xl font-bold text-yellow-400"
          >
            {heroData?.tagline || teamConfig.mission}
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