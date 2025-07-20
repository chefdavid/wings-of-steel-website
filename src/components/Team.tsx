import { motion } from 'framer-motion';
import { useState } from 'react';

const Team = () => {
  const [flippedCards, setFlippedCards] = useState<{ [key: string]: boolean }>({});

  const players = [
    { number: 20, name: "Jack Ashby" },
    { number: 22, name: "Logan Ashby" },
    { number: 49, name: "Andrew Carmen" },
    { number: "TBD", name: "Lily Corrigan" },
    { number: 26, name: "Shawn Gardner" },
    { number: 8, name: "AJ Gonzales", role: "Assistant Captain" },
    { number: 21, name: "Trevor Gregoire" },
    { number: 19, name: "Lucas Harrop" },
    { number: 44, name: "Laurel Jastrzembski" },
    { number: 11, name: "Mikayla Johnson" },
    { number: 45, name: "Colton Naylor" },
    { number: 18, name: "Zach Oxenham" },
    { number: 2, name: "Shane Phillips" },
    { number: 7, name: "Colin Wiederholt", role: "Team Captain" },
  ];

  const coaches = [
    { name: "Tom Brake", role: "Head Coach", description: "Founder and visionary leader" },
    { name: "Assistant Coach", role: "Defense Coach", description: "Specializes in defensive strategies" },
    { name: "Assistant Coach", role: "Offense Coach", description: "Develops scoring opportunities" },
    { name: "Assistant Coach", role: "Goalie Coach", description: "Works with goaltenders" },
  ];


  return (
    <section id="team" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">
            The Best Players on the ICE
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            These young players, each with their own unique challenges and abilities, exemplify the
            spirit of sled hockey. Their prowess on the ice is measured by their ability to inspire,
            lead, and uplift their teammates.
          </p>
        </motion.div>

        <div className="mb-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 max-w-6xl mx-auto">
          {players.map((player, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              viewport={{ once: true }}
              className="relative h-72 w-full preserve-3d cursor-pointer group"
              style={{
                transformStyle: 'preserve-3d',
                transition: 'transform 0.6s',
              }}
              onMouseEnter={() => setFlippedCards(prev => ({ ...prev, [`player-${index}`]: true }))}
              onMouseLeave={() => setFlippedCards(prev => ({ ...prev, [`player-${index}`]: false }))}
            >
              {/* Captain Tag */}
              {player.role && (
                <div className="absolute -top-3 -right-3 bg-red-600 text-white text-sm px-3 py-1 rounded-full font-bold z-10 shadow-lg">
                  {player.role === "Team Captain" ? "CAPTAIN" : "ASST. CAPT"}
                </div>
              )}
              
              {/* Front of card */}
              <div 
                className="absolute inset-0 w-full h-full backface-hidden bg-white rounded-xl shadow-xl p-6 flex flex-col items-center justify-center border border-gray-100"
                style={{
                  transform: flippedCards[`player-${index}`] ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  backfaceVisibility: 'hidden',
                }}
              >
                <div className="w-24 h-24 bg-steel-blue rounded-full flex items-center justify-center text-white text-3xl font-bold mb-6 shadow-lg">
                  {player.number}
                </div>
                <h3 className="text-xl font-bold text-center text-gray-800 leading-tight">{player.name}</h3>
                {player.role && (
                  <p className="text-sm text-red-600 font-semibold mt-2">{player.role}</p>
                )}
              </div>
              
              {/* Back of card */}
              <div 
                className="absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-steel-blue to-dark-steel rounded-xl shadow-xl p-6 flex items-center justify-center"
                style={{
                  transform: flippedCards[`player-${index}`] ? 'rotateY(0deg)' : 'rotateY(-180deg)',
                  backfaceVisibility: 'hidden',
                }}
              >
                <div className="text-center text-white">
                  <img 
                    src={`https://ui-avatars.com/api/?name=${player.name}&background=4682B4&color=fff&size=128&bold=true`}
                    alt={player.name}
                    className="w-28 h-28 rounded-full mx-auto mb-4 border-4 border-white shadow-lg"
                  />
                  <p className="font-bold text-xl mb-2">{player.name}</p>
                  <p className="text-lg font-semibold">#{player.number}</p>
                  {player.role && (
                    <p className="text-sm text-yellow-400 font-bold mt-2 bg-yellow-400/20 px-2 py-1 rounded-full">
                      {player.role}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          </div>
        </div>

        {/* Join the Team Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.a
            whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}
            whileTap={{ scale: 0.95 }}
            href="#get-involved"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-12 py-6 rounded-full font-bold text-xl shadow-2xl hover:from-yellow-300 hover:to-yellow-400 transition-all duration-300 transform"
          >
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
            </svg>
            JOIN THE WINGS OF STEEL TEAM!
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          </motion.a>
          <p className="text-gray-600 mt-4 text-lg">
            Ready to be part of something amazing? Come try sled hockey with us!
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h3 className="text-3xl font-bold text-center text-black mb-8">
            Our Coaching Staff
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {coaches.map((coach, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative h-80 w-full preserve-3d cursor-pointer"
                onMouseEnter={() => setFlippedCards(prev => ({ ...prev, [`coach-${index}`]: true }))}
                onMouseLeave={() => setFlippedCards(prev => ({ ...prev, [`coach-${index}`]: false }))}
                style={{
                  transformStyle: 'preserve-3d',
                  transition: 'transform 0.6s',
                }}
              >
                {/* Front of card */}
                <div 
                  className="absolute inset-0 w-full h-full backface-hidden bg-white rounded-lg shadow-lg p-6 flex flex-col items-center justify-center"
                  style={{
                    transform: flippedCards[`coach-${index}`] ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    backfaceVisibility: 'hidden',
                  }}
                >
                  <div className="w-24 h-24 bg-steel-blue rounded-full flex items-center justify-center mb-4">
                    <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-center mb-2">{coach.name}</h3>
                  <p className="text-steel-blue font-medium">{coach.role}</p>
                </div>
                
                {/* Back of card */}
                <div 
                  className="absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-dark-steel to-steel-gray rounded-lg shadow-lg p-6 flex items-center justify-center"
                  style={{
                    transform: flippedCards[`coach-${index}`] ? 'rotateY(0deg)' : 'rotateY(-180deg)',
                    backfaceVisibility: 'hidden',
                  }}
                >
                  <div className="text-center text-white">
                    <img 
                      src={`https://ui-avatars.com/api/?name=${coach.name}&background=2C3E50&color=fff&size=128`}
                      alt={coach.name}
                      className="w-24 h-24 rounded-full mx-auto mb-4"
                    />
                    <p className="font-bold text-lg mb-2">{coach.name}</p>
                    <p className="text-ice-blue mb-2">{coach.role}</p>
                    <p className="text-sm">{coach.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-lg text-gray-600 mb-8">
            Team work makes the dream work! Make your dream come true today!
          </p>
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href="#get-involved"
            className="inline-block bg-dark-steel text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-steel-gray transition-colors duration-300"
          >
            JOIN NOW
          </motion.a>
        </motion.div>
      </div>

      <style jsx>{`
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
      `}</style>
    </section>
  );
};

export default Team;