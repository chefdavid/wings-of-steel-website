import { FaHockeyPuck, FaTrophy, FaHeart } from 'react-icons/fa';
import { useSiteSections } from '../hooks';
import { useTeam } from '../hooks/useTeam';
import TeamIndicator from './TeamIndicator';

const HeroLight = () => {
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
        className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-dark-steel"
        style={{
          backgroundImage: `url('/assets/hockey-sticks.webp')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="hero-content opacity-100">
          <TeamIndicator />
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-sport text-white tracking-wide mb-2">
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
          <div className="flex items-center justify-center gap-2 bg-yellow-400 text-black px-3 py-1.5 md:px-4 md:py-2 rounded-lg font-medium text-xs md:text-sm w-full max-w-xs md:w-72">
            <FaTrophy className="text-black flex-shrink-0 text-sm" />
            <span className="text-center">{heroData?.subtitle || '2023 National Champions'}</span>
          </div>
          <div className="flex items-center justify-center gap-2 bg-yellow-400 text-black px-3 py-1.5 md:px-4 md:py-2 rounded-lg font-medium text-xs md:text-sm w-full max-w-xs md:w-72">
            <FaTrophy className="text-black flex-shrink-0 text-sm" />
            <span className="text-center">2025 USA Sled Hockey Champions 1st Place</span>
          </div>
        </div>

        <p className="text-base md:text-lg text-gray-200 max-w-2xl mx-auto leading-relaxed mb-6 md:mb-8 px-2">
          {heroData?.description || teamConfig.description}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
          <a 
            href="#about" 
            className="inline-flex items-center justify-center gap-2 bg-yellow-400 text-black px-5 py-2.5 md:px-6 md:py-3 rounded-lg hover:bg-yellow-300 transition-all font-medium text-sm md:text-base shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 w-full sm:w-auto max-w-xs"
          >
            <FaHockeyPuck className="text-lg" />
            {heroData?.tagline || 'Learn About Our Mission'}
          </a>
          <a 
            href="#get-involved" 
            className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur text-white px-5 py-2.5 md:px-6 md:py-3 rounded-lg hover:bg-white/20 transition-all font-medium text-sm md:text-base border border-white/20 hover:border-white/30 w-full sm:w-auto max-w-xs"
          >
            <FaHeart className="text-lg" />
            Support Our Team
          </a>
        </div>

        <div className="mt-8 md:mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-yellow-400">100%</div>
            <div className="text-xs md:text-sm text-gray-300">Free to Play</div>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-yellow-400">50+</div>
            <div className="text-xs md:text-sm text-gray-300">Players & Families</div>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-yellow-400">2x</div>
            <div className="text-xs md:text-sm text-gray-300">National Champions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-yellow-400">∞</div>
            <div className="text-xs md:text-sm text-gray-300">Possibilities</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroLight;