import { motion } from 'framer-motion';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaTrophy, FaBan, FaHockeyPuck, FaTicketAlt, FaHome } from 'react-icons/fa';
import { useGameSchedule } from '../hooks';

const Schedule = () => {
  const { upcomingGames, pastGames, loading, error } = useGameSchedule();

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="animate-pulse text-steel-blue">Loading schedule...</div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-red-600">Error loading schedule</p>
        </div>
      </section>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
      day: date.getDate(),
      weekday: date.toLocaleDateString('en-US', { weekday: 'long' }),
      year: date.getFullYear()
    };
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <section id="schedule" className="py-20 bg-gradient-to-br from-gray-50 via-white to-ice-blue/10 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 text-[200px] text-steel-blue transform rotate-12">
          <FaHockeyPuck />
        </div>
        <div className="absolute bottom-20 right-10 text-[200px] text-steel-blue transform -rotate-12">
          <FaTrophy />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-block mb-4"
          >
            <div className="bg-yellow-400 text-black px-6 py-2 rounded-full font-bold text-sm uppercase tracking-wider">
              2025-2026 Season
            </div>
          </motion.div>
          <h2 className="text-5xl md:text-6xl font-sport text-dark-steel mb-4">
            GAME SCHEDULE
          </h2>
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-1 w-32 bg-gradient-to-r from-transparent to-steel-blue"></div>
            <FaHockeyPuck className="text-2xl text-steel-blue animate-pulse" />
            <div className="h-1 w-32 bg-gradient-to-l from-transparent to-steel-blue"></div>
          </div>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Join us at the rink and witness the incredible spirit, determination, and skill of our Wings of Steel warriors!
          </p>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 max-w-4xl mx-auto"
        >
          <div className="bg-white rounded-xl shadow-lg p-6 text-center transform hover:scale-105 transition-transform">
            <div className="text-3xl font-bold text-steel-blue">{pastGames.length}</div>
            <div className="text-sm text-gray-600 mt-1">Games Played</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center transform hover:scale-105 transition-transform">
            <div className="text-3xl font-bold text-yellow-500">{pastGames.filter(g => g.status === 'Complete').length}</div>
            <div className="text-sm text-gray-600 mt-1">Victories</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center transform hover:scale-105 transition-transform">
            <div className="text-3xl font-bold text-green-600">{upcomingGames.length}</div>
            <div className="text-sm text-gray-600 mt-1">Upcoming</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center transform hover:scale-105 transition-transform">
            <div className="text-3xl font-bold text-red-600">{upcomingGames.filter(g => g.home_game).length}</div>
            <div className="text-sm text-gray-600 mt-1">Home Games</div>
          </div>
        </motion.div>

        {/* Upcoming Games */}
        {upcomingGames.length > 0 && (
          <div className="mb-16">
            <motion.h3 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-3xl font-bold text-dark-steel mb-8 flex items-center gap-3"
            >
              <FaCalendarAlt className="text-yellow-500" />
              Upcoming Battles
            </motion.h3>
            
            <div className="grid gap-6 max-w-5xl mx-auto">
              {upcomingGames.map((game, index) => {
                const dateInfo = formatDate(game.date);
                return (
                  <motion.div
                    key={game.id}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="group relative"
                  >
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                      <div className="flex flex-col lg:flex-row">
                        {/* Date Block */}
                        <div className="bg-gradient-to-br from-steel-blue to-dark-steel p-8 text-white text-center lg:w-48 relative overflow-hidden">
                          <div className="absolute top-0 right-0 opacity-10">
                            <FaHockeyPuck className="text-8xl transform rotate-45" />
                          </div>
                          <div className="relative z-10">
                            <div className="text-5xl font-bold mb-1">{dateInfo.day}</div>
                            <div className="text-xl font-medium mb-2">{dateInfo.month}</div>
                            <div className="text-sm opacity-90">{dateInfo.weekday}</div>
                            <div className="text-xs opacity-75 mt-1">{dateInfo.year}</div>
                          </div>
                          {game.home_game && (
                            <div className="absolute top-2 right-2 bg-yellow-400 text-black p-2 rounded-full">
                              <FaHome className="text-sm" />
                            </div>
                          )}
                        </div>
                        
                        {/* Game Details */}
                        <div className="flex-1 p-8">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <div className={`text-xs font-bold px-3 py-1 rounded-full ${
                                  game.home_game 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {game.home_game ? 'HOME GAME' : 'AWAY GAME'}
                                </div>
                                {game.status === 'Cancelled' && (
                                  <div className="bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                                    <FaBan className="text-xs" />
                                    CANCELLED
                                  </div>
                                )}
                              </div>
                              
                              <h3 className="text-2xl md:text-3xl font-bold text-dark-steel mb-2 group-hover:text-steel-blue transition-colors">
                                Wings of Steel
                                <span className="text-gray-400 mx-3">VS</span>
                                {game.opponent}
                              </h3>
                              
                              <div className="flex flex-wrap items-center gap-4 text-gray-600">
                                <div className="flex items-center gap-2">
                                  <FaClock className="text-steel-blue" />
                                  <span className="font-semibold">{formatTime(game.date)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <FaMapMarkerAlt className="text-steel-blue" />
                                  <span>{game.location}</span>
                                </div>
                              </div>
                              
                              {game.notes && (
                                <div className="mt-3 bg-yellow-50 text-yellow-900 px-4 py-2 rounded-lg text-sm font-medium inline-block">
                                  <FaTicketAlt className="inline mr-2" />
                                  {game.notes}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-6 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                              >
                                <FaTicketAlt />
                                Get Tickets
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Past Games */}
        {pastGames.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 className="text-3xl font-bold text-dark-steel mb-8 flex items-center gap-3">
              <FaTrophy className="text-yellow-500" />
              Recent Results
            </h3>
            
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="space-y-3">
                {pastGames.slice(-5).reverse().map((game, index) => {
                  const dateInfo = formatDate(game.date);
                  return (
                    <motion.div
                      key={game.id}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                      viewport={{ once: true }}
                      className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors border-b last:border-0"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-steel-blue">{dateInfo.day}</div>
                          <div className="text-xs text-gray-500">{dateInfo.month}</div>
                        </div>
                        <div>
                          <div className="font-semibold text-dark-steel flex items-center gap-2">
                            Wings of Steel vs {game.opponent}
                            {game.status === 'Complete' && (
                              <FaTrophy className="text-yellow-500 text-sm" />
                            )}
                          </div>
                          <div className="text-sm text-gray-600 flex items-center gap-3">
                            <span>{game.home_game ? 'Home' : 'Away'}</span>
                            <span>•</span>
                            <span>{game.location}</span>
                          </div>
                        </div>
                      </div>
                      <div className={`text-sm font-bold px-3 py-1 rounded-full ${
                        game.status === 'Complete' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {game.status}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-steel-blue to-dark-steel rounded-2xl p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 opacity-10">
              <FaHockeyPuck className="text-[150px] transform rotate-45" />
            </div>
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-4">Every Game is Free to Attend!</h3>
              <p className="mb-6 max-w-2xl mx-auto">
                Come experience the excitement of sled hockey and support our incredible athletes. 
                Bring your friends and family for an unforgettable experience!
              </p>
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="#contact"
                className="inline-block bg-yellow-400 text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-yellow-300 transition-colors duration-300 shadow-lg"
              >
                Get Directions to Our Rink
              </motion.a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Schedule;