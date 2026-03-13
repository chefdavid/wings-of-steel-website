import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaClock, FaCalendarAlt, FaHockeyPuck, FaUsers, FaPhone, FaEnvelope } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { URLTeamProvider } from '../contexts/URLTeamContext';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

const SledHockeyNJ = () => {
  useEffect(() => {
    document.title = 'Sled Hockey in New Jersey | Wings of Steel Youth Sled Hockey';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        'Join Wings of Steel for sled hockey in New Jersey. Practices at Flyers Skate Zone in Voorhees, NJ every Thursday 6:10-7:10 PM. All equipment provided. No child pays to play.'
      );
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content =
        'Join Wings of Steel for sled hockey in New Jersey. Practices at Flyers Skate Zone in Voorhees, NJ every Thursday 6:10-7:10 PM. All equipment provided. No child pays to play.';
      document.head.appendChild(meta);
    }
  }, []);

  return (
    <URLTeamProvider>
      <div className="min-h-screen bg-dark-steel">
        <Navigation />

        <main className="pt-20">
          {/* Hero Section */}
          <section className="relative bg-gradient-to-br from-dark-steel to-steel-blue pt-16 pb-20">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-5xl md:text-6xl font-sport text-white mb-4">
                  Sled Hockey in New Jersey
                </h1>
                <p className="text-xl text-ice-blue max-w-3xl mx-auto mb-6">
                  Experience the thrill of sled hockey with the 2025 &amp; 2026 USA Champions.
                  All skill levels welcome — no experience needed.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to="/join-team"
                    className="bg-steel-blue text-white px-8 py-3 rounded-lg font-bold hover:bg-white hover:text-steel-blue transition-colors shadow-lg"
                  >
                    Join the Team
                  </Link>
                  <Link
                    to="/practice-schedule"
                    className="bg-white text-steel-blue border-2 border-white px-8 py-3 rounded-lg font-bold hover:bg-transparent hover:text-white transition-colors"
                  >
                    View Full Schedule
                  </Link>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Practice Location & Time */}
          <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center mb-12"
              >
                <h2 className="text-3xl md:text-4xl font-sport text-dark-steel mb-3">
                  Practice Location &amp; Time
                </h2>
                <div className="w-24 h-1 bg-steel-blue mx-auto"></div>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-8 mb-12">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  viewport={{ once: true }}
                  className="bg-gray-50 rounded-xl p-8 text-center border-2 border-gray-200 hover:border-steel-blue transition-colors"
                >
                  <FaMapMarkerAlt className="text-4xl text-steel-blue mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-dark-steel mb-2">Location</h3>
                  <p className="text-lg font-semibold text-gray-700">Flyers Skate Zone</p>
                  <p className="text-gray-600">601 Laurel Oak Rd</p>
                  <p className="text-gray-600">Voorhees, NJ 08043</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="bg-gray-50 rounded-xl p-8 text-center border-2 border-gray-200 hover:border-steel-blue transition-colors"
                >
                  <FaClock className="text-4xl text-steel-blue mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-dark-steel mb-2">Practice Time</h3>
                  <p className="text-lg font-semibold text-gray-700">Every Thursday</p>
                  <p className="text-gray-600">6:10 PM - 7:10 PM</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  viewport={{ once: true }}
                  className="bg-gray-50 rounded-xl p-8 text-center border-2 border-gray-200 hover:border-steel-blue transition-colors"
                >
                  <FaCalendarAlt className="text-4xl text-steel-blue mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-dark-steel mb-2">Season</h3>
                  <p className="text-lg font-semibold text-gray-700">Year-Round</p>
                  <p className="text-gray-600">New players welcome anytime</p>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Directions */}
          <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center mb-12"
              >
                <h2 className="text-3xl md:text-4xl font-sport text-dark-steel mb-3">
                  Getting to Flyers Skate Zone
                </h2>
                <div className="w-24 h-1 bg-steel-blue mx-auto mb-6"></div>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                  Flyers Skate Zone is conveniently located near the intersection of Route 73 and
                  Laurel Oak Road in Voorhees, NJ. The rink offers easy access from Philadelphia,
                  Cherry Hill, and throughout Camden County. Plenty of free parking is available on
                  site.
                </p>
              </motion.div>

              {/* Embedded Google Map */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="rounded-xl overflow-hidden shadow-lg"
              >
                <div className="relative w-full" style={{ paddingBottom: '45%' }}>
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3058.8!2d-74.9596!3d39.8437!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c6c8a5a7c9e8d1%3A0x1234567890abcdef!2sFlyers+Skate+Zone!5e0!3m2!1sen!2sus!4v1234567890"
                    width="100%"
                    height="100%"
                    style={{ border: 0, position: 'absolute', top: 0, left: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Flyers Skate Zone - Sled Hockey NJ Practice Location"
                  ></iframe>
                </div>
              </motion.div>
            </div>
          </section>

          {/* What to Expect */}
          <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center mb-12"
              >
                <h2 className="text-3xl md:text-4xl font-sport text-dark-steel mb-3">
                  What to Expect at Your First Practice
                </h2>
                <div className="w-24 h-1 bg-steel-blue mx-auto"></div>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-8">
                {[
                  {
                    icon: <FaClock className="text-3xl text-steel-blue" />,
                    title: 'Arrive 15 Minutes Early',
                    description:
                      'Show up 15 minutes before practice starts so our coaches can help you get fitted with equipment and introduce you to the team.',
                  },
                  {
                    icon: <FaHockeyPuck className="text-3xl text-steel-blue" />,
                    title: 'All Equipment Provided',
                    description:
                      'We supply everything you need — sleds, sticks, helmets, and protective gear. Just bring yourself and a positive attitude.',
                  },
                  {
                    icon: <FaUsers className="text-3xl text-steel-blue" />,
                    title: 'No Experience Needed',
                    description:
                      'Whether you have never been on the ice or you are a seasoned athlete, our coaches will work with you at your level.',
                  },
                  {
                    icon: <FaHockeyPuck className="text-3xl text-steel-blue" />,
                    title: 'Welcoming Atmosphere',
                    description:
                      'Our team is built on inclusivity and encouragement. Every player is valued, and families are part of the Wings of Steel community.',
                  },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex gap-6 bg-gray-50 rounded-xl p-6 border-2 border-gray-200 hover:border-steel-blue transition-colors"
                  >
                    <div className="flex-shrink-0 mt-1">{item.icon}</div>
                    <div>
                      <h3 className="text-xl font-bold text-dark-steel mb-2">{item.title}</h3>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                viewport={{ once: true }}
                className="text-center mt-10"
              >
                <Link
                  to="/sled-hockey-equipment-guide"
                  className="text-steel-blue font-bold hover:underline text-lg"
                >
                  Learn more about sled hockey equipment &rarr;
                </Link>
              </motion.div>
            </div>
          </section>

          {/* Why Choose Wings of Steel */}
          <section className="py-16 bg-gradient-to-br from-dark-steel to-steel-blue">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center mb-12"
              >
                <h2 className="text-3xl md:text-4xl font-sport text-white mb-3">
                  Why Choose Wings of Steel
                </h2>
                <div className="w-24 h-1 bg-ice-blue mx-auto"></div>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    title: '2025 & 2026 USA Champions',
                    description:
                      'Train with the best youth sled hockey program in the country. Our players compete at the highest level and bring home national championships.',
                  },
                  {
                    title: 'No Child Pays to Play',
                    description:
                      'Wings of Steel is committed to making sled hockey accessible to every child. Equipment, ice time, travel, and tournament fees are all covered.',
                  },
                  {
                    title: '501(c)(3) Nonprofit',
                    description:
                      'As a registered nonprofit organization, we rely on the generosity of donors and sponsors to keep our mission alive. Every contribution makes a difference.',
                  },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.15 }}
                    viewport={{ once: true }}
                    className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 text-center"
                  >
                    <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                    <p className="text-ice-blue">{item.description}</p>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                viewport={{ once: true }}
                className="text-center mt-10"
              >
                <Link
                  to="/donate"
                  className="inline-block bg-white text-steel-blue px-8 py-3 rounded-lg font-bold hover:bg-ice-blue transition-colors shadow-lg"
                >
                  Support Our Mission
                </Link>
              </motion.div>
            </div>
          </section>

          {/* About Wings of Steel */}
          <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="max-w-4xl mx-auto text-center"
              >
                <h2 className="text-3xl md:text-4xl font-sport text-dark-steel mb-3">
                  About Wings of Steel
                </h2>
                <div className="w-24 h-1 bg-steel-blue mx-auto mb-6"></div>
                <p className="text-lg text-gray-600 mb-6">
                  Wings of Steel is a championship youth sled hockey organization and 501(c)(3)
                  nonprofit dedicated to making the sport accessible to all children, regardless of
                  financial ability. Our motto is simple: <strong>no child pays to play</strong>. We
                  provide all equipment, ice time, coaching, and travel expenses so that every player
                  can focus on what matters — having fun and competing at the highest level.
                </p>
                <p className="text-lg text-gray-600 mb-8">
                  As the 2025 and 2026 USA Sled Hockey Champions, our program has a proven track
                  record of developing elite athletes while fostering an inclusive, supportive team
                  environment. Whether your child is new to hockey or looking to take their game to
                  the next level, Wings of Steel is the place to be.
                </p>
                <Link
                  to="/what-is-sled-hockey"
                  className="text-steel-blue font-bold hover:underline text-lg"
                >
                  Learn more about sled hockey &rarr;
                </Link>
              </motion.div>
            </div>
          </section>

          {/* Serving All of South Jersey */}
          <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center mb-12"
              >
                <h2 className="text-3xl md:text-4xl font-sport text-dark-steel mb-3">
                  Serving All of South Jersey
                </h2>
                <div className="w-24 h-1 bg-steel-blue mx-auto mb-6"></div>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                  Our Voorhees practice location is centrally located to serve families across South
                  Jersey. We welcome players from communities throughout the region, including:
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-12"
              >
                {[
                  'Cherry Hill',
                  'Haddonfield',
                  'Marlton',
                  'Mount Laurel',
                  'Moorestown',
                  'Collingswood',
                  'Camden',
                  'Voorhees',
                ].map((town, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg p-4 text-center border-2 border-gray-200 hover:border-steel-blue transition-colors"
                  >
                    <FaMapMarkerAlt className="text-steel-blue mx-auto mb-2" />
                    <p className="font-semibold text-dark-steel">{town}</p>
                  </div>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <p className="text-gray-600 mb-6">
                  Don't see your town? We welcome players from anywhere in New Jersey and the
                  surrounding area. Contact us to learn more about joining the team.
                </p>
              </motion.div>
            </div>
          </section>

          {/* Contact / CTA */}
          <section className="py-16 bg-gradient-to-r from-steel-blue to-dark-steel">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <h2 className="text-3xl md:text-4xl font-sport text-white mb-6">
                  Ready to Try Sled Hockey in New Jersey?
                </h2>
                <p className="text-xl text-ice-blue max-w-2xl mx-auto mb-8">
                  Join us at Flyers Skate Zone any Thursday at 6:10 PM. No registration required for
                  your first visit — just show up and we will take care of the rest.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
                  <Link
                    to="/join-team"
                    className="bg-white text-steel-blue px-8 py-3 rounded-lg font-bold hover:bg-ice-blue transition-colors shadow-lg"
                  >
                    Join the Team
                  </Link>
                  <Link
                    to="/donate"
                    className="bg-transparent text-white border-2 border-white px-8 py-3 rounded-lg font-bold hover:bg-white hover:text-steel-blue transition-colors"
                  >
                    Donate
                  </Link>
                </div>
                <div className="flex flex-col sm:flex-row gap-6 justify-center text-ice-blue">
                  <a
                    href="tel:+1234567890"
                    className="flex items-center justify-center gap-2 hover:text-white transition-colors"
                  >
                    <FaPhone />
                    <span>Contact Us</span>
                  </a>
                  <a
                    href="mailto:info@wingsofsteel.org"
                    className="flex items-center justify-center gap-2 hover:text-white transition-colors"
                  >
                    <FaEnvelope />
                    <span>info@wingsofsteel.org</span>
                  </a>
                </div>
              </motion.div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </URLTeamProvider>
  );
};

export default SledHockeyNJ;
