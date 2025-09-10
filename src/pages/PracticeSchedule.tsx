import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUsers, FaArrowLeft, FaHockeyPuck, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { supabase } from '../lib/supabaseClient';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

interface PracticeSession {
  id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  team_type: string;
  location?: string;
  notes?: string;
  is_active: boolean;
  effective_from: string;
  effective_to: string;
  day_order: number;
}

const PracticeSchedule = () => {
  const [practices, setPractices] = useState<PracticeSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const practiceRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    fetchPractices();
  }, []);

  const fetchPractices = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('practice_schedules')
        .select('*')
        .eq('is_active', true)
        .gte('effective_to', today)
        .order('effective_from')
        .order('day_order')
        .order('start_time');

      if (error) throw error;
      setPractices(data || []);
    } catch (error) {
      console.error('Error fetching practices:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const groupPracticesByPeriod = () => {
    const grouped: { [key: string]: PracticeSession[] } = {};
    
    practices.forEach(practice => {
      const key = `${practice.effective_from}_${practice.effective_to}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(practice);
    });

    return Object.entries(grouped).map(([key, sessions]) => {
      const [from, to] = key.split('_');
      return { from, to, sessions };
    });
  };

  // Get all practice dates for calendar marking
  const getPracticeDates = () => {
    const dates: Date[] = [];
    practices.forEach(practice => {
      const startDate = new Date(practice.effective_from + 'T00:00:00');
      const endDate = new Date(practice.effective_to + 'T00:00:00');
      
      // Get day of week number (0 = Sunday, 6 = Saturday)
      const dayMap: { [key: string]: number } = {
        'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3,
        'Thursday': 4, 'Friday': 5, 'Saturday': 6
      };
      const targetDay = dayMap[practice.day_of_week] || 0;
      
      // Generate all dates for this practice's day of week within the period
      const current = new Date(startDate);
      while (current <= endDate) {
        if (current.getDay() === targetDay) {
          dates.push(new Date(current));
        }
        current.setDate(current.getDate() + 1);
      }
    });
    return dates;
  };

  const practiceDates = getPracticeDates();

  // Check if a date has practice
  const hasPractice = (date: Date) => {
    return practiceDates.some(pd => 
      pd.getDate() === date.getDate() &&
      pd.getMonth() === date.getMonth() &&
      pd.getFullYear() === date.getFullYear()
    );
  };

  // Get practice for a specific date
  const getPracticeForDate = (date: Date) => {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = dayNames[date.getDay()];
    const dateStr = date.toISOString().split('T')[0];
    
    return practices.find(p => 
      p.day_of_week === dayOfWeek &&
      dateStr >= p.effective_from &&
      dateStr <= p.effective_to
    );
  };

  // Handle date click from calendar
  const handleDateClick = (date: Date) => {
    const practice = getPracticeForDate(date);
    if (practice) {
      setSelectedDate(date);
      // Scroll to the practice card
      const key = `${practice.effective_from}_${practice.effective_to}`;
      if (practiceRefs.current[key]) {
        practiceRefs.current[key]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  // Custom tile content for calendar
  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month' && hasPractice(date)) {
      return (
        <div className="flex justify-center mt-1">
          <div className="w-2 h-2 bg-steel-blue rounded-full"></div>
        </div>
      );
    }
    return null;
  };

  // Custom tile class for calendar
  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month' && hasPractice(date)) {
      return 'has-practice hover:bg-ice-blue/20';
    }
    return '';
  };

  const practiceGroups = groupPracticesByPeriod();

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-dark-steel to-steel-blue pt-32 pb-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-sport text-white mb-4">
              Practice Schedule
            </h1>
            <p className="text-xl text-ice-blue max-w-3xl mx-auto">
              Join us on the ice for skill development, team building, and the joy of sled hockey
            </p>
          </motion.div>
        </div>
      </section>
      
      {/* Calendar Section */}
      <section className="py-8 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-6"
          >
            <h2 className="text-2xl font-sport text-dark-steel mb-2">
              Practice Calendar
            </h2>
            <p className="text-gray-600">Click on marked dates to view practice details</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-4xl mx-auto"
          >
            <style>{`
              .react-calendar {
                width: 100%;
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 12px;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                font-family: inherit;
                padding: 20px;
              }
              .react-calendar__navigation {
                margin-bottom: 1em;
                height: 60px;
                display: flex;
                align-items: center;
              }
              .react-calendar__navigation button {
                background: none;
                font-size: 18px;
                font-weight: 600;
                color: #1f2937;
              }
              .react-calendar__navigation button:hover {
                background-color: #f3f4f6;
              }
              .react-calendar__navigation button:disabled {
                background-color: transparent;
                color: #9ca3af;
              }
              .react-calendar__month-view__weekdays {
                text-transform: uppercase;
                font-weight: bold;
                font-size: 14px;
                color: #6b7280;
                border-bottom: 2px solid #e5e7eb;
                padding-bottom: 8px;
                margin-bottom: 8px;
              }
              .react-calendar__tile {
                height: 80px;
                display: flex;
                flex-direction: column;
                justify-content: flex-start;
                align-items: center;
                padding: 10px 6px;
                font-size: 16px;
                position: relative;
              }
              .react-calendar__tile:hover {
                background-color: #f3f4f6;
                border-radius: 8px;
              }
              .react-calendar__tile--active {
                background: #2563eb;
                color: white;
                border-radius: 8px;
              }
              .react-calendar__tile--active:hover {
                background: #1d4ed8;
              }
              .react-calendar__tile--now {
                background: #dbeafe;
                border-radius: 8px;
                font-weight: bold;
              }
              .react-calendar__tile.has-practice {
                cursor: pointer;
                font-weight: 600;
                color: #1e40af;
              }
              .react-calendar__tile.has-practice:hover {
                background-color: #dbeafe;
              }
              @media (max-width: 768px) {
                .react-calendar__tile {
                  height: 60px;
                  font-size: 14px;
                }
              }
            `}</style>
            <Calendar
              onChange={(value) => {
                if (value instanceof Date) {
                  handleDateClick(value);
                }
              }}
              value={calendarDate}
              onActiveStartDateChange={({ activeStartDate }) => 
                activeStartDate && setCalendarDate(activeStartDate)
              }
              tileContent={tileContent}
              tileClassName={tileClassName}
              navigationLabel={({ date }) => 
                date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
              }
              prevLabel={<FaChevronLeft />}
              nextLabel={<FaChevronRight />}
              prev2Label={null}
              next2Label={null}
            />
          </motion.div>
        </div>
      </section>
      
      {/* Main Content */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-sport text-dark-steel mb-3">
              Practice Details
            </h2>
            <div className="w-24 h-1 bg-steel-blue mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">
              All practice times and locations for the current season
            </p>
          </motion.div>

          {/* Practice Schedule */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-steel-blue"></div>
              <p className="text-gray-600 mt-4">Loading practice schedule...</p>
            </div>
          ) : practiceGroups.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-lg">
              <FaHockeyPuck className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-xl text-gray-500 font-medium">No practices currently scheduled</p>
              <p className="text-gray-400 mt-2">Please check back later for updates</p>
            </div>
          ) : (
            <div className="space-y-12">
              {practiceGroups.map((group, groupIndex) => {
                const key = `${group.from}_${group.to}`;
                const isSelected = selectedDate && 
                  getPracticeForDate(selectedDate)?.effective_from === group.from;
                
                return (
                  <motion.div
                    key={key}
                    ref={el => practiceRefs.current[key] = el}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: groupIndex * 0.1 }}
                    className={`bg-white rounded-xl shadow-lg p-8 border-2 transition-all ${
                      isSelected ? 'border-steel-blue ring-4 ring-steel-blue/20' : 'border-gray-200'
                    }`}
                  >
                    {/* Period Header */}
                    <div className="mb-6 pb-4 border-b border-gray-200">
                      <h3 className="text-3xl font-sport text-steel-blue mb-2">
                        Practice Period
                      </h3>
                      <p className="text-xl font-semibold text-gray-700">
                        {formatDate(group.from)} - {formatDate(group.to)}
                      </p>
                    </div>

                    {/* Practice Sessions */}
                    <div className="grid md:grid-cols-2 gap-6">
                      {group.sessions.map((practice) => (
                        <div
                          key={practice.id}
                          className="bg-gray-50 rounded-lg p-6 border-2 border-gray-200 hover:border-steel-blue hover:shadow-md transition-all"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <h4 className="text-2xl font-bold text-dark-steel">
                              {practice.day_of_week}
                            </h4>
                            <span className="px-4 py-2 bg-steel-blue text-white rounded-full text-base font-bold">
                              {practice.team_type}
                            </span>
                          </div>

                          <div className="space-y-4 text-gray-700">
                            <div className="flex items-center gap-3">
                              <FaClock className="text-steel-blue text-xl" />
                              <span className="text-lg font-semibold">
                                {formatTime(practice.start_time)} - {formatTime(practice.end_time)}
                              </span>
                            </div>

                            {practice.location && (
                              <div className="flex items-center gap-3">
                                <FaMapMarkerAlt className="text-steel-blue text-xl" />
                                <span className="text-lg font-semibold">{practice.location}</span>
                              </div>
                            )}

                            <div className="flex items-center gap-3">
                              <FaUsers className="text-steel-blue text-xl" />
                              <span className="text-lg font-semibold">Team: {practice.team_type}</span>
                            </div>

                            {practice.notes && (
                              <div className="mt-4 pt-4 border-t border-gray-300">
                                <p className="text-base italic text-gray-600 font-medium">{practice.notes}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Location Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
            className="mt-12 bg-gradient-to-r from-steel-blue to-dark-steel rounded-xl p-8 text-center shadow-xl">
            <h3 className="text-2xl font-sport text-white mb-4">
              Practice Location
            </h3>
            <p className="text-xl text-white mb-2 font-semibold">Grundy Ice Arena</p>
            <p className="text-ice-blue mb-6">
              1001 South Broad St, Bristol, PA 19047
            </p>
            <a
              href="https://www.google.com/maps/dir/?api=1&destination=Grundy+Ice+Arena+1001+South+Broad+St+Bristol+PA+19047"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3 bg-white text-steel-blue rounded-full font-bold hover:bg-gray-100 transition-all duration-200 shadow-lg"
            >
              <FaMapMarkerAlt />
              Get Directions
            </a>
          </motion.div>
          
          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mt-12 text-center bg-white rounded-xl p-8 shadow-lg"
          >
            <h3 className="text-2xl font-bold text-dark-steel mb-4">
              Ready to Join?
            </h3>
            <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
              New players are always welcome! Contact us to schedule a trial session 
              and experience the excitement of sled hockey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/join-team"
                className="bg-steel-blue text-white px-8 py-3 rounded-lg font-bold hover:bg-dark-steel transition-colors shadow-lg"
              >
                Join the Team
              </Link>
              <Link
                to="/#contact"
                className="bg-white text-steel-blue border-2 border-steel-blue px-8 py-3 rounded-lg font-bold hover:bg-gray-50 transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default PracticeSchedule;