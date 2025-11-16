import { motion } from 'framer-motion';
import { FaClock, FaMapMarkerAlt, FaHome, FaHockeyPuck, FaCalendarAlt } from 'react-icons/fa';
import { useGameSchedule } from '../hooks';

const TodayGameCard = () => {
  const { upcomingGames } = useGameSchedule();

  // Find today's game
  const getESTDateTime = () => {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    
    const parts = formatter.formatToParts(now);
    const year = parseInt(parts.find(p => p.type === 'year')?.value || '0');
    const month = parseInt(parts.find(p => p.type === 'month')?.value || '0') - 1;
    const day = parseInt(parts.find(p => p.type === 'day')?.value || '0');
    const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0');
    
    return { date: new Date(year, month, day), hour };
  };

  const isGameToday = (gameDate: string | null | undefined) => {
    if (!gameDate) return false;
    
    const estNow = getESTDateTime();
    const estDate = estNow.date;
    const estHour = estNow.hour;
    
    const gameDateObj = new Date(gameDate + 'T00:00:00');
    const gameYear = gameDateObj.getFullYear();
    const gameMonth = gameDateObj.getMonth();
    const gameDay = gameDateObj.getDate();
    
    const estDateYear = estDate.getFullYear();
    const estDateMonth = estDate.getMonth();
    const estDateDay = estDate.getDate();
    
    const isGameDate = 
      estDateYear === gameYear &&
      estDateMonth === gameMonth &&
      estDateDay === gameDay;
    
    const nextDay = new Date(gameYear, gameMonth, gameDay + 1);
    const isDayAfterBefore1AM = 
      estDateYear === nextDay.getFullYear() &&
      estDateMonth === nextDay.getMonth() &&
      estDateDay === nextDay.getDate() &&
      estHour < 1;
    
    return isGameDate || isDayAfterBefore1AM;
  };

  const todayGame = upcomingGames.find(game => isGameToday(game.game_date || game.date));

  if (!todayGame) {
    return null;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
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

  const dateInfo = formatDate(todayGame.game_date || todayGame.date || '');
  const isHome = todayGame.home_away === 'home' || todayGame.home_game;

  return (
    <section className="py-12 bg-gradient-to-br from-gray-50 via-white to-ice-blue/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto"
        >
          <div className="text-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 mb-3"
            >
              <FaCalendarAlt className="text-red-600 text-xl" />
              <h2 className="text-2xl md:text-3xl font-bold text-dark-steel">Game Today!</h2>
            </motion.div>
          </div>

          <div className="relative bg-gradient-to-r from-white to-gray-50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1">
            {/* TODAY Flag - Diagonal Corner Banner */}
            <>
              {/* Mobile Flag */}
              <div className="absolute top-0 right-0 z-30 pointer-events-none overflow-hidden w-[140px] h-[140px] md:hidden">
                <div 
                  className="absolute bg-red-600 text-white text-[10px] font-bold py-2 shadow-lg"
                  style={{
                    top: '15px',
                    right: '-22px',
                    transform: 'rotate(45deg)',
                    transformOrigin: 'center',
                    width: '140px',
                    paddingLeft: '45px',
                    paddingRight: '45px',
                    textAlign: 'center',
                    letterSpacing: '0.5px'
                  }}
                >
                  TODAY
                </div>
              </div>
              {/* Desktop Flag - Full Corner Coverage */}
              <div className="absolute top-0 right-0 z-30 pointer-events-none overflow-hidden w-[320px] h-[320px] hidden md:block">
                <div 
                  className="absolute bg-red-600 text-white text-base font-bold py-6 shadow-lg"
                  style={{
                    top: '45px',
                    right: '-55px',
                    transform: 'rotate(45deg)',
                    transformOrigin: 'center',
                    width: '320px',
                    paddingLeft: '110px',
                    paddingRight: '110px',
                    textAlign: 'center',
                    letterSpacing: '1.5px'
                  }}
                >
                  TODAY
                </div>
              </div>
            </>
            
            {/* Inner container */}
            <div className="relative">
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
                
                {/* Game Details */}
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
                        {todayGame.status === 'Cancelled' && (
                          <div className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                            CANCELLED
                          </div>
                        )}
                      </div>
                      
                      {/* Team Names */}
                      <h3 className="text-xl md:text-2xl font-bold text-dark-steel mb-3 group-hover:text-steel-blue transition-colors">
                        <span className="bg-gradient-to-r from-steel-blue to-dark-steel bg-clip-text text-transparent">Wings of Steel</span>
                        <span className="text-gray-400 mx-2 text-lg">vs</span>
                        <span className="text-gray-700">{todayGame.opponent}</span>
                      </h3>
                      
                      {/* Info Row */}
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full">
                          <FaClock className="text-steel-blue" />
                          <span className="font-medium text-gray-700">{formatTime(todayGame.game_time || '')}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full">
                          <FaMapMarkerAlt className="text-steel-blue" />
                          <span className="text-blue-700 font-medium">{todayGame.location}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Notes */}
                    {todayGame.notes && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-sm text-gray-600 italic flex items-start gap-2">
                          <span className="text-yellow-500 mt-0.5">ℹ️</span>
                          {todayGame.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TodayGameCard;

