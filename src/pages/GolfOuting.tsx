import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Calendar, MapPin, Clock, Users, Trophy, DollarSign, Gift } from 'lucide-react'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import GolfRegistrationForm from '../components/golf/GolfRegistrationForm'
import SponsorshipOptions from '../components/golf/SponsorshipOptions'
import ContestSection from '../components/golf/ContestSection'
import VenueSection from '../components/golf/VenueSection'

const GolfOuting = () => {
  const [spotsRemaining, setSpotsRemaining] = useState(32) // 32 teams max (128 golfers)
  const [videoError, setVideoError] = useState(false)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const eventDate = new Date('2026-05-18')

  // Debug video loading
  useEffect(() => {
    console.log('Video state:', { videoLoaded, videoError })
    console.log('Video file should be at: /videos/tee off.mp4')
    console.log('Actual video size: 3.5MB')
  }, [videoLoaded, videoError])

  return (
    <div className="fixed inset-0 z-[9999] bg-white overflow-y-auto overflow-x-hidden">
      <div className="min-h-screen bg-gradient-to-b from-dark-steel to-steel-gray">
        <Navigation />
        
        {/* Hero Section with Video Background */}
        <section className="relative min-h-[60vh] md:min-h-screen flex items-center justify-center overflow-hidden pt-16 md:pt-20">
        {/* TB Logo in Top Right */}
        <div className="absolute top-20 right-3 md:top-24 md:right-8 z-30 group">
          <div className="relative">
            <img
              src="/images/tb-logo.png"
              alt="Tom Brake Memorial"
              className="w-16 md:w-32 lg:w-40 h-auto opacity-90 group-hover:opacity-100 transition-opacity"
            />
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              <p className="text-white text-sm md:text-base font-semibold bg-black/50 backdrop-blur-sm px-3 py-1 rounded">
                In Memory of Tom Brake
              </p>
            </div>
          </div>
        </div>
        
        <div className="absolute inset-0">
          {/* Show static image if video hasn't loaded or has error */}
          {(!videoLoaded || videoError) && (
            <div 
              className="absolute inset-0 bg-cover bg-center" 
              style={{ backgroundImage: 'url(/images/golf-hero.jpg)' }}
            />
          )}
          
          {/* Video Background - Simplified */}
          <video
            ref={videoRef}
            autoPlay={true}
            loop={true}
            muted={true}
            playsInline={true}
            controls={false}
            poster="/images/golf-hero.jpg"
            className="absolute inset-0 w-full h-full object-cover object-center"
            onCanPlay={() => {
              console.log('Video can play')
              setVideoLoaded(true)
              if (videoRef.current) {
                videoRef.current.play().catch(err => {
                  console.warn('Autoplay blocked, showing play button:', err)
                })
              }
            }}
            onError={(e) => {
              console.error('Video error:', e)
              setVideoError(true)
            }}
          >
            <source src="/videos/tee off.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          
          {/* Manual play button if video doesn't autoplay */}
          {videoLoaded && !videoError && videoRef.current?.paused && (
            <button
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.play().catch(err => {
                    console.error('Manual play failed:', err)
                    setVideoError(true)
                  })
                }
              }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 bg-white/20 backdrop-blur-sm rounded-full p-6 hover:bg-white/30 transition-colors"
            >
              <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          )}
          
          {/* Overlay gradient for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70 z-10" />
          
          {/* Additional overlay for better contrast */}
          <div className="absolute inset-0 bg-dark-steel/20 z-10" />
        </div>
        
        <div className="relative z-20 container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="font-sport text-3xl md:text-8xl text-white mb-2 md:mb-4">
              WINGS OF STEEL ANNUAL
            </h1>
            <h2 className="font-sport text-2xl md:text-6xl text-ice-blue mb-3 md:mb-6">
              Tom Brake GOLF OUTING 2026
            </h2>
            <p className="text-sm md:text-2xl text-white/90 mb-4 md:mb-8 max-w-3xl mx-auto">
              <span className="font-bold">Golf with Purpose - Sponsor - Keep Kids on the Ice</span>
              <br className="hidden md:block" />
              <span className="hidden md:inline"> Your round of golf and your sponsorship make the difference—funding the equipment, ice time, and support that ensures no child is left on the sidelines.</span>
            </p>
            
            {/* Event Details Bar */}
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 md:p-6 max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-4 md:mb-8">
              <div className="flex items-center justify-center space-x-1 md:space-x-2">
                <Calendar className="text-ice-blue flex-shrink-0" size={16} />
                <span className="text-white font-semibold text-xs md:text-base">May 18, 2026</span>
              </div>
              <div className="flex items-center justify-center space-x-1 md:space-x-2">
                <MapPin className="text-ice-blue flex-shrink-0" size={16} />
                <a
                  href="https://ramblewoodcc.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white font-semibold hover:text-ice-blue transition-colors underline text-xs md:text-base"
                >
                  Ramblewood CC
                </a>
              </div>
              <div className="flex items-center justify-center space-x-1 md:space-x-2">
                <Clock className="text-ice-blue flex-shrink-0" size={16} />
                <span className="text-white font-semibold text-xs md:text-base">1:00 PM Tee-Off</span>
              </div>
              <div className="flex items-center justify-center space-x-1 md:space-x-2">
                <Users className="text-championship-gold flex-shrink-0" size={16} />
                <span className="text-championship-gold font-bold text-xs md:text-base">
                  {spotsRemaining} Teams Left!
                </span>
              </div>
            </div>
            
            {/* 3-Step Guide - Subtle */}
            <div className="max-w-3xl mx-auto mb-4 md:mb-6 text-center">
              <div className="flex flex-row justify-center items-center gap-3 md:gap-8 text-xs md:text-sm">
                <div className="flex items-center gap-1 md:gap-2">
                  <span className="bg-white/20 text-white w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center font-semibold text-[10px] md:text-xs">1</span>
                  <span className="text-white/90">Register</span>
                </div>
                <div className="text-white/40">•</div>
                <div className="flex items-center gap-1 md:gap-2">
                  <span className="bg-white/20 text-white w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center font-semibold text-[10px] md:text-xs">2</span>
                  <span className="text-white/90">Sponsor</span>
                </div>
                <div className="text-white/40">•</div>
                <div className="flex items-center gap-1 md:gap-2">
                  <span className="bg-white/20 text-white w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center font-semibold text-[10px] md:text-xs">3</span>
                  <span className="text-white/90">Share</span>
                </div>
              </div>
            </div>
            
            {/* CTA Buttons - Consistent Style */}
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
              <a
                href="#register"
                className="inline-block bg-steel-blue text-white border-2 border-ice-blue font-bold py-3 px-6 md:py-4 md:px-8 rounded-full text-base md:text-lg shadow-lg hover:bg-dark-steel hover:border-white transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                Register Team
              </a>
              <a
                href="#sponsor"
                className="inline-block bg-steel-blue text-white border-2 border-ice-blue font-bold py-3 px-6 md:py-4 md:px-8 rounded-full text-base md:text-lg shadow-lg hover:bg-dark-steel hover:border-white transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                Sponsorship Opportunities
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* What's Included Section */}
      <section className="py-8 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="font-sport text-3xl md:text-5xl text-center text-dark-steel mb-6 md:mb-12">
            WHAT'S INCLUDED
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 max-w-5xl mx-auto">
            <motion.div
              className="bg-gradient-to-br from-steel-blue to-dark-steel p-4 md:p-6 rounded-lg text-white"
              whileHover={{ scale: 1.05 }}
            >
              <Trophy className="mb-3 md:mb-4 text-championship-gold" size={32} />
              <h3 className="font-bold text-lg md:text-xl mb-2 md:mb-3">Tournament Play</h3>
              <ul className="space-y-1 md:space-y-2 text-sm md:text-base">
                <li>• Four-Person Scramble Format</li>
                <li>• Green Fees & Cart</li>
                <li>• Practice Range Access</li>
              </ul>
            </motion.div>

            <motion.div
              className="bg-gradient-to-br from-steel-blue to-dark-steel p-4 md:p-6 rounded-lg text-white"
              whileHover={{ scale: 1.05 }}
            >
              <Gift className="mb-3 md:mb-4 text-championship-gold" size={32} />
              <h3 className="font-bold text-lg md:text-xl mb-2 md:mb-3">Food & Beverages</h3>
              <ul className="space-y-1 md:space-y-2 text-sm md:text-base">
                <li>• Catered Lunch (11:15 AM)</li>
                <li>• Hot Dog & Beer on Course</li>
                <li>• Full Dinner Buffet</li>
                <li>• Beer at Dinner</li>
              </ul>
            </motion.div>

            <motion.div
              className="bg-gradient-to-br from-steel-blue to-dark-steel p-4 md:p-6 rounded-lg text-white"
              whileHover={{ scale: 1.05 }}
            >
              <DollarSign className="mb-3 md:mb-4 text-championship-gold" size={32} />
              <h3 className="font-bold text-lg md:text-xl mb-2 md:mb-3">Prizes & Contests</h3>
              <ul className="space-y-1 md:space-y-2 text-sm md:text-base">
                <li>• 1st, 2nd, 3rd Place Teams</li>
                <li>• Longest Drive Contest</li>
                <li>• Closest to Pin Contest</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission Impact Section */}
      <section className="py-12 md:py-0 md:min-h-screen flex items-center text-white relative overflow-hidden">
        {/* Hockey Goal Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url("/images/hockey-goal.jpg")',
          }}
        />

        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-dark-steel/50 via-dark-steel/60 to-dark-steel/50" />

        {/* Additional gradient for depth */}
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(10,25,41,0.3) 100%)'
        }} />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-sport text-3xl md:text-5xl mb-4 md:mb-8">What Your Support Makes Possible</h2>
            <p className="text-base md:text-xl mb-2">
              Your generosity turns into equipment, ice time, and opportunities to play.
            </p>
            <p className="text-sm md:text-lg mb-4 md:mb-6">
              The Annual Golf Outing is our largest fundraiser, raising <span className="text-championship-gold font-bold">75% of our annual budget</span>.
            </p>

            {/* Big Thank You */}
            <div className="my-6 md:my-12">
              <h3 className="font-sport text-2xl md:text-6xl text-championship-gold mb-2 md:mb-4">
                THANK YOU FOR SUPPORTING THE KIDS
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 md:p-6">
                <div className="text-3xl md:text-5xl font-sport text-championship-gold mb-2 md:mb-3">$1,870</div>
                <p className="text-sm md:text-base">Fully equips one athlete for the season — sled, sticks, pads, helmet, gloves & jerseys</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 md:p-6">
                <div className="text-3xl md:text-5xl font-sport text-championship-gold mb-2 md:mb-3">$10,000</div>
                <p className="text-sm md:text-base">Covers one full year of ice time for the entire team</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 md:p-6">
                <div className="text-3xl md:text-5xl font-sport text-championship-gold mb-2 md:mb-3">$2,500</div>
                <p className="text-sm md:text-base">Funds one player's tournament travel for the season</p>
              </div>
            </div>
            <p className="mt-4 md:mt-8 text-sm md:text-lg italic">
              As a 501(c)(3) nonprofit, your registration and donations are tax-deductible.
            </p>
          </div>
        </div>
      </section>

      {/* Venue Section */}
      <VenueSection />

      {/* Contest Section */}
      <ContestSection />

      {/* Registration Form */}
      <section id="register" className="py-8 md:py-16 relative">
        {/* Greens and Balls Background - No Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url("/images/greens-and-balls.jpg")',
          }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <h2 className="font-sport text-3xl md:text-5xl text-center text-white mb-6 md:mb-12">
            REGISTER YOUR TEAM
          </h2>
          <GolfRegistrationForm
            spotsRemaining={spotsRemaining}
            setSpotsRemaining={setSpotsRemaining}
          />
        </div>
      </section>

      {/* Sponsorship Options */}
      <section id="sponsor" className="py-8 md:py-16 bg-gradient-to-b from-steel-gray to-dark-steel">
        <div className="container mx-auto px-4">
          <h2 className="font-sport text-3xl md:text-5xl text-center text-white mb-6 md:mb-12">
            SPONSORSHIP OPPORTUNITIES
          </h2>
          <SponsorshipOptions />
        </div>
      </section>

      <Footer />
      </div>
    </div>
  )
}

export default GolfOuting