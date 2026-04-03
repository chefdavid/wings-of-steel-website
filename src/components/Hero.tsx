import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaHockeyPuck, FaTrophy, FaUsers, FaHeart } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useSiteSections } from '../hooks';
import { useTeam } from '../hooks/useTeam';
import DonationProgressBar from './DonationProgressBar';

const Hero = () => {
  const { sections, loading } = useSiteSections();
  const { teamConfig } = useTeam();
  const heroData = sections['hero']?.content as {
    title?: string;
    subtitle?: string;  // Legacy: award1
    tagline?: string;   // Legacy: award2
    award1?: string;    // New field name for left trophy
    award2?: string;    // New field name for right trophy
    award3?: string;    // Third trophy placard
    undefeated?: string; // Undefeated season callout
    description?: string;
    mission?: string;
    heading1?: string;
    heading2?: string;
  } | undefined;
  // Removed debug log

  // Preload hero background image
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = '/assets/hockey-sticks.webp';
    document.head.appendChild(link);
  }, []);

  if (loading) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-dark-steel">
        <div className="animate-pulse text-ice-blue">Loading...</div>
      </section>
    );
  }

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden" role="banner" aria-label="Hero section">
      <div 
        className="absolute inset-0 bg-dark-steel"
      >
        <div
          className="hero-bg-image absolute inset-0 bg-contain md:bg-cover bg-top md:bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/images/hockey-sticks2.webp')`,
          }}
        />
        {/* Reduced overlay opacity on mobile for better image visibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 md:from-black/60 via-black/30 md:via-black/40 to-black/40 md:to-black/60"></div>
      </div>

      {/* TB Logo in Top Right - Smaller on mobile */}
      <div className="absolute top-20 md:top-24 right-2 md:right-8 z-30 group">
        <div className="relative">
          <img
            src="/images/tb-logo.png"
            alt="Tom Brake Memorial Logo - In loving memory" 
            className="w-16 md:w-32 lg:w-40 h-auto opacity-90 group-hover:opacity-100 transition-opacity"
          />
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            <p className="text-white text-sm md:text-base font-semibold bg-black/50 backdrop-blur-sm px-3 py-1 rounded">
              In Memory of Tom Brake
            </p>
          </div>
        </div>
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
            className="flex justify-center items-center mb-4 md:mb-6"
          >
            <FaHockeyPuck className="text-5xl md:text-6xl text-ice-blue animate-pulse" aria-hidden="true" />
          </motion.div>

          <div className="mb-4 md:mb-6">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-sport text-white tracking-wide mb-1">
              {heroData?.heading1 || 'BREAKING BARRIERS &'}
            </h1>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-sport text-yellow-400 tracking-wide">
              {heroData?.heading2 || 'BUILDING CHAMPIONS'}
            </h1>
          </div>
          
          <p className="text-lg md:text-2xl text-ice-blue font-display mb-3 md:mb-4">
            {heroData?.title || teamConfig.name}
          </p>
          
          <div className="flex flex-col md:flex-row gap-2 md:gap-3 justify-center items-stretch max-w-3xl mx-auto mb-3 md:mb-4">
            <div className="flex-1 flex items-center justify-center gap-2 bg-yellow-400 text-black px-3 py-3 md:px-4 md:py-4 rounded-lg font-medium text-xs md:text-sm min-h-[56px] md:min-h-[64px]">
              <FaTrophy className="text-black flex-shrink-0 text-sm md:text-base" aria-hidden="true" />
              <span className="text-center leading-relaxed">{heroData?.award1 || heroData?.subtitle || '2023 National Champions'}</span>
            </div>
            <div className="flex-1 flex items-center justify-center gap-2 bg-yellow-400 text-black px-3 py-3 md:px-4 md:py-4 rounded-lg font-medium text-xs md:text-sm min-h-[56px] md:min-h-[64px]">
              <FaTrophy className="text-black flex-shrink-0 text-sm md:text-base" aria-hidden="true" />
              <span className="text-center leading-relaxed">{heroData?.award2 || heroData?.tagline || '2025 USA Sled Hockey Champions 1st Place'}</span>
            </div>
            <div className="flex-1 flex items-center justify-center gap-2 bg-yellow-400 text-black px-3 py-3 md:px-4 md:py-4 rounded-lg font-medium text-xs md:text-sm min-h-[56px] md:min-h-[64px]">
              <FaTrophy className="text-black flex-shrink-0 text-sm md:text-base" aria-hidden="true" />
              <span className="text-center leading-relaxed">{heroData?.award3 || '2026 New England Sled Hockey Tournament — 1st Place Juniors'}</span>
            </div>
          </div>

          {/* Undefeated Season Callout */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="max-w-2xl mx-auto mb-4 md:mb-6"
          >
            <div className="relative px-6 py-3 md:px-8 md:py-4 rounded-lg border-2 border-yellow-400 bg-yellow-400/10 backdrop-blur-sm">
              <div className="flex items-center justify-center gap-3">
                <FaTrophy className="text-yellow-400 text-lg md:text-2xl" aria-hidden="true" />
                <span className="text-base md:text-xl font-sport text-yellow-400 tracking-wider">
                  {heroData?.undefeated || '2025 / 2026 Season — UNDEFEATED'}
                </span>
                <FaTrophy className="text-yellow-400 text-lg md:text-2xl" aria-hidden="true" />
              </div>
            </div>
          </motion.div>

          <p className="text-base md:text-lg text-gray-200 max-w-2xl mx-auto leading-relaxed mb-6 md:mb-8 px-2">
            {heroData?.description || teamConfig.description}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center mb-4 md:mb-6">
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="#get-involved"
              className="bg-yellow-400 text-black px-6 py-3 md:px-8 md:py-4 rounded-lg font-bold text-base md:text-lg hover:bg-yellow-300 transition-colors duration-300 shadow-lg flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-600"
              aria-label="Learn about our no child pays to play mission"
            >
              <FaHeart className="text-red-500 text-lg md:text-xl" aria-hidden="true" />
              NO CHILD PAYS TO PLAY
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="/join-team"
              className="bg-white text-black px-6 py-3 md:px-8 md:py-4 rounded-lg font-bold text-base md:text-lg hover:bg-gray-100 transition-all duration-300 shadow-lg flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-steel-blue"
              aria-label="Join Wings of Steel sled hockey team"
            >
              <FaUsers className="text-lg md:text-xl" aria-hidden="true" />
              JOIN THE TEAM
            </motion.a>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/donate"
                className="bg-yellow-400 text-black px-6 py-3 md:px-8 md:py-4 rounded-lg font-bold text-base md:text-lg hover:bg-yellow-300 transition-all duration-300 shadow-lg flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-600"
                aria-label="Donate to support Wings of Steel"
              >
                <FaHeart className="text-lg md:text-xl" aria-hidden="true" />
                DONATE NOW
              </Link>
            </motion.div>
          </div>

          {/* Donation Progress Bar */}
          <div className="max-w-2xl mx-auto mb-6 md:mb-8">
            <DonationProgressBar mode="compact" showDetails={true} />
          </div>
        </motion.div>
      </div>

      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        aria-hidden="true"
      >
        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white rounded-full mt-2 animate-bounce"></div>
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;