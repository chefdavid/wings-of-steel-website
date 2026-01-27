import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FaHockeyPuck, FaHome, FaCalendarAlt, FaTicketAlt } from 'react-icons/fa'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'

const NotFound = () => {
  return (
    <div className="fixed inset-0 z-[9999] bg-white overflow-y-auto">
      <div className="min-h-screen bg-gradient-to-b from-dark-steel via-[#1a2a3a] to-steel-gray flex flex-col">
        <Navigation />

        <div className="flex-1 flex items-center justify-center px-4 py-20">
          <div className="text-center max-w-2xl mx-auto">
            {/* Animated puck */}
            <motion.div
              initial={{ y: -80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 120, damping: 10 }}
              className="mb-6"
            >
              <FaHockeyPuck className="text-6xl md:text-7xl text-steel-blue mx-auto" />
            </motion.div>

            {/* 404 number */}
            <motion.h1
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
              className="text-[8rem] md:text-[12rem] font-sport leading-none text-transparent bg-clip-text bg-gradient-to-b from-ice-blue via-steel-blue to-dark-steel select-none"
            >
              404
            </motion.h1>

            {/* Headline */}
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-3xl md:text-5xl font-sport text-yellow-400 tracking-wider mb-4"
            >
              SHOT WIDE!
            </motion.h2>

            {/* Subtext */}
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.55 }}
              className="text-gray-400 text-lg md:text-xl mb-10 max-w-md mx-auto"
            >
              Looks like this page took a bad bounce. Let's get you back on the ice.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-8 py-3 bg-steel-blue hover:bg-steel-blue/80 text-white font-sport text-lg tracking-wider rounded-lg transition-colors"
              >
                <FaHome />
                Back to Home
              </Link>
              <Link
                to="/practice-schedule"
                className="inline-flex items-center gap-2 px-8 py-3 border-2 border-steel-blue text-steel-blue hover:bg-steel-blue hover:text-white font-sport text-lg tracking-wider rounded-lg transition-colors"
              >
                <FaCalendarAlt />
                View Schedule
              </Link>
              <Link
                to="/events"
                className="inline-flex items-center gap-2 px-8 py-3 border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-dark-steel font-sport text-lg tracking-wider rounded-lg transition-colors"
              >
                <FaTicketAlt />
                Events
              </Link>
            </motion.div>

            {/* Events callout */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-14"
            >
              <Link
                to="/events"
                className="group block max-w-md mx-auto rounded-xl border border-yellow-400/20 bg-yellow-400/5 backdrop-blur-sm px-6 py-5 hover:border-yellow-400/40 hover:bg-yellow-400/10 transition-all"
              >
                <p className="text-yellow-400 font-sport text-xl tracking-wider mb-1">
                  Don't Miss Our Upcoming Events
                </p>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Check out fundraisers, exhibition games, and more — all supporting our mission to keep sled hockey free for every child.
                </p>
                <span className="inline-flex items-center gap-1.5 text-steel-blue text-sm font-semibold mt-3 group-hover:gap-2.5 transition-all">
                  View Events
                  <FaTicketAlt className="text-xs" />
                </span>
              </Link>
            </motion.div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  )
}

export default NotFound
