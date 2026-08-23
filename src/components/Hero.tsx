import { motion } from 'framer-motion';
import { FaTrophy, FaUsers, FaHeart } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useSiteSections } from '../hooks';
import { useTeam } from '../hooks/useTeam';
import DonationProgressBar from './DonationProgressBar';
import { fadeUpLg, scaleIn, stagger, onMount } from '../lib/motion';

const Hero = () => {
  const { sections } = useSiteSections();
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
  // NOTE: this section deliberately renders immediately rather than gating on
  // `loading`. Every field below has a hardcoded fallback, so blocking the LCP
  // element on a Supabase round-trip bought a full-screen spinner and nothing
  // else. The hero background image is preloaded from index.html.

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden" aria-label="Hero section">
      {/* .hero-backdrop replaces the old `#home > div:first-child` selector in
          index.css, which broke if this element was ever reordered. */}
      <div className="hero-backdrop bg-dark-steel">
        <div
          className="hero-bg-image absolute inset-0 bg-contain md:bg-cover bg-top md:bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/images/hockey-sticks2.webp')`,
          }}
        />
        {/*
          Two-layer scrim. The vertical gradient keeps the nav and the scroll
          cue legible; the radial keeps the centre of the photo visible instead
          of flattening the whole image to grey.
        */}
        <div className="absolute inset-0 bg-gradient-to-b from-steel-950/80 via-steel-950/45 to-steel-950/85" />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(120% 80% at 50% 45%, rgba(19,28,37,0) 0%, rgba(19,28,37,0.35) 55%, rgba(19,28,37,0.8) 100%)',
          }}
        />
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
        <motion.div {...onMount} variants={stagger(0.09)} className="space-y-6 md:space-y-8">
          {/* An eyebrow says who this is faster than a spinning puck did. */}
          <motion.p
            variants={fadeUpLg}
            className="font-display tracking-[0.35em] text-[11px] md:text-xs uppercase text-accent"
          >
            Youth Sled Hockey · New Jersey
          </motion.p>

          <motion.div variants={fadeUpLg} className="mb-4 md:mb-6">
            {/* One h1 per page. The two visual lines are spans inside it. */}
            <h1 className="font-sport tracking-wide text-display-sm sm:text-display-md md:text-display-lg lg:text-display-xl">
              <span className="block text-white">
                {heroData?.heading1 || 'BREAKING BARRIERS &'}
              </span>
              <span className="block text-championship-gold">
                {heroData?.heading2 || 'BUILDING CHAMPIONS'}
              </span>
            </h1>
          </motion.div>

          <motion.p
            variants={fadeUpLg}
            className="text-base md:text-lg text-ice-200 max-w-2xl mx-auto leading-relaxed"
          >
            {heroData?.description || teamConfig.description}
          </motion.p>

          {/*
            Trophies were three solid yellow slabs competing with the headline
            for attention. As outlined cards they still read as a set, but the
            gold now points at the words rather than shouting over them.
          */}
          <motion.div
            variants={fadeUpLg}
            className="grid gap-2 md:gap-3 sm:grid-cols-3 max-w-4xl mx-auto"
          >
            <div className="flex items-center justify-center gap-2.5 rounded-card border border-championship-gold/40 bg-steel-950/45 backdrop-blur-sm px-3 py-3 md:px-4 md:py-4 text-xs md:text-sm min-h-[56px] md:min-h-[64px]">
              <FaTrophy className="text-championship-gold flex-shrink-0 text-sm md:text-base" aria-hidden="true" />
              <span className="text-center leading-snug text-white">{heroData?.award1 || heroData?.subtitle || '2023 National Champions'}</span>
            </div>
            <div className="flex items-center justify-center gap-2.5 rounded-card border border-championship-gold/40 bg-steel-950/45 backdrop-blur-sm px-3 py-3 md:px-4 md:py-4 text-xs md:text-sm min-h-[56px] md:min-h-[64px]">
              <FaTrophy className="text-championship-gold flex-shrink-0 text-sm md:text-base" aria-hidden="true" />
              <span className="text-center leading-snug text-white">{heroData?.award2 || heroData?.tagline || '2025 USA Sled Hockey Champions 1st Place'}</span>
            </div>
            <div className="flex items-center justify-center gap-2.5 rounded-card border border-championship-gold/40 bg-steel-950/45 backdrop-blur-sm px-3 py-3 md:px-4 md:py-4 text-xs md:text-sm min-h-[56px] md:min-h-[64px]">
              <FaTrophy className="text-championship-gold flex-shrink-0 text-sm md:text-base" aria-hidden="true" />
              <span className="text-center leading-snug text-white">{heroData?.award3 || '2026 New England Sled Hockey Tournament — 1st Place'}</span>
            </div>
          </motion.div>

          {/* Undefeated Season Callout */}
          <motion.div variants={scaleIn} className="max-w-2xl mx-auto">
            <div className="inline-flex items-center justify-center gap-3 rounded-pill bg-championship-gold px-6 py-2.5 md:px-8 md:py-3">
                <FaTrophy className="text-steel-900 text-base md:text-xl" aria-hidden="true" />
                <span className="text-sm md:text-lg font-sport text-steel-900 tracking-wider">
                  {/*
                    "Season — UNDEFEATED" was contradicted by the site's own
                    schedule: the 2025-26 record is 20-1, the loss coming in
                    round-robin play at Nationals on 2026-05-02. The REGULAR
                    season really was undefeated — 12-0 — so the claim is now
                    scoped to what the data supports.
                  */}
                  {heroData?.undefeated || '2025 / 2026 REGULAR SEASON — UNDEFEATED'}
                </span>
            </div>
          </motion.div>

          {/*
            One primary action, two secondary. Previously all three were solid
            fills — two of them the same yellow — so nothing was primary.
          */}
          <motion.div variants={fadeUpLg} className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/donate"
              className="inline-flex items-center justify-center gap-2 rounded-pill bg-championship-gold px-7 py-3.5 font-sport text-lg tracking-wider text-steel-900 shadow-glow-gold transition-transform duration-fast hover:scale-[1.03] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-steel-900 focus-visible:ring-championship-gold"
              aria-label="Donate to support Wings of Steel"
            >
              <FaHeart aria-hidden="true" />
              DONATE
            </Link>
            <Link
              to="/join-team"
              className="inline-flex items-center justify-center gap-2 rounded-pill border border-white/35 bg-white/5 px-7 py-3.5 font-sport text-lg tracking-wider text-white backdrop-blur-sm transition-colors duration-fast hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-steel-900 focus-visible:ring-white"
              aria-label="Join Wings of Steel sled hockey team"
            >
              <FaUsers aria-hidden="true" />
              JOIN THE TEAM
            </Link>
            <a
              href="#get-involved"
              className="inline-flex items-center justify-center gap-2 rounded-pill border border-white/35 bg-white/5 px-7 py-3.5 font-sport text-lg tracking-wider text-white backdrop-blur-sm transition-colors duration-fast hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-steel-900 focus-visible:ring-white"
              aria-label="Learn about our no child pays to play mission"
            >
              NO CHILD PAYS TO PLAY
            </a>
          </motion.div>

          <motion.div variants={fadeUpLg} className="max-w-xl mx-auto pt-2">
            <DonationProgressBar mode="compact" showDetails={true} />
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        aria-hidden="true"
      >
        <div className="w-6 h-10 border-2 border-white/60 rounded-pill flex justify-center">
          <div className="w-1 h-3 bg-white/80 rounded-pill mt-2 animate-bounce"></div>
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;