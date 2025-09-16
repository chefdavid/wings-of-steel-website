import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { FaTimes, FaHockeyPuck, FaBirthdayCake } from 'react-icons/fa';
import { useTeamRoster } from '../hooks';
import { useTeam } from '../hooks/useTeam';
import { calculateAge, getYearsWithTeamDisplay } from '../utils/dateUtils';
import { getTeamCoaches } from '../utils/teamQueries';
import { getAvatarUrl } from '../utils/avatar';
import type { PlayerWithTeams, CoachWithTeams } from '../types/database';

const Team = () => {
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerWithTeams | null>(null);
  const [selectedCoach, setSelectedCoach] = useState<CoachWithTeams | null>(null);
  const [coaches, setCoaches] = useState<CoachWithTeams[]>([]);
  const [coachesLoading, setCoachesLoading] = useState(true);
  const { players, loading, error } = useTeamRoster();
  const { currentTeam, teamConfig } = useTeam();

  useEffect(() => {
    fetchCoaches();
  }, [currentTeam]);

  const fetchCoaches = async () => {
    try {
      setCoachesLoading(true);
      
      // Fetch coaches for the current team
      const teamCoaches = await getTeamCoaches(currentTeam);
      
      // Handle first_name/last_name compatibility and add defaults
      const coachesWithDefaults = teamCoaches.map(coach => ({
        ...coach,
        first_name: coach.first_name || coach.name?.split(' ')[0] || '',
        last_name: coach.last_name || coach.name?.split(' ').slice(1).join(' ') || '',
        start_date: coach.start_date || '',
        achievements: coach.achievements || []
      }));
      
      setCoaches(coachesWithDefaults);
    } catch (error) {
      console.error('Error fetching coaches:', error);
      setCoaches([]);
    } finally {
      setCoachesLoading(false);
    }
  };

  if (loading || coachesLoading) {
    return (
      <section className="py-12 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="animate-pulse text-steel-blue">Loading team roster...</div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-red-600">Error loading team roster</p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section id="team" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-8 md:mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">
              The Championship Pedigree in this area, The Best Players on the ICE
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              These young players, each with their own unique challenges and abilities, exemplify the
              spirit of sled hockey. Their prowess on the ice is measured by their ability to inspire,
              lead, and uplift their teammates.
            </p>
            <p className="text-base text-steel-blue mt-4 font-semibold">
              Click on a player or coach to learn more
            </p>
          </motion.div>

          <div id="team-players" className="mb-16">
            <h3 className="text-2xl md:text-3xl font-bold text-black mb-8 text-center">Players</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6 lg:gap-8 max-w-6xl mx-auto">
            {players.map((player, index) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="relative"
              >
                {/* Captain Tag - moved outside flip card */}
                {player.tags && player.tags.length > 0 && (
                  <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 z-20">
                    {player.tags.map((tag, tagIndex) => (
                      <div
                        key={tagIndex}
                        className={`bg-red-600 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-bold shadow-lg mb-0.5 sm:mb-1 ${
                          tagIndex > 0 ? 'mt-0.5 sm:mt-1' : ''
                        }`}
                      >
                        {tag}
                      </div>
                    ))}
                  </div>
                )}
                
                <div
                  className="flip-card h-56 sm:h-64 md:h-72 w-full cursor-pointer"
                  onClick={() => setSelectedPlayer(player)}
                >
                  <div className="flip-card-inner">
                  
                  {/* Front of card */}
                  <div className="flip-card-front bg-white rounded-xl shadow-xl p-4 sm:p-5 md:p-6 flex flex-col items-center justify-center border border-gray-100">
    <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-team-primary rounded-full flex items-center justify-center text-white text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 md:mb-6 shadow-lg">
      {player.jersey_number === 0 ? 'TBD' : player.jersey_number}
    </div>
    <h3 className="text-sm sm:text-base md:text-xl font-bold text-center text-gray-800 leading-tight">{player.first_name} {player.last_name}</h3>
    <p className="text-xs sm:text-sm text-steel-gray mt-1 sm:mt-2">{player.position}</p>
  </div>
                  
                  {/* Back of card */}
                  <div className="flip-card-back bg-gradient-to-br from-team-primary to-team-secondary rounded-xl shadow-xl p-3 sm:p-4 md:p-6 flex items-center justify-center">
                    <div className="text-center text-white">
                      <img 
                        src={getAvatarUrl(player.image_url, player.first_name, player.last_name, '#4682B4', 128)}
                        alt={`${player.first_name} ${player.last_name}`}
                        className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full mx-auto mb-2 sm:mb-3 border-2 sm:border-3 md:border-4 border-white shadow-lg object-cover"
                      />
                      <p className="font-bold text-xs sm:text-sm md:text-lg mb-0.5 sm:mb-1">{player.first_name} {player.last_name}</p>
                      <p className="text-xs sm:text-sm md:text-base font-semibold">#{player.jersey_number === 0 ? 'TBD' : player.jersey_number}</p>
                      <p className="text-[10px] sm:text-xs text-ice-blue mt-0.5 sm:mt-1">{player.position} • Age {player.birthdate ? calculateAge(player.birthdate) : player.age || 'Unknown'}</p>
                      {player.start_date && (
                        <p className="text-[10px] sm:text-xs text-yellow-300 mt-0.5">{getYearsWithTeamDisplay(player.start_date)}</p>
                      )}
                      <p className="text-[10px] sm:text-xs text-yellow-400 mt-1 sm:mt-2">Click for more info</p>
                    </div>
                  </div>
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
            className="text-center mb-8 md:mb-16"
          >
            <motion.a
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}
              whileTap={{ scale: 0.95 }}
              href="/join-team"
              className="inline-flex items-center gap-2 md:gap-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-6 py-3 md:px-12 md:py-6 rounded-full font-bold text-base md:text-xl shadow-2xl hover:from-yellow-300 hover:to-yellow-400 transition-all duration-300 transform"
            >
              <svg className="w-6 h-6 md:w-8 md:h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
              </svg>
              JOIN THE {teamConfig.name.toUpperCase()}!
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            </motion.a>
            <p className="text-gray-600 mt-3 md:mt-4 text-sm md:text-lg px-4">
              Ready to be part of something amazing? Come try sled hockey with us!
            </p>
          </motion.div>

          <motion.div
            id="team-coaches"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-8 md:mb-16"
          >
            <h3 className="text-2xl md:text-3xl font-bold text-center text-black mb-4 md:mb-8">
              Our Coaching Staff
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {coaches.map((coach, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flip-card h-56 sm:h-64 md:h-72 lg:h-80 w-full cursor-pointer"
                  onClick={() => setSelectedCoach(coach)}
                >
                  <div className="flip-card-inner">
                    {/* Front of card */}
                    <div className="flip-card-front bg-white rounded-lg shadow-lg p-3 sm:p-4 md:p-6 flex flex-col items-center justify-center">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-team-primary rounded-full flex items-center justify-center mb-2 sm:mb-3 md:mb-4">
                        <svg className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                        </svg>
                      </div>
                      <h3 className="text-sm sm:text-base md:text-xl font-semibold text-center mb-1 sm:mb-2">{coach.first_name} {coach.last_name}</h3>
                      <p className="text-xs sm:text-sm md:text-base text-steel-blue font-medium">{coach.role}</p>
                    </div>
                    
                    {/* Back of card */}
                    <div className="flip-card-back bg-gradient-to-br from-team-secondary to-team-background rounded-lg shadow-lg p-3 sm:p-4 md:p-6 flex items-center justify-center">
                      <div className="text-center text-white">
                        <img 
                          src={getAvatarUrl(coach.image_url, coach.first_name, coach.last_name, '#2C3E50', 128)}
                          alt={`${coach.first_name} ${coach.last_name}`}
                          className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full mx-auto mb-2 sm:mb-3"
                        />
                        <p className="font-bold text-xs sm:text-sm md:text-lg mb-0.5 sm:mb-1">{coach.first_name} {coach.last_name}</p>
                        <p className="text-ice-blue mb-1 sm:mb-2 text-[10px] sm:text-xs md:text-sm">{coach.role}</p>
                        {coach.start_date && (
                          <p className="text-[10px] sm:text-xs text-yellow-300 mb-1">{getYearsWithTeamDisplay(coach.start_date)}</p>
                        )}
                        <p className="text-[10px] sm:text-xs px-1 sm:px-2 line-clamp-2 sm:line-clamp-3">{coach.description}</p>
                        <p className="text-[10px] sm:text-xs text-yellow-400 mt-1 sm:mt-2">Click for more info</p>
                      </div>
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
              href="/join-team"
              className="inline-block bg-dark-steel text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-steel-gray transition-colors duration-300"
            >
              JOIN NOW
            </motion.a>
          </motion.div>
        </div>
      </section>

      {/* Player Modal */}
      <AnimatePresence>
        {selectedPlayer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedPlayer(null)}
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <div className="bg-gradient-to-br from-team-primary to-team-secondary p-8 text-white rounded-t-2xl">
                  <button
                    onClick={() => setSelectedPlayer(null)}
                    className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
                  >
                    <FaTimes className="text-2xl" />
                  </button>
                  <div className="flex items-center gap-6">
                    <img 
                      src={getAvatarUrl(selectedPlayer.image_url, selectedPlayer.first_name, selectedPlayer.last_name, '#4682B4', 128)}
                      alt={`${selectedPlayer.first_name} ${selectedPlayer.last_name}`}
                      className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                    />
                    <div>
                      <h2 className="text-3xl font-bold mb-2">{selectedPlayer.first_name} {selectedPlayer.last_name}</h2>
                      <div className="flex items-center gap-4 text-lg mb-3">
                        <span className="bg-white bg-opacity-20 px-4 py-2 rounded-full">
                          #{selectedPlayer.jersey_number === 0 ? 'TBD' : selectedPlayer.jersey_number}
                        </span>
                        <span>{selectedPlayer.position}</span>
                      </div>
                      {selectedPlayer.tags && selectedPlayer.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {selectedPlayer.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="bg-red-600 text-white text-sm px-3 py-1 rounded-full font-bold shadow-lg"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="p-8">
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="flex items-center gap-3">
                      <FaBirthdayCake className="text-steel-blue text-xl" />
                      <div>
                        <p className="font-semibold">Age</p>
                        <p className="text-gray-600">{selectedPlayer.birthdate ? calculateAge(selectedPlayer.birthdate) : selectedPlayer.age || 'Unknown'} years old</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <FaHockeyPuck className="text-steel-blue text-xl" />
                      <div>
                        <p className="font-semibold">Position</p>
                        <p className="text-gray-600">{selectedPlayer.position}</p>
                      </div>
                    </div>
                  </div>
                  
                  
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-bold mb-3">Player Stats</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-semibold">Jersey Number</p>
                        <p className="text-gray-600">#{selectedPlayer.jersey_number === 0 ? 'TBD' : selectedPlayer.jersey_number}</p>
                      </div>
                      <div>
                        <p className="font-semibold">Years with Team</p>
                        <p className="text-gray-600">{selectedPlayer.start_date ? getYearsWithTeamDisplay(selectedPlayer.start_date) : 'Not specified'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Coach Modal */}
      <AnimatePresence>
        {selectedCoach && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedCoach(null)}
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <div className="bg-gradient-to-br from-team-secondary to-team-background p-8 text-white rounded-t-2xl">
                  <button
                    onClick={() => setSelectedCoach(null)}
                    className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
                  >
                    <FaTimes className="text-2xl" />
                  </button>
                  <div className="flex items-center gap-6">
                    <img 
                      src={getAvatarUrl(selectedCoach.image_url, selectedCoach.first_name, selectedCoach.last_name, '#2C3E50', 128)}
                      alt={`${selectedCoach.first_name} ${selectedCoach.last_name}`}
                      className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                    />
                    <div>
                      <h2 className="text-3xl font-bold mb-2">{selectedCoach.first_name} {selectedCoach.last_name}</h2>
                      <div className="text-lg">
                        <span className="bg-white bg-opacity-20 px-4 py-2 rounded-full">
                          {selectedCoach.role}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-8">
                  <div className="mb-6">
                    <h3 className="text-xl font-bold mb-3">About {selectedCoach.first_name} {selectedCoach.last_name}</h3>
                    <p className="text-gray-700 leading-relaxed mb-4">{selectedCoach.description}</p>
                    {selectedCoach.experience && (
                      <p className="text-steel-blue font-semibold">{selectedCoach.experience}</p>
                    )}
                    {selectedCoach.start_date && (
                      <p className="text-gray-600 mt-2">
                        <span className="font-semibold">Years with team:</span> {getYearsWithTeamDisplay(selectedCoach.start_date)}
                      </p>
                    )}
                  </div>
                  
                  {selectedCoach.achievements && (
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h3 className="text-lg font-bold mb-3">Achievements & Qualifications</h3>
                      <ul className="space-y-2">
                        {selectedCoach.achievements.map((achievement, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-steel-blue rounded-full"></div>
                            <span className="text-gray-700">{achievement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Team;