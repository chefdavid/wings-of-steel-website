import { motion } from 'framer-motion'
import { Calendar, MapPin, Clock, Heart, Gift, Users } from 'lucide-react'
import { FaHockeyPuck } from 'react-icons/fa'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import { useDonationModal } from '../contexts/DonationModalContext'

const HockeyForACause = () => {
  const { openModal } = useDonationModal()

  return (
    <div className="fixed inset-0 z-[9999] bg-white overflow-y-auto">
      <div className="min-h-screen bg-gradient-to-b from-dark-steel to-steel-gray">
        <Navigation />

        {/* Hero Section */}
        <section className="relative md:min-h-[90vh] flex flex-col md:flex-row md:items-center md:justify-center overflow-hidden pt-20">
          {/* Background image — hidden on mobile, shown on desktop as overlay */}
          <div className="hidden md:block absolute inset-0 bg-dark-steel">
            <img
              src="/images/hockey-for-a-cause-flyer.jpg"
              alt="Hockey for a Cause - Wings of Steel vs Gloucester Catholic"
              className="w-full h-full object-contain object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-dark-steel/30 via-dark-steel/20 to-dark-steel/70" />
          </div>

          {/* Mobile-only image — displayed at top */}
          <div className="md:hidden w-full">
            <img
              src="/images/hockey-for-a-cause-flyer.jpg"
              alt="Hockey for a Cause - Wings of Steel vs Gloucester Catholic"
              className="w-full h-auto"
            />
          </div>

          <div className="relative z-10 text-center px-4 max-w-4xl mx-auto py-10 md:py-0">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-yellow-400 font-sport text-lg md:text-xl tracking-widest mb-2 uppercase">
                March 22, 2026
              </p>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-sport text-white mb-4 tracking-wide leading-none">
                HOCKEY FOR A<br />
                <span className="text-yellow-400">CAUSE</span>
              </h1>
              <p className="text-xl md:text-2xl text-ice-blue font-display mb-2">
                Wings of Steel <span className="text-yellow-400 font-bold">VS</span> Gloucester Catholic
              </p>
              <p className="text-gray-300 text-lg mb-8">
                Entry by Donation &bull; Basket Auction On-Site
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => openModal(undefined, 'hockey-for-a-cause')}
                  className="px-8 py-4 bg-yellow-500 text-black rounded-full hover:bg-yellow-400 shadow-lg font-bold text-lg font-sport tracking-wider transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                >
                  <Heart size={20} />
                  Donate for Entry
                </button>
                <a
                  href="#details"
                  className="px-8 py-4 bg-white/10 text-white border-2 border-white/30 rounded-full hover:bg-white/20 font-sport tracking-wider transition-all duration-300 text-lg"
                >
                  Event Details
                </a>
              </div>
            </motion.div>
          </div>

          {/* Scroll indicator — desktop only */}
          <motion.div
            className="hidden md:block absolute bottom-8 left-1/2 -translate-x-1/2"
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <div className="w-6 h-10 rounded-full border-2 border-white/40 flex items-start justify-center p-2">
              <div className="w-1.5 h-3 bg-white/60 rounded-full" />
            </div>
          </motion.div>
        </section>

        {/* Event Details */}
        <section id="details" className="py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-sport text-white mb-4 tracking-wide">
                EVENT DETAILS
              </h2>
              <div className="w-24 h-1 bg-yellow-400 mx-auto" />
            </motion.div>

            {/* Info cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-16">
              {[
                {
                  icon: <Calendar size={28} />,
                  title: 'Date',
                  value: 'March 22, 2026',
                  sub: 'Sunday',
                },
                {
                  icon: <Clock size={28} />,
                  title: 'Puck Drop',
                  value: '1:20 PM',
                  sub: 'Doors open at 12:45 PM',
                },
                {
                  icon: <MapPin size={28} />,
                  title: 'Location',
                  value: 'Voorhees Flyers Skate Zone',
                  sub: '601 Laurel Oak Rd, Voorhees, NJ',
                },
              ].map((item, idx) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="bg-dark-steel/60 border border-steel-blue/20 rounded-xl p-6 text-center"
                >
                  <div className="text-steel-blue mb-3 flex justify-center">
                    {item.icon}
                  </div>
                  <p className="text-ice-blue text-sm uppercase tracking-wider font-sport mb-1">
                    {item.title}
                  </p>
                  <p className="text-white text-xl font-bold">{item.value}</p>
                  <p className="text-gray-400 text-sm mt-1">{item.sub}</p>
                </motion.div>
              ))}
            </div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-dark-steel/60 border border-steel-blue/20 rounded-2xl p-8 md:p-12 mb-16"
            >
              <div className="max-w-3xl mx-auto text-center">
                <FaHockeyPuck className="text-4xl text-yellow-400 mx-auto mb-6" />
                <h3 className="text-3xl font-sport text-white mb-6 tracking-wide">
                  WHAT IS THIS EVENT?
                </h3>
                <p className="text-gray-300 text-lg leading-relaxed mb-6">
                  Watch the Gloucester Catholic Rams kick off their skates and hop
                  into sleds as they face off against the Wings of Steel in a fun
                  sled hockey exhibition game! All proceeds benefit the Wings of
                  Steel Sled Hockey nonprofit organization and our mission that{' '}
                  <span className="text-yellow-400 font-semibold">
                    no child pays to play
                  </span>
                  .
                </p>
                <p className="text-gray-300 text-lg leading-relaxed">
                  This is a unique opportunity to see stand-up hockey players
                  experience sled hockey for the first time, cheer on both teams,
                  and support a great cause. Plus, don't miss the basket auction
                  on-site!
                </p>
              </div>
            </motion.div>

            {/* Highlights */}
            <div className="grid md:grid-cols-2 gap-6 mb-16">
              {[
                {
                  icon: <Heart size={24} />,
                  title: 'Entry by Donation',
                  description:
                    'There is no set ticket price — donate what you can! Every dollar goes directly to keeping sled hockey free for all kids.',
                },
                {
                  icon: <Gift size={24} />,
                  title: 'Basket Auction',
                  description:
                    'Bid on amazing baskets on-site! A fun way to win great prizes while supporting the team.',
                },
                {
                  icon: <Users size={24} />,
                  title: 'Fun for the Whole Family',
                  description:
                    'Bring the kids, bring your friends — enjoy a day of hockey, community, and giving back.',
                },
                {
                  icon: <FaHockeyPuck size={24} />,
                  title: 'Exhibition Game',
                  description:
                    'Watch GC Rams players try sled hockey for the first time in a friendly matchup against our Wings of Steel athletes.',
                },
              ].map((item, idx) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="bg-dark-steel/40 border border-steel-blue/15 rounded-xl p-6 flex gap-4"
                >
                  <div className="text-yellow-400 flex-shrink-0 mt-1">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-lg mb-1">
                      {item.title}
                    </h4>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Donate CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center bg-gradient-to-r from-yellow-500/10 via-yellow-400/20 to-yellow-500/10 border border-yellow-400/30 rounded-2xl p-10"
            >
              <h3 className="text-3xl md:text-4xl font-sport text-white mb-4 tracking-wide">
                SUPPORT THE CAUSE
              </h3>
              <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
                Can't make it in person? You can still support Wings of Steel by
                donating online. Every contribution helps keep sled hockey
                accessible for all children.
              </p>
              <button
                onClick={() => openModal(undefined, 'hockey-for-a-cause')}
                className="px-10 py-4 bg-yellow-500 text-black rounded-full hover:bg-yellow-400 shadow-lg font-bold text-xl font-sport tracking-wider transition-all duration-300 hover:scale-105 inline-flex items-center gap-3"
              >
                <Heart size={22} />
                Donate Now
              </button>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  )
}

export default HockeyForACause
