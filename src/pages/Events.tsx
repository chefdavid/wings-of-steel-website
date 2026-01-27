import { motion } from 'framer-motion'
import { Calendar, MapPin, ArrowRight, Heart } from 'lucide-react'
import { FaGolfBall, FaHockeyPuck } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import { useEventVisibility } from '../hooks/useEventVisibility'

interface EventCard {
  key: string
  name: string
  tagline: string
  date: string
  location: string
  description: string
  href: string
  icon: React.ReactNode
  color: string
}

const allEvents: EventCard[] = [
  {
    key: 'hockey-for-a-cause',
    name: 'Hockey for a Cause',
    tagline: 'Wings of Steel vs Gloucester Catholic',
    date: 'March 22, 2026 — 1:20 PM',
    location: 'Voorhees Flyers Skate Zone',
    description:
      'Watch the GC Rams hop into sleds and face off against Wings of Steel in a fun exhibition game! Entry by donation, basket auction on-site. All proceeds keep sled hockey free for every child.',
    href: '/hockey-for-a-cause',
    icon: <FaHockeyPuck className="text-3xl" />,
    color: 'from-red-600 to-red-800',
  },
  {
    key: 'golf-outing',
    name: 'Tom Brake Memorial Golf Outing',
    tagline: 'Tee off for a great cause',
    date: 'April 2026',
    location: 'TBD',
    description:
      'Join us for a day on the green supporting Wings of Steel. Foursomes, sponsorships, contests, and dinner — all proceeds go directly to keeping sled hockey free for every child.',
    href: '/golf-outing',
    icon: <FaGolfBall className="text-3xl" />,
    color: 'from-green-600 to-green-800',
  },
]

const Events = () => {
  const { isEventVisible, loading } = useEventVisibility()

  const visibleEvents = loading
    ? allEvents
    : allEvents.filter((e) => isEventVisible(e.key))

  return (
    <div className="fixed inset-0 z-[9999] bg-white overflow-y-auto">
      <div className="min-h-screen bg-gradient-to-b from-dark-steel to-steel-gray">
        <Navigation />

        {/* Hero */}
        <section className="relative pt-32 pb-16 px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            <h1 className="text-5xl md:text-6xl font-sport text-white mb-4 tracking-wide">
              UPCOMING EVENTS
            </h1>
            <p className="text-lg text-ice-blue/80 max-w-2xl mx-auto">
              Every event supports our mission —{' '}
              <span className="text-yellow-400 font-semibold">
                no child pays to play
              </span>
              . Come have fun, meet the team, and help keep sled hockey free for
              all kids.
            </p>
          </motion.div>
        </section>

        {/* Events Grid */}
        <section className="pb-24 px-4">
          <div className="max-w-5xl mx-auto">
            {visibleEvents.length > 0 ? (
              <div className="grid gap-8 md:grid-cols-2">
                {visibleEvents.map((event, idx) => (
                  <motion.div
                    key={event.key}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: idx * 0.15 }}
                  >
                    <Link
                      to={event.href}
                      className="group block bg-dark-steel/60 border border-steel-blue/20 rounded-2xl overflow-hidden hover:border-steel-blue/50 transition-all duration-300 hover:shadow-xl hover:shadow-steel-blue/10"
                    >
                      {/* Color bar */}
                      <div
                        className={`h-2 bg-gradient-to-r ${event.color}`}
                      />

                      <div className="p-6">
                        {/* Icon + name */}
                        <div className="flex items-center gap-3 mb-3">
                          <div className="text-steel-blue">{event.icon}</div>
                          <h2 className="text-2xl font-sport text-white tracking-wide group-hover:text-ice-blue transition-colors">
                            {event.name}
                          </h2>
                        </div>

                        <p className="text-yellow-400 text-sm font-semibold uppercase tracking-wider mb-3">
                          {event.tagline}
                        </p>

                        {/* Meta */}
                        <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-4">
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {event.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin size={14} />
                            {event.location}
                          </span>
                        </div>

                        <p className="text-gray-300 text-sm leading-relaxed mb-4">
                          {event.description}
                        </p>

                        {/* CTA */}
                        <span className="inline-flex items-center gap-2 text-yellow-400 font-sport tracking-wider group-hover:gap-3 transition-all">
                          Learn More{' '}
                          <ArrowRight
                            size={18}
                            className="group-hover:translate-x-1 transition-transform"
                          />
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <Calendar
                  size={48}
                  className="mx-auto text-steel-blue/40 mb-4"
                />
                <p className="text-gray-400 text-lg">
                  More events coming soon!
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  Check back later or follow us on social media for updates.
                </p>
              </motion.div>
            )}

            {/* More events teaser (always shown if we have events) */}
            {visibleEvents.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-center mt-12"
              >
                <p className="text-gray-500 text-sm">
                  More events coming soon — stay tuned!
                </p>
              </motion.div>
            )}
          </div>
        </section>

        <Footer />
      </div>
    </div>
  )
}

export default Events
