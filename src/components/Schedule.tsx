import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaTrophy, FaBan, FaHockeyPuck, FaHome, FaTimes, FaPhone, FaGlobe, FaDirections, FaEye } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useGameSchedule, useGameHighlights } from '../hooks';
import GameHighlightsPreview from './GameHighlightsPreview';
import type { GameHighlight } from '../types/database';

const Schedule = () => {
  const { upcomingGames, pastGames, loading, error } = useGameSchedule();
  const { highlights } = useGameHighlights();
  const [showRinkModal, setShowRinkModal] = useState(false);
  const [selectedRink, setSelectedRink] = useState<{
    name: string;
    address: string;
    opponent?: string;
    isHome: boolean;
    phone?: string;
    website?: string;
  } | null>(null);

  // Filter published highlights and match with past games
  const gamesWithHighlights = pastGames
    .map(game => {
      const highlight = highlights.find(h => h.game_id === game.id && h.is_published);
      return highlight ? { game, highlight } : null;
    })
    .filter((item): item is { game: typeof pastGames[0]; highlight: GameHighlight } => item !== null);

  // Mapping of opponents to their rink information
  const awayRinks: { [key: string]: { name: string; address: string; phone?: string; website?: string } } = {
    'Hammerheads': {
      name: 'Skate Zone NE',
      address: '10990 Decatur Rd, Philadelphia, PA 19154',
      phone: '(215) 969-1200',
      website: 'https://www.oiceskatezonenortheast.com/'
    },
    'Sled Stars': {
      name: 'Hollydell Ice Arena',
      address: '601 Holly Dell Dr, Sewell, NJ 08080',
      phone: '(856) 589-4799',
      website: 'https://www.hollydellicearena.com/'
    },
    'Bennett Blazers': {
      name: 'Ice World',
      address: '1300 Governor Court, Abingdon, MD 21009',
      phone: '(410) 612-1000',
      website: 'https://www.iceworldmd.com/'
    },
    'DC Sled Sharks': {
      name: 'Kettler Capitals Ice Plex',
      address: '627 N. Glebe Rd, Suite 800, Arlington, VA 22203',
      phone: '(703) 243-8855',
      website: 'https://www.kettlercapitalsiceplex.com/'
    }
  };

  const homeRink = {
    name: 'Flyers Skate Zone',
    address: '601 Laurel Oak Rd, Voorhees Township, NJ 08043',
    phone: '(856) 751-9161',
    website: 'https://flyersskatezone.com/'
  };

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
    const date = new Date(dateString + 'T00:00:00'); // Ensure proper date parsing
    return {
      month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
      day: date.getDate(),
      weekday: date.toLocaleDateString('en-US', { weekday: 'long' }),
      year: date.getFullYear()
    };
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
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
            <div className="text-3xl font-bold text-yellow-500">{pastGames.filter(g => g.result?.startsWith('W')).length}</div>
            <div className="text-sm text-gray-600 mt-1">Victories</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center transform hover:scale-105 transition-transform">
            <div className="text-3xl font-bold text-green-600">{upcomingGames.length}</div>
            <div className="text-sm text-gray-600 mt-1">Upcoming</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center transform hover:scale-105 transition-transform">
            <div className="text-3xl font-bold text-red-600">{upcomingGames.filter(g => g.home_away === 'home').length}</div>
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
              Game Schedule
            </motion.h3>
            
            <div className="grid gap-6 max-w-5xl mx-auto">
              {upcomingGames.map((game, index) => {
                const dateInfo = formatDate(game.game_date || game.date || '');
                const isHome = game.home_away === 'home' || game.home_game;
                return (
                  <motion.div
                    key={game.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.08 }}
                    viewport={{ once: true }}
                    className="group"
                  >
                    <div className="relative bg-gradient-to-r from-white to-gray-50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1">
                      {/* Background Hockey Puck */}
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
                        <FaHockeyPuck className="text-[120px] text-steel-blue transform rotate-12" />
                      </div>
                      
                      <div className="relative flex items-stretch">
                        {/* Date Block with Gradient */}
                        <div className="bg-gradient-to-br from-steel-blue via-steel-blue to-dark-steel p-5 md:p-7 text-white text-center w-28 md:w-36 rounded-l-2xl relative overflow-hidden">
                          <div className="absolute inset-0 bg-black opacity-10"></div>
                          <div className="relative z-10">
                            <div className="text-3xl md:text-4xl font-bold mb-1">{dateInfo.day}</div>
                            <div className="text-base md:text-lg font-semibold uppercase tracking-wide">{dateInfo.month}</div>
                            <div className="text-xs md:text-sm opacity-90 mt-1">{dateInfo.weekday}</div>
                          </div>
                          {isHome && (
                            <div className="absolute top-2 right-2 bg-yellow-400 text-black p-1.5 rounded-full shadow-md">
                              <FaHome className="text-xs" />
                            </div>
                          )}
                        </div>
                        
                        {/* Game Details with Better Spacing */}
                        <div className="flex-1 p-5 md:p-7 relative">
                          <div className="flex flex-col h-full justify-between">
                            <div>
                              {/* Badges Row */}
                              <div className="flex items-center gap-2 mb-3">
                                <div className={`text-xs font-bold px-3 py-1 rounded-full shadow-sm ${
                                  isHome 
                                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' 
                                    : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                                }`}>
                                  {isHome ? 'HOME GAME' : 'AWAY GAME'}
                                </div>
                                {game.status === 'Cancelled' && (
                                  <div className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                                    <FaBan className="text-xs" />
                                    CANCELLED
                                  </div>
                                )}
                              </div>
                              
                              {/* Team Names */}
                              <h3 className="text-xl md:text-2xl font-bold text-dark-steel mb-3 group-hover:text-steel-blue transition-colors">
                                <span className="bg-gradient-to-r from-steel-blue to-dark-steel bg-clip-text text-transparent">Wings of Steel</span>
                                <span className="text-gray-400 mx-2 text-lg">vs</span>
                                <span className="text-gray-700">{game.opponent}</span>
                              </h3>
                              
                              {/* Info Row */}
                              <div className="flex flex-wrap items-center gap-4 text-sm">
                                <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full">
                                  <FaClock className="text-steel-blue" />
                                  <span className="font-medium text-gray-700">{formatTime(game.game_time || '')}</span>
                                </div>
                                <button
                                  onClick={() => {
                                    const rinkInfo = isHome
                                      ? homeRink
                                      : awayRinks[game.opponent] || null;

                                    if (rinkInfo) {
                                      setSelectedRink({
                                        ...rinkInfo,
                                        opponent: game.opponent,
                                        isHome
                                      });
                                    } else {
                                      // Fallback to home rink modal if no away rink info
                                      setShowRinkModal(true);
                                    }
                                  }}
                                  className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full transition-colors group cursor-pointer"
                                >
                                  <FaMapMarkerAlt className="text-steel-blue" />
                                  <span className="text-blue-700 font-medium group-hover:underline">{game.location}</span>
                                </button>
                              </div>
                            </div>
                            
                            {/* Notes */}
                            {game.notes && (
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <p className="text-sm text-gray-600 italic flex items-start gap-2">
                                  <span className="text-yellow-500 mt-0.5">ℹ️</span>
                                  {game.notes}
                                </p>
                              </div>
                            )}
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

        {/* Game Highlights */}
        {gamesWithHighlights.length > 0 && (
          <div className="mb-16">
            <motion.h3
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-3xl font-bold text-dark-steel mb-8 flex items-center gap-3"
            >
              <FaTrophy className="text-yellow-500" />
              Game Highlights
            </motion.h3>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gamesWithHighlights.slice(0, 6).map(({ game, highlight }, index) => (
                <GameHighlightsPreview
                  key={game.id}
                  game={game}
                  highlight={highlight}
                  index={index}
                />
              ))}
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
              Previous Games
            </h3>
            
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="space-y-3">
                {pastGames.slice(-5).reverse().map((game, index) => {
                  const dateInfo = formatDate(game.game_date || game.date || '');
                  const isHome = game.home_away === 'home' || game.home_game;
                  const gameHighlight = highlights.find(h => h.game_id === game.id && h.is_published);
                  const hasHighlight = !!gameHighlight;

                  return (
                    <motion.div
                      key={game.id}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                      viewport={{ once: true }}
                      className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors border-b last:border-0"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-steel-blue">{dateInfo.day}</div>
                          <div className="text-xs text-gray-500">{dateInfo.month}</div>
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-dark-steel flex items-center gap-2">
                            Wings of Steel vs {game.opponent}
                            {game.status === 'Complete' && (
                              <FaTrophy className="text-yellow-500 text-sm" />
                            )}
                            {hasHighlight && (
                              <span className="bg-yellow-400 text-black text-xs px-2 py-0.5 rounded-full font-bold">
                                HIGHLIGHTS
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 flex items-center gap-3">
                            <span>{isHome ? 'Home' : 'Away'}</span>
                            <span>•</span>
                            <span>{game.location}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-3 md:mt-0">
                        {hasHighlight && (
                          <Link
                            to={`/game/${game.id}`}
                            className="flex items-center gap-2 px-4 py-2 bg-steel-blue text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
                          >
                            <FaEye />
                            View Highlights
                          </Link>
                        )}
                        <div className={`text-sm font-bold px-3 py-1 rounded-full ${
                          game.status === 'Complete'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {game.status}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Tournaments Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <div className="bg-gradient-to-br from-yellow-50 via-white to-yellow-50 rounded-2xl shadow-xl p-8 border-2 border-yellow-200">
            <h3 className="text-3xl font-bold text-dark-steel mb-8 flex items-center gap-3 justify-center">
              <FaTrophy className="text-yellow-500" />
              Tournaments
            </h3>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* Amelia Park Tournament */}
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-yellow-400"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-yellow-100 p-3 rounded-lg">
                    <FaTrophy className="text-2xl text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-xl text-dark-steel mb-2">Amelia Park Tournament</h4>
                    <div className="space-y-2 text-gray-700">
                      <p className="flex items-center gap-2">
                        <FaCalendarAlt className="text-steel-blue" />
                        <span className="font-medium">March 27-29, 2026</span>
                      </p>
                      <p className="text-sm text-gray-600">Thursday - Sunday</p>
                      <p className="flex items-center gap-2 mt-3">
                        <FaMapMarkerAlt className="text-steel-blue" />
                        <span>Westfield, MA</span>
                      </p>
                      <div className="mt-4 pt-4 border-t">
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent('Amelia Park Ice Arena, Westfield, MA')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-steel-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          <FaDirections />
                          Get Directions
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* USA Hockey Tournament */}
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-red-500"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-red-100 p-3 rounded-lg">
                    <FaTrophy className="text-2xl text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-xl text-dark-steel mb-2">USA Hockey Tournament</h4>
                    <div className="space-y-2 text-gray-700">
                      <p className="flex items-center gap-2">
                        <FaCalendarAlt className="text-steel-blue" />
                        <span className="font-medium">April 30 - May 3, 2026</span>
                      </p>
                      <p className="text-sm text-gray-600">Thursday - Sunday</p>
                      <p className="flex items-center gap-2 mt-3">
                        <FaMapMarkerAlt className="text-steel-blue" />
                        <span>Dallas, TX</span>
                      </p>
                      <div className="mt-4 pt-4 border-t">
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent('Dallas, TX')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-steel-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          <FaDirections />
                          Get Directions
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Away Rink Locations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-3xl font-bold text-dark-steel mb-8 flex items-center gap-3 justify-center">
              <FaMapMarkerAlt className="text-steel-blue" />
              Away Game Locations
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {/* Hammerheads */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                <h4 className="font-bold text-lg text-dark-steel mb-2">Hammerheads</h4>
                <p className="text-gray-600 mb-3">Skate Zone NE</p>
                <p className="text-sm text-gray-600 mb-4">10990 Decatur Rd, Philadelphia, PA 19154</p>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent('10990 Decatur Rd, Philadelphia, PA 19154')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-steel-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FaDirections className="text-lg" />
                  Get Directions
                </a>
              </div>

              {/* Sled Stars */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                <h4 className="font-bold text-lg text-dark-steel mb-2">Sled Stars</h4>
                <p className="text-gray-600 mb-3">Hollydell Ice Arena</p>
                <p className="text-sm text-gray-600 mb-4">601 Holly Dell Dr, Sewell, NJ 08080</p>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent('601 Holly Dell Dr, Sewell, NJ 08080')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-steel-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FaDirections className="text-lg" />
                  Get Directions
                </a>
              </div>

              {/* Bennett Blazers */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                <h4 className="font-bold text-lg text-dark-steel mb-2">Bennett Blazers</h4>
                <p className="text-gray-600 mb-3">Ice World</p>
                <p className="text-sm text-gray-600 mb-4">1300 Governor Court, Abingdon, MD 21009</p>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent('1300 Governor Court, Abingdon, MD 21009')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-steel-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FaDirections className="text-lg" />
                  Get Directions
                </a>
              </div>

              {/* DC Sharks */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                <h4 className="font-bold text-lg text-dark-steel mb-2">DC Sled Sharks</h4>
                <p className="text-gray-600 mb-3">Kettler Capitals Ice Plex</p>
                <p className="text-sm text-gray-600 mb-4">627 N. Glebe Rd, Suite 800, Arlington, VA 22203</p>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent('627 N. Glebe Rd, Suite 800, Arlington, VA 22203')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-steel-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FaDirections className="text-lg" />
                  Get Directions
                </a>
              </div>
            </div>

            {/* Home Rink Info */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="bg-gradient-to-r from-ice-blue/20 to-steel-blue/10 rounded-xl p-6 text-center">
                <h4 className="font-bold text-lg text-dark-steel mb-2">
                  <FaHome className="inline mr-2 text-steel-blue" />
                  Home Games - Flyers Skate Zone
                </h4>
                <p className="text-gray-600 mb-3">601 Laurel Oak Rd, Voorhees Township, NJ 08043</p>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent('601 Laurel Oak Rd, Voorhees Township, NJ 08043')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-yellow-400 text-black px-6 py-3 rounded-lg hover:bg-yellow-300 transition-colors font-bold shadow-md"
                >
                  <FaDirections className="text-lg" />
                  Directions to Home Rink
                </a>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
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
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowRinkModal(true)}
                className="inline-block bg-yellow-400 text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-yellow-300 transition-colors duration-300 shadow-lg cursor-pointer"
              >
                View Rink Details
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Selected Rink Details Modal */}
      <AnimatePresence>
        {selectedRink && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedRink(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-2xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative p-6 border-b">
                <button
                  onClick={() => setSelectedRink(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <FaTimes className="w-5 h-5" />
                </button>

                <h2 className="text-2xl font-bold text-gray-900 pr-10">{selectedRink.name}</h2>
                <p className="text-gray-600 mt-1">
                  {selectedRink.isHome ? 'Home of Wings of Steel Sled Hockey' : `Home of ${selectedRink.opponent}`}
                </p>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <FaMapMarkerAlt className="text-steel-blue" />
                      Location
                    </h3>
                    <p className="text-gray-700">{selectedRink.address}</p>
                  </div>

                  {selectedRink.phone && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <FaPhone className="text-steel-blue" />
                        Contact
                      </h3>
                      <p className="text-gray-700">Phone: {selectedRink.phone}</p>
                    </div>
                  )}


                  {selectedRink.isHome && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Rink Information</h3>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Main Rink:</span>
                          <span className="font-medium">NHL Regulation Size</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Rink #3:</span>
                          <span className="font-medium">Practice Rink (Main Season)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Parking:</span>
                          <span className="font-medium">Free, Ample Spaces</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Accessibility:</span>
                          <span className="font-medium">Fully Accessible</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t">
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(selectedRink.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-steel-blue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-bold shadow-md w-full justify-center"
                    >
                      <FaDirections className="text-lg" />
                      Get Directions
                    </a>
                  </div>

                  {!selectedRink.isHome && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-900">
                        <strong>Away Game:</strong> This is an away game location. Please plan extra time for travel and arrival.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Original Home Rink Details Modal */}
      <AnimatePresence>
        {showRinkModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowRinkModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-2xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative p-6 border-b">
                <button
                  onClick={() => setShowRinkModal(false)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
                
                <h2 className="text-2xl font-bold text-gray-900 pr-10">Flyers Skate Zone</h2>
                <p className="text-gray-600 mt-1">Home of Wings of Steel Sled Hockey</p>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <FaMapMarkerAlt className="text-steel-blue" />
                      Location
                    </h3>
                    <p className="text-gray-700">601 Laurel Oak Rd</p>
                    <p className="text-gray-700">Voorhees Township, NJ 08043</p>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent('601 Laurel Oak Rd, Voorhees Township, NJ 08043')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-2 text-blue-600 hover:text-blue-700 text-sm"
                    >
                      <FaDirections />
                      Get Directions
                    </a>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <FaPhone className="text-steel-blue" />
                      Contact
                    </h3>
                    <p className="text-gray-700">Phone: (856) 751-9161</p>
                    <a 
                      href="https://flyersskatezone.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-2 text-blue-600 hover:text-blue-700 text-sm"
                    >
                      <FaGlobe />
                      Visit Website
                    </a>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Rink Information</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Main Rink:</span>
                        <span className="font-medium">NHL Regulation Size</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Rink #3:</span>
                        <span className="font-medium">Practice Rink (Main Season)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Parking:</span>
                        <span className="font-medium">Free, Ample Spaces</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Accessibility:</span>
                        <span className="font-medium">Fully Accessible</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-900">
                      <strong>Note:</strong> Specific rink assignments may vary. Please check with team management for the most current practice location within the facility.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Schedule;