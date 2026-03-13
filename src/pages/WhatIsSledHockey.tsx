import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { URLTeamProvider } from '../contexts/URLTeamContext';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

const WhatIsSledHockey = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // SEO meta tags
  useEffect(() => {
    document.title = 'What Is Sled Hockey? Complete Guide to Adaptive Ice Hockey | Wings of Steel';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Learn what sled hockey is, how it works, and who plays. Comprehensive guide covering sled hockey rules, equipment, history, and the Paralympic connection. Also known as sledge hockey or adaptive ice hockey.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Learn what sled hockey is, how it works, and who plays. Comprehensive guide covering sled hockey rules, equipment, history, and the Paralympic connection. Also known as sledge hockey or adaptive ice hockey.';
      document.head.appendChild(meta);
    }
    return () => {
      document.title = 'Wings of Steel Youth Sled Hockey';
    };
  }, []);

  // FAQ schema
  const faqs = [
    {
      question: 'What is the difference between sled hockey and sledge hockey?',
      answer: 'Sled hockey and sledge hockey are the same sport. The term "sledge hockey" is used internationally and by the International Paralympic Committee (IPC), while "sled hockey" is the preferred term in North America and is used by USA Hockey. The sport, rules, and equipment are identical regardless of which name is used.',
    },
    {
      question: 'Can able-bodied people play sled hockey?',
      answer: 'Yes! Many sled hockey programs welcome able-bodied players alongside athletes with disabilities. Playing sled hockey is a great way for anyone to experience the sport, build empathy, and compete on a level playing field. Some recreational leagues and youth programs actively encourage mixed-ability participation.',
    },
    {
      question: 'How fast do sled hockey players go?',
      answer: 'Elite sled hockey players can reach speeds of 20 mph or more on the ice. Players propel themselves using the metal picks on the ends of their sticks, digging into the ice with powerful arm strokes. Top Paralympic athletes train extensively to build the upper body strength needed for explosive speed and quick directional changes.',
    },
    {
      question: 'Is sled hockey in the Paralympics?',
      answer: 'Yes, sled hockey (listed as "Para ice hockey" by the IPC) has been an official Paralympic Winter Games sport since the 1994 Lillehammer Games in Norway. It is one of the most popular and exciting events at the Winter Paralympics, with countries like the United States, Canada, and South Korea fielding highly competitive teams.',
    },
    {
      question: 'What age can kids start playing sled hockey?',
      answer: 'Children can start playing sled hockey as young as 4 or 5 years old. Many youth programs, including Wings of Steel, welcome young players and provide all necessary equipment at no cost. Starting early helps kids develop skating skills, coordination, and confidence on the ice in a supportive team environment.',
    },
    {
      question: 'How much does sled hockey equipment cost?',
      answer: 'A hockey sled typically costs between $800 and $2,000 depending on the model and customization needed. Additional equipment includes two short sticks ($50-$150 each), a helmet with cage, gloves, and protective padding. The total cost can be a barrier for many families, which is why teams like Wings of Steel provide all equipment completely free through their "No Child Pays to Play" program.',
    },
  ];

  // Inject FAQ JSON-LD schema
  useEffect(() => {
    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(faqSchema);
    script.id = 'faq-schema';
    document.head.appendChild(script);

    return () => {
      const existing = document.getElementById('faq-schema');
      if (existing) existing.remove();
    };
  }, []);

  return (
    <URLTeamProvider>
      <div className="min-h-screen bg-dark-steel">
        <Navigation />

        <main className="pt-20">
          {/* Hero Section */}
          <section className="relative py-16 md:py-24 px-4 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-steel-blue/20 via-dark-steel to-dark-steel"></div>
            <div className="relative z-10 max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-sport text-white mb-6">
                  What Is Sled Hockey?
                </h1>
                <p className="text-lg md:text-xl text-ice-blue max-w-3xl mx-auto">
                  A comprehensive guide to one of the fastest-growing adaptive sports in the world — also known as sledge hockey and adaptive ice hockey.
                </p>
              </motion.div>
            </div>
          </section>

          {/* Introduction */}
          <section className="py-12 md:py-16 px-4 bg-steel-gray">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl md:text-4xl font-sport text-white mb-6">
                  The Basics of Sled Hockey
                </h2>
                <div className="space-y-4 text-ice-blue text-lg leading-relaxed">
                  <p>
                    Sled hockey — also called <strong className="text-white">sledge hockey</strong> internationally — is a form of adaptive ice hockey designed for players who have physical disabilities that prevent them from playing stand-up hockey. Instead of skating on their feet, players sit in specially designed sleds that rest on top of two standard hockey skate blades. They propel themselves across the ice and handle the puck using two short sticks, each equipped with a metal pick on one end for pushing and a blade on the other end for shooting and passing.
                  </p>
                  <p>
                    The sport delivers the same intensity, speed, and physicality as traditional ice hockey. Games are played on a standard-size ice rink with regulation goals, and the objective is identical: put the puck in the net more times than the opposing team. Body checking is legal, penalties are enforced by the same rulebook principles, and the action is every bit as fast and hard-hitting as the stand-up version of the game.
                  </p>
                  <p>
                    For many athletes with disabilities, sled hockey provides something that few other sports can: a truly competitive, team-based athletic experience on the ice. Organizations like <Link to="/sled-hockey-nj" className="text-yellow-400 hover:text-yellow-300 underline">Wings of Steel in New Jersey</Link> are making the sport accessible to children and young adults at no cost, proving that physical limitations do not have to mean limited opportunities.
                  </p>
                </div>
              </motion.div>
            </div>
          </section>

          {/* History */}
          <section className="py-12 md:py-16 px-4 bg-dark-steel">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl md:text-4xl font-sport text-white mb-6">
                  History of Sled Hockey
                </h2>
                <div className="space-y-4 text-ice-blue text-lg leading-relaxed">
                  <p>
                    Sled hockey was invented in the early 1960s in Stockholm, Sweden, at a rehabilitation center where a group of athletes with physical disabilities wanted to continue playing hockey. They fashioned the first sleds from metal frames mounted on two regular ice hockey skate blades and used shortened sticks to move and shoot. The idea caught on quickly, and the sport spread across Scandinavia throughout the late 1960s and 1970s.
                  </p>
                  <p>
                    By the 1980s, sled hockey had crossed the Atlantic to Canada and the United States, where it gained a passionate following. The sport's biggest milestone came in <strong className="text-white">1994 at the Lillehammer Winter Paralympic Games</strong> in Norway, where sledge hockey was included as an official medal event for the first time. That moment put the sport on the world stage and ignited a wave of growth that continues today.
                  </p>
                  <p>
                    The United States has been one of the dominant forces in international sled hockey, winning multiple Paralympic gold medals. The success of Team USA has inspired thousands of players at the grassroots level to pick up sticks and get on the ice. Today, organized sled hockey programs exist in more than 30 countries, with competitive leagues at the youth, adult, and elite levels.
                  </p>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Rules */}
          <section className="py-12 md:py-16 px-4 bg-steel-gray">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl md:text-4xl font-sport text-white mb-6">
                  Sled Hockey Rules
                </h2>
                <div className="space-y-4 text-ice-blue text-lg leading-relaxed">
                  <p>
                    The rules of sled hockey closely mirror those of traditional ice hockey, which makes it easy for hockey fans to follow and enjoy. Games consist of <strong className="text-white">three periods of 15 minutes</strong> each. Teams play with five skaters and one goaltender on the ice at a time, just like in stand-up hockey. The game is played on a standard ice hockey rink with regulation-size goals.
                  </p>
                  <p>
                    Offsides, icing, and penalty rules all follow the same principles as the NHL and USA Hockey rulebooks. Body checking is permitted — and make no mistake, the hits in sled hockey are powerful. Players build tremendous upper body strength, and collisions between sleds can be just as jarring as any stand-up hockey check.
                  </p>
                  <p>
                    There are a few rules specific to sled hockey. Players may not use the picks on their sticks to impede an opponent, which is called "teeing." The sled itself is considered part of the player's body for the purpose of checking and contact rules. Goalkeepers play in specially modified sleds that are wider and sit lower to the ice, giving them better coverage of the net.
                  </p>
                  <p>
                    At the youth level, rules may be modified to emphasize development and safety. Many youth leagues, including those that <Link to="/join-team" className="text-yellow-400 hover:text-yellow-300 underline">Wings of Steel participates in</Link>, focus on skill building and sportsmanship alongside competition.
                  </p>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Equipment */}
          <section className="py-12 md:py-16 px-4 bg-dark-steel">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl md:text-4xl font-sport text-white mb-6">
                  Sled Hockey Equipment
                </h2>
                <div className="space-y-4 text-ice-blue text-lg leading-relaxed">
                  <p>
                    The most distinctive piece of sled hockey equipment is the <strong className="text-white">sled</strong> itself. A hockey sled is a molded plastic or fiberglass seat mounted on a metal frame that sits atop two standard ice hockey skate blades. The blades are spaced far enough apart to allow a puck to pass underneath. The seat is customized to each player's body, with straps and padding to secure the athlete firmly in place. High-end sleds feature adjustable frames, suspension systems, and lightweight materials for maximum speed and maneuverability.
                  </p>
                  <p>
                    Players use <strong className="text-white">two short sticks</strong>, each about one-third the length of a standard hockey stick. One end of each stick has a curved blade for shooting, passing, and puck handling — just like a regular hockey stick. The other end has a series of metal picks (similar to teeth) that the player digs into the ice to propel the sled forward, backward, and sideways. This dual-purpose design is what makes sled hockey possible: players use the same sticks to move and to play the puck.
                  </p>
                  <p>
                    Beyond the sled and sticks, players wear standard hockey protective gear: a helmet with a full cage or visor, shoulder pads, elbow pads, gloves, and shin guards. Some players also wear additional padding tailored to their specific disability or seating position. For a detailed breakdown of what you need to get started, check out our <Link to="/sled-hockey-equipment-guide" className="text-yellow-400 hover:text-yellow-300 underline">sled hockey equipment guide</Link>.
                  </p>
                  <p>
                    The cost of a sled alone ranges from $800 to $2,000, which can be a significant barrier for families. That is exactly why programs like Wings of Steel exist. Through our <Link to="/donate" className="text-yellow-400 hover:text-yellow-300 underline">"No Child Pays to Play" program</Link>, we provide all equipment, ice time, and coaching at no cost to families.
                  </p>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Who Plays */}
          <section className="py-12 md:py-16 px-4 bg-steel-gray">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl md:text-4xl font-sport text-white mb-6">
                  Who Plays Sled Hockey?
                </h2>
                <div className="space-y-4 text-ice-blue text-lg leading-relaxed">
                  <p>
                    Sled hockey is designed for athletes with physical disabilities that affect the lower body and prevent them from skating in the traditional standing position. The range of disabilities represented in the sport is broad and includes <strong className="text-white">spinal cord injuries, amputations (single or double leg), cerebral palsy, spina bifida, muscular dystrophy</strong>, and other conditions that limit lower-body mobility.
                  </p>
                  <p>
                    At the competitive level, players are classified to ensure fair competition. However, at the community and youth levels, sled hockey is remarkably inclusive. Many programs welcome able-bodied participants as well, creating a truly integrated athletic experience. When everyone is sitting in a sled, the playing field is genuinely level — what matters is your skill, determination, and teamwork, not whether you can walk or stand.
                  </p>
                  <p>
                    Sled hockey athletes range from children as young as four or five years old to adults competing in national and international tournaments. The sport has a well-established development pathway: young players can start in introductory programs, progress to competitive youth teams, and ultimately aspire to represent their country at the Paralympic Games. For families interested in getting started, <Link to="/join-team" className="text-yellow-400 hover:text-yellow-300 underline">joining a team like Wings of Steel</Link> is the best first step.
                  </p>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Paralympics & How It Differs */}
          <section className="py-12 md:py-16 px-4 bg-dark-steel">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl md:text-4xl font-sport text-white mb-6">
                  Sled Hockey and the Paralympics
                </h2>
                <div className="space-y-4 text-ice-blue text-lg leading-relaxed">
                  <p>
                    Since its Paralympic debut at the 1994 Lillehammer Games, Para ice hockey (as it is officially known by the International Paralympic Committee) has grown into one of the marquee events of the Winter Paralympics. The tournament features national teams from around the world competing for gold in a format similar to Olympic ice hockey.
                  </p>
                  <p>
                    Team USA has been a powerhouse in Paralympic sled hockey, capturing multiple gold medals and consistently ranking among the top teams in the world. Canada, South Korea, and several European nations also field elite teams. The intensity and skill level at the Paralympic Games is extraordinary — these athletes train year-round with the same dedication as any professional hockey player.
                  </p>
                  <p>
                    For young sled hockey players, the Paralympic pathway provides a powerful source of motivation. Knowing that the sport they are learning on a community rink could someday take them to the world stage adds a layer of purpose and aspiration to every practice. Many current and former Paralympians are active in grassroots sled hockey, mentoring the next generation and giving back to the programs that helped them develop.
                  </p>
                </div>
              </motion.div>
            </div>
          </section>

          {/* How It Differs from Ice Hockey */}
          <section className="py-12 md:py-16 px-4 bg-steel-gray">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl md:text-4xl font-sport text-white mb-6">
                  How Sled Hockey Differs from Ice Hockey
                </h2>
                <div className="space-y-4 text-ice-blue text-lg leading-relaxed">
                  <p>
                    While the fundamental objective is the same — score more goals than your opponent — the mechanics of sled hockey create a distinctly different athletic experience. The most obvious difference is positioning: players sit inches above the ice rather than standing, which changes sight lines, balance dynamics, and the physics of shooting and passing.
                  </p>
                  <p>
                    Propulsion is entirely upper-body driven. Instead of using legs to skate, players use their arms to dig metal picks into the ice, demanding exceptional upper-body strength and endurance. Shooting technique differs as well: with shorter sticks and a lower vantage point, players develop unique wrist shot and snap shot mechanics that generate impressive velocity from close to the ice surface.
                  </p>
                  <p>
                    The two-stick system is another key difference. In stand-up hockey, players use a single stick. In sled hockey, the two sticks allow for independent puck control and movement — a player can push with one stick while stickhandling with the other. This creates a distinctive style of play that rewards creativity and ambidexterity.
                  </p>
                  <p>
                    Despite these differences, the heart of the game remains the same. The teamwork, the strategy, the thrill of a breakaway, and the roar of the crowd after a goal — these elements are universal. Sled hockey is not a lesser version of ice hockey. It is a complete, exhilarating sport in its own right.
                  </p>
                </div>
              </motion.div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="py-16 px-4 bg-dark-steel">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-12"
              >
                <h2 className="text-3xl md:text-4xl font-sport text-white mb-4">
                  Frequently Asked Questions
                </h2>
              </motion.div>

              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-steel-gray rounded-lg border-2 border-steel-blue overflow-hidden"
                  >
                    <button
                      onClick={() => setOpenFaq(openFaq === index ? null : index)}
                      className="w-full flex items-center justify-between p-6 text-left hover:bg-steel-blue/10 transition-colors"
                    >
                      <h3 className="text-lg font-sport text-white pr-4">{faq.question}</h3>
                      {openFaq === index ? (
                        <FaChevronUp className="text-yellow-400 flex-shrink-0" />
                      ) : (
                        <FaChevronDown className="text-yellow-400 flex-shrink-0" />
                      )}
                    </button>
                    {openFaq === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        transition={{ duration: 0.2 }}
                        className="px-6 pb-6"
                      >
                        <p className="text-ice-blue">{faq.answer}</p>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-16 px-4 bg-gradient-to-b from-dark-steel to-steel-gray">
            <div className="max-w-3xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl md:text-4xl font-sport text-white mb-4">
                  Ready to Get on the Ice?
                </h2>
                <p className="text-ice-blue text-lg mb-8">
                  Wings of Steel provides all equipment and coaching at no cost. Whether your child has a physical disability or you simply want to learn more about sled hockey, we would love to hear from you.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    to="/join-team"
                    className="inline-flex items-center gap-2 bg-yellow-400 text-black px-8 py-4 rounded-lg font-sport text-xl hover:bg-yellow-300 transition-all shadow-lg transform hover:scale-105"
                  >
                    Join the Team
                  </Link>
                  <Link
                    to="/donate"
                    className="inline-flex items-center gap-2 bg-steel-blue text-white px-8 py-4 rounded-lg font-sport text-xl hover:bg-steel-blue/80 transition-all shadow-lg transform hover:scale-105"
                  >
                    Support Our Players
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

export default WhatIsSledHockey;
