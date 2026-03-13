import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHeart, FaCheck, FaDollarSign, FaUsers, FaTrophy, FaHandHoldingHeart, FaChild, FaShieldAlt } from 'react-icons/fa';
import { URLTeamProvider } from '../contexts/URLTeamContext';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

const FreeYouthHockey = () => {
  useEffect(() => {
    document.title = 'Free Youth Hockey | Wings of Steel - No Child Pays to Play';
    const metaDescription = document.querySelector('meta[name="description"]');
    const content = 'Wings of Steel offers 100% free youth sled hockey in New Jersey. Equipment, ice time, coaching, and tournament travel provided at no cost. No child pays to play — join our championship team today.';
    if (metaDescription) {
      metaDescription.setAttribute('content', content);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = content;
      document.head.appendChild(meta);
    }
    return () => {
      document.title = 'Wings of Steel Youth Sled Hockey';
    };
  }, []);

  const costItems = [
    { label: 'Annual registration & league fees', cost: '$2,000 - $5,000+' },
    { label: 'Equipment (sticks, pads, skates)', cost: '$500 - $1,500' },
    { label: 'Ice time & facility rentals', cost: '$500 - $1,200' },
    { label: 'Travel & tournament fees', cost: '$500 - $2,000+' },
  ];

  const coveredItems = [
    { icon: FaShieldAlt, label: 'Adaptive sleds ($800 - $2,000 each)' },
    { icon: FaShieldAlt, label: 'Sticks, helmets, pads, and gloves' },
    { icon: FaShieldAlt, label: 'Full home and away jerseys' },
    { icon: FaShieldAlt, label: 'Ice time at Flyers Skate Zone' },
    { icon: FaShieldAlt, label: 'Travel to tournaments, including nationals' },
    { icon: FaShieldAlt, label: 'Professional coaching and player development' },
    { icon: FaShieldAlt, label: 'No fundraising requirements for families' },
  ];

  return (
    <URLTeamProvider>
      <div className="min-h-screen bg-dark-steel">
        <Navigation />

        <main className="pt-20">
          {/* Hero Section */}
          <section className="relative py-20 md:py-28 px-4 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-steel-blue/20 to-dark-steel" />
            <div className="relative max-w-5xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <FaHeart className="text-5xl text-red-400 mx-auto mb-6" />
                <h1 className="text-4xl md:text-6xl font-sport text-white mb-6 leading-tight">
                  FREE YOUTH HOCKEY — NO CHILD PAYS TO PLAY
                </h1>
                <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
                  Wings of Steel provides 100% free sled hockey for children of all abilities in New Jersey. Equipment, ice time, coaching, travel — everything is covered.
                </p>
              </motion.div>
            </div>
          </section>

          {/* The Cost Problem */}
          <section className="py-16 md:py-20 px-4">
            <div className="max-w-5xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center mb-12"
              >
                <FaDollarSign className="text-4xl text-yellow-400 mx-auto mb-4" />
                <h2 className="text-3xl md:text-4xl font-sport text-white mb-4">
                  THE COST CRISIS IN YOUTH SPORTS
                </h2>
                <p className="text-lg text-gray-300 max-w-3xl mx-auto">
                  Youth ice hockey is one of the most expensive sports in America. For families of children with disabilities, the financial barriers are even higher — adaptive equipment can cost two to three times more than standard gear.
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-6 mb-12">
                {costItems.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-red-900/20 border border-red-500/30 rounded-xl p-6 flex justify-between items-center"
                  >
                    <span className="text-gray-200">{item.label}</span>
                    <span className="text-red-400 font-bold text-lg whitespace-nowrap ml-4">{item.cost}</span>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="bg-gray-900/60 border border-steel-blue/30 rounded-2xl p-8 text-center"
              >
                <p className="text-2xl md:text-3xl font-sport text-white mb-4">
                  30%+ OF FAMILIES CAN'T AFFORD ORGANIZED SPORTS
                </p>
                <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                  Children with disabilities face even steeper barriers. Adaptive sleds alone cost $800 to $2,000, and most youth hockey programs don't offer adaptive options at any price. That means thousands of kids never get the chance to play.
                </p>
              </motion.div>
            </div>
          </section>

          {/* How Wings of Steel Removes Barriers */}
          <section className="py-16 md:py-20 px-4 bg-gradient-to-b from-dark-steel to-gray-900">
            <div className="max-w-5xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center mb-12"
              >
                <FaCheck className="text-4xl text-green-400 mx-auto mb-4" />
                <h2 className="text-3xl md:text-4xl font-sport text-white mb-4">
                  HOW WINGS OF STEEL REMOVES EVERY BARRIER
                </h2>
                <p className="text-lg text-gray-300 max-w-3xl mx-auto">
                  Our program is 100% free for every player. Families never pay a penny — not for equipment, not for ice time, not for travel, not for anything. Here's what we cover:
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-4 mb-12">
                {coveredItems.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.08 }}
                    className="bg-green-900/20 border border-green-500/30 rounded-xl p-5 flex items-center gap-4"
                  >
                    <FaCheck className="text-green-400 flex-shrink-0 text-xl" />
                    <span className="text-gray-200 text-lg">{item.label}</span>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="bg-gradient-to-r from-steel-blue to-blue-600 rounded-2xl p-8 text-center"
              >
                <h3 className="text-2xl md:text-3xl font-sport text-white mb-3">
                  ZERO COST. ZERO FUNDRAISING. ZERO BARRIERS.
                </h3>
                <p className="text-blue-100 text-lg max-w-2xl mx-auto">
                  We never ask families to sell raffle tickets, run bake sales, or cover hidden fees. When we say free, we mean it.
                </p>
              </motion.div>
            </div>
          </section>

          {/* How It Works / Donations */}
          <section className="py-16 md:py-20 px-4">
            <div className="max-w-5xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center mb-12"
              >
                <FaHandHoldingHeart className="text-4xl text-ice-blue mx-auto mb-4" />
                <h2 className="text-3xl md:text-4xl font-sport text-white mb-4">
                  HOW DONATIONS MAKE IT POSSIBLE
                </h2>
                <p className="text-lg text-gray-300 max-w-3xl mx-auto">
                  Wings of Steel is a registered 501(c)(3) nonprofit organization. Every dollar donated goes directly to putting kids on the ice.
                </p>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-8 mb-12">
                {[
                  {
                    icon: FaUsers,
                    title: 'Community Donations',
                    description: 'Individual donors and families in the community provide the backbone of our funding. Every contribution, large or small, makes a direct impact.',
                  },
                  {
                    icon: FaDollarSign,
                    title: 'Corporate Sponsors',
                    description: 'Local and national businesses partner with us to sponsor equipment, ice time, and tournament travel for our players.',
                  },
                  {
                    icon: FaHeart,
                    title: 'Fundraising Events',
                    description: 'From golf outings to community nights, our events bring people together while raising the funds that keep our program running.',
                  },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.15 }}
                    className="bg-gray-900 border border-steel-blue/30 rounded-2xl p-8 text-center"
                  >
                    <item.icon className="text-4xl text-steel-blue mx-auto mb-4" />
                    <h3 className="text-xl font-sport text-white mb-3">{item.title}</h3>
                    <p className="text-gray-400">{item.description}</p>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="bg-ice-blue/10 border border-ice-blue/30 rounded-2xl p-8 text-center"
              >
                <p className="text-xl text-white font-bold mb-2">100% of Donations Go to Players</p>
                <p className="text-gray-300">
                  Our all-volunteer coaching staff and board ensure that every dollar raised is spent on equipment, ice time, and opportunities for our athletes. All donations are tax-deductible.
                </p>
              </motion.div>
            </div>
          </section>

          {/* Impact / Champions */}
          <section className="py-16 md:py-20 px-4 bg-gradient-to-b from-dark-steel to-gray-900">
            <div className="max-w-5xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center mb-12"
              >
                <FaTrophy className="text-5xl text-yellow-400 mx-auto mb-4" />
                <h2 className="text-3xl md:text-4xl font-sport text-white mb-4">
                  FREE DOESN'T MEAN LESS COMPETITIVE
                </h2>
                <p className="text-lg text-gray-300 max-w-3xl mx-auto">
                  Wings of Steel proves that removing financial barriers doesn't lower the bar — it raises it. When every child has equal access, greatness follows.
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-8 text-center"
                >
                  <FaTrophy className="text-4xl text-yellow-400 mx-auto mb-3" />
                  <p className="text-3xl font-sport text-yellow-400 mb-2">2025 USA CHAMPIONS</p>
                  <p className="text-gray-300">National sled hockey champions, proving that talent has nothing to do with what families can afford.</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-8 text-center"
                >
                  <FaTrophy className="text-4xl text-yellow-400 mx-auto mb-3" />
                  <p className="text-3xl font-sport text-yellow-400 mb-2">2026 USA CHAMPIONS</p>
                  <p className="text-gray-300">Back-to-back national titles — built on inclusion, heart, and a community that believes every child deserves a chance.</p>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="grid md:grid-cols-3 gap-6 text-center"
              >
                {[
                  { stat: '$0', label: 'Cost to Families' },
                  { stat: '100%', label: 'Of Equipment Provided' },
                  { stat: '2x', label: 'National Champions' },
                ].map((item, index) => (
                  <div key={index} className="bg-gray-900 border border-steel-blue/30 rounded-xl p-6">
                    <p className="text-4xl font-sport text-steel-blue mb-2">{item.stat}</p>
                    <p className="text-gray-400 text-lg">{item.label}</p>
                  </div>
                ))}
              </motion.div>
            </div>
          </section>

          {/* CTA: Donate */}
          <section className="py-16 md:py-20 px-4">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-10 md:p-14 text-center"
              >
                <FaHeart className="text-5xl text-white mx-auto mb-6" />
                <h2 className="text-3xl md:text-4xl font-sport text-white mb-4">
                  HELP KEEP HOCKEY FREE
                </h2>
                <p className="text-red-100 text-lg max-w-2xl mx-auto mb-8">
                  Your tax-deductible donation ensures that no child is turned away because their family can't afford to play. Every dollar goes directly to our players.
                </p>
                <Link
                  to="/donate"
                  className="inline-block bg-white text-red-600 font-bold text-lg px-10 py-4 rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
                >
                  Donate Now
                </Link>
              </motion.div>
            </div>
          </section>

          {/* CTA: Join the Team */}
          <section className="py-16 md:py-20 px-4 bg-gradient-to-b from-dark-steel to-gray-900">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="bg-gradient-to-r from-steel-blue to-blue-700 rounded-2xl p-10 md:p-14 text-center"
              >
                <FaChild className="text-5xl text-white mx-auto mb-6" />
                <h2 className="text-3xl md:text-4xl font-sport text-white mb-4">
                  SIGN YOUR CHILD UP — IT'S FREE
                </h2>
                <p className="text-blue-100 text-lg max-w-2xl mx-auto mb-8">
                  No experience necessary. No fees, ever. Just show up and play. We provide everything your child needs to get on the ice and be part of our team.
                </p>
                <Link
                  to="/join-team"
                  className="inline-block bg-white text-steel-blue font-bold text-lg px-10 py-4 rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
                >
                  Join the Team
                </Link>
              </motion.div>
            </div>
          </section>

          {/* Related Pages / Internal Links */}
          <section className="py-16 md:py-20 px-4">
            <div className="max-w-5xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center mb-10"
              >
                <h2 className="text-3xl font-sport text-white mb-4">
                  LEARN MORE ABOUT SLED HOCKEY
                </h2>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    to: '/what-is-sled-hockey',
                    title: 'What Is Sled Hockey?',
                    description: 'Discover the fast-growing adaptive sport that gives athletes of all abilities a place on the ice.',
                  },
                  {
                    to: '/sled-hockey-equipment-guide',
                    title: 'Sled Hockey Equipment Guide',
                    description: 'Learn about the specialized sleds, sticks, and protective gear used in sled hockey.',
                  },
                  {
                    to: '/sled-hockey-nj',
                    title: 'Sled Hockey in New Jersey',
                    description: 'Find out how Wings of Steel is building the sled hockey community across New Jersey.',
                  },
                ].map((link, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <Link
                      to={link.to}
                      className="block bg-gray-900 border border-steel-blue/30 rounded-xl p-6 hover:border-steel-blue/60 transition-colors group"
                    >
                      <h3 className="text-lg font-sport text-steel-blue group-hover:text-ice-blue transition-colors mb-2">
                        {link.title}
                      </h3>
                      <p className="text-gray-400 text-sm">{link.description}</p>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </URLTeamProvider>
  );
};

export default FreeYouthHockey;
