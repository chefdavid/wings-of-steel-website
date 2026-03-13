import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { URLTeamProvider } from '../contexts/URLTeamContext';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

const equipmentSections = [
  {
    title: 'The Sled (Sledge)',
    icon: '🛷',
    cost: '$800–$2,000',
    details: [
      'The sled frame sits on two standard hockey skate blades, allowing it to glide across the ice just like a pair of skates.',
      'The seat height is designed so the puck can pass freely underneath — this is a key rule in sled hockey.',
      'A molded bucket seat with adjustable straps secures the player safely in place during fast-paced gameplay.',
      'Frames are built from aluminum (lighter, ideal for younger or smaller players) or steel (more durable for heavier use).',
      'Popular sled brands include Razor, CLICK, and Wicked Smart — each offering different sizing and customization options.',
    ],
  },
  {
    title: 'Sticks (Two Required)',
    icon: '🏒',
    cost: '$50–$130 per pair',
    details: [
      'Unlike stand-up hockey, sled hockey players use TWO short sticks — one in each hand.',
      'One end of each stick has a curved blade for shooting, passing, and stickhandling the puck.',
      'The other end has metal picks (teeth) that players dig into the ice to propel themselves forward, backward, and side to side.',
      'Stick length is typically 24–30 inches, much shorter than a standard hockey stick.',
      'Learning to coordinate both sticks — pushing with picks while handling the puck — is one of the unique skills of sled hockey.',
    ],
  },
  {
    title: 'Helmet & Cage',
    icon: '⛑️',
    cost: '$60–$120',
    details: [
      'A standard hockey helmet with a full face cage is required for all sled hockey players.',
      'These are the same helmets used in able-bodied hockey — no special modifications needed.',
      'Proper fitting is essential: the helmet should sit snug on the head with no more than one finger width above the eyebrow.',
      'The full cage protects against sticks, pucks, and collisions at ice level.',
    ],
  },
  {
    title: 'Gloves',
    icon: '🧤',
    cost: '$40–$80',
    details: [
      'Standard hockey gloves are used by most sled hockey players.',
      'Some players prefer modified gloves with enhanced grip to better control their two sticks.',
      'Gloves must allow full range of motion for stick handling and pushing.',
    ],
  },
  {
    title: 'Protective Gear',
    icon: '🛡️',
    cost: '$80–$200 total',
    details: [
      'Shoulder pads — either standard or modified to fit comfortably while seated in the sled.',
      'Shin pads — worn on the legs while strapped into the sled for protection from sticks and pucks.',
      'Elbow pads — protect arms during body contact and falls.',
      'Athletic cup — required for all players.',
      'The combination of pads keeps players safe while allowing full mobility in the sled.',
    ],
  },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

const SledHockeyEquipment = () => {
  useEffect(() => {
    document.title = 'Sled Hockey Equipment Guide | Sleds, Sticks & Gear';
    const metaDescription = document.querySelector('meta[name="description"]');
    const content =
      'Complete guide to sled hockey equipment — sleds, sticks, helmets, gloves, and protective gear. Learn what gear you need, what it costs, and how Wings of Steel provides everything free for youth players.';
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

  return (
    <URLTeamProvider>
      <div className="min-h-screen bg-dark-steel">
        <Navigation />

        <main className="pt-20">
          {/* Hero Section */}
          <section className="relative py-16 md:py-24 bg-gradient-to-b from-steel-blue/20 to-dark-steel">
            <div className="max-w-4xl mx-auto px-4 text-center">
              <motion.h1
                className="font-sport text-4xl md:text-6xl text-white mb-6"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                Sled Hockey Equipment Guide
              </motion.h1>
              <motion.p
                className="text-xl md:text-2xl text-ice-blue/80 max-w-3xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                Everything you need to know about sled hockey gear — from the sled itself to sticks, helmets, and protective equipment.
              </motion.p>
            </div>
          </section>

          {/* Quick Overview */}
          <section className="py-12 bg-steel-gray/10">
            <div className="max-w-5xl mx-auto px-4">
              <motion.div
                className="bg-steel-gray/20 border border-steel-blue/30 rounded-xl p-6 md:p-8"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="font-sport text-2xl md:text-3xl text-white mb-4">
                  What Makes Sled Hockey Equipment Unique?
                </h2>
                <p className="text-ice-blue/70 text-lg leading-relaxed">
                  Sled hockey (also called sledge hockey) uses specialized equipment that allows players to sit on a sled and glide across the ice. The biggest differences from stand-up hockey are the <strong className="text-white">sled itself</strong> and the use of <strong className="text-white">two short sticks</strong> instead of one — each with a blade on one end and metal picks on the other for pushing across the ice. Helmets, gloves, and pads are similar to standard hockey gear.
                </p>
              </motion.div>
            </div>
          </section>

          {/* Equipment Sections */}
          <section className="py-16">
            <div className="max-w-5xl mx-auto px-4 space-y-8">
              {equipmentSections.map((section, index) => (
                <motion.div
                  key={section.title}
                  className="bg-steel-gray/20 border border-steel-blue/20 rounded-xl overflow-hidden"
                  custom={index}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeInUp}
                >
                  <div className="bg-steel-blue/10 border-b border-steel-blue/20 px-6 py-4 flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{section.icon}</span>
                      <h2 className="font-sport text-2xl md:text-3xl text-white">
                        {section.title}
                      </h2>
                    </div>
                    <span className="bg-steel-blue/20 text-ice-blue px-4 py-1 rounded-full text-sm font-semibold">
                      {section.cost}
                    </span>
                  </div>
                  <div className="p-6">
                    <ul className="space-y-3">
                      {section.details.map((detail, i) => (
                        <li key={i} className="flex items-start gap-3 text-ice-blue/70">
                          <span className="text-steel-blue mt-1 shrink-0">●</span>
                          <span className="leading-relaxed">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* What Wings of Steel Provides */}
          <section className="py-16 bg-gradient-to-b from-steel-blue/10 to-dark-steel">
            <div className="max-w-5xl mx-auto px-4">
              <motion.div
                className="bg-steel-gray/20 border-2 border-steel-blue/40 rounded-xl overflow-hidden"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="bg-steel-blue/20 border-b border-steel-blue/30 px-6 py-5 text-center">
                  <h2 className="font-sport text-3xl md:text-4xl text-white">
                    What Wings of Steel Provides — Free
                  </h2>
                  <p className="text-ice-blue/70 mt-2 text-lg">
                    No child pays to play. Every piece of equipment is provided at no cost to families.
                  </p>
                </div>
                <div className="p-6 md:p-8">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-sport text-xl text-white mb-4">We Provide:</h3>
                      <ul className="space-y-3">
                        {[
                          'Sled — custom-fitted to each player',
                          'Two sticks per player',
                          'Helmet with full cage',
                          'Hockey gloves',
                          'Shoulder pads, shin pads, elbow pads',
                          'Home and away jerseys',
                        ].map((item, i) => (
                          <li key={i} className="flex items-center gap-3 text-ice-blue/80">
                            <span className="text-green-400 text-lg">✓</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-sport text-xl text-white mb-4">Families Just Bring:</h3>
                      <ul className="space-y-3">
                        {[
                          'Warm base layers (long sleeves, pants)',
                          'Warm socks',
                          'A positive attitude!',
                        ].map((item, i) => (
                          <li key={i} className="flex items-center gap-3 text-ice-blue/80">
                            <span className="text-steel-blue text-lg">→</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-8">
                        <Link
                          to="/join-team"
                          className="inline-block bg-steel-blue hover:bg-steel-blue/80 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-200"
                        >
                          Join the Team — It's Free
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Where to Buy */}
          <section className="py-16">
            <div className="max-w-5xl mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="font-sport text-3xl md:text-4xl text-white mb-8 text-center">
                  Where to Buy Sled Hockey Equipment
                </h2>
                <div className="bg-steel-gray/20 border border-steel-blue/20 rounded-xl p-6 md:p-8">
                  <p className="text-ice-blue/70 text-lg leading-relaxed mb-6">
                    If you're shopping for sled hockey equipment for another team or individual use, here are some places to look:
                  </p>
                  <ul className="space-y-4 text-ice-blue/80">
                    <li className="flex items-start gap-3">
                      <span className="text-steel-blue mt-1 shrink-0">●</span>
                      <span>
                        <strong className="text-white">HockeyMonkey</strong> — carries standard hockey helmets, gloves, and protective gear suitable for sled hockey.
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-steel-blue mt-1 shrink-0">●</span>
                      <span>
                        <strong className="text-white">Pure Hockey</strong> — another major hockey retailer with a wide selection of helmets, pads, and gloves.
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-steel-blue mt-1 shrink-0">●</span>
                      <span>
                        <strong className="text-white">Specialty Adaptive Sports Retailers</strong> — for sleds and sled-specific sticks, look for retailers that specialize in adaptive sports equipment (brands like Razor, CLICK, and Wicked Smart sell directly or through distributors).
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-steel-blue mt-1 shrink-0">●</span>
                      <span>
                        <strong className="text-white">USA Hockey</strong> — can connect families and organizations with equipment lending programs and grants to help offset the cost of getting started.
                      </span>
                    </li>
                  </ul>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Total Cost Summary */}
          <section className="py-16 bg-steel-gray/10">
            <div className="max-w-5xl mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="font-sport text-3xl md:text-4xl text-white mb-8 text-center">
                  Total Equipment Cost Breakdown
                </h2>
                <div className="bg-steel-gray/20 border border-steel-blue/20 rounded-xl overflow-hidden">
                  <div className="divide-y divide-steel-blue/10">
                    {[
                      { item: 'Sled (Sledge)', cost: '$800–$2,000' },
                      { item: 'Sticks (pair)', cost: '$50–$130' },
                      { item: 'Helmet & Cage', cost: '$60–$120' },
                      { item: 'Gloves', cost: '$40–$80' },
                      { item: 'Protective Gear', cost: '$80–$200' },
                    ].map((row, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center px-6 py-4"
                      >
                        <span className="text-ice-blue/80">{row.item}</span>
                        <span className="text-white font-semibold">{row.cost}</span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center px-6 py-4 bg-steel-blue/10">
                      <span className="text-white font-bold text-lg">Total</span>
                      <span className="text-white font-bold text-lg">$1,030–$2,530</span>
                    </div>
                  </div>
                  <div className="px-6 py-4 bg-steel-blue/5 border-t border-steel-blue/20">
                    <p className="text-ice-blue/60 text-sm text-center">
                      Wings of Steel covers this entire cost for every player.{' '}
                      <Link to="/donate" className="text-steel-blue hover:underline">
                        Your donation makes it possible.
                      </Link>
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Internal Links / CTA */}
          <section className="py-16">
            <div className="max-w-4xl mx-auto px-4 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="font-sport text-3xl md:text-4xl text-white mb-4">
                  Ready to Hit the Ice?
                </h2>
                <p className="text-ice-blue/70 text-lg mb-8 max-w-2xl mx-auto">
                  Wings of Steel provides all equipment free of charge. No family ever pays for their child to play sled hockey with us.
                </p>
                <div className="flex flex-wrap justify-center gap-4 mb-12">
                  <Link
                    to="/join-team"
                    className="bg-steel-blue hover:bg-steel-blue/80 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-200"
                  >
                    Join the Team
                  </Link>
                  <Link
                    to="/donate"
                    className="bg-transparent border-2 border-steel-blue text-steel-blue hover:bg-steel-blue/10 font-bold py-3 px-8 rounded-lg transition-colors duration-200"
                  >
                    Donate Equipment Funds
                  </Link>
                </div>
                <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
                  <Link to="/what-is-sled-hockey" className="text-steel-blue hover:underline">
                    What Is Sled Hockey?
                  </Link>
                  <Link to="/free-youth-hockey" className="text-steel-blue hover:underline">
                    Free Youth Hockey
                  </Link>
                  <Link to="/sled-hockey-nj" className="text-steel-blue hover:underline">
                    Sled Hockey in New Jersey
                  </Link>
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

export default SledHockeyEquipment;
