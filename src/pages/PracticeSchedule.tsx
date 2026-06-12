import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUsers, FaHockeyPuck, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
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
  description?: string;
  season?: string;
}

const toDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const PracticeSchedule = () => {
  const [practices, setPractices] = useState<PracticeSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [calendarDate, setCalendarDate] = useState(new Date());

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
      day: 'numeric',
    });
  };

  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return {
      month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
      day: date.getDate(),
      weekday: date.toLocaleDateString('en-US', { weekday: 'short' }),
    };
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getPracticeDates = () => {
    const dates: Date[] = [];
    practices.forEach((practice) => {
      const startDate = new Date(practice.effective_from + 'T00:00:00');
      const endDate = new Date(practice.effective_to + 'T00:00:00');

      const dayMap: { [key: string]: number } = {
        Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3,
        Thursday: 4, Friday: 5, Saturday: 6,
      };
      const targetDay = dayMap[practice.day_of_week] || 0;

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

  const hasPractice = (date: Date) =>
    practiceDates.some((pd) => isSameDay(pd, date));

  const getPracticeForDate = (date: Date) => {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = dayNames[date.getDay()];
    const dateStr = toDateString(date);

    return practices.find(
      (p) =>
        p.day_of_week === dayOfWeek &&
        dateStr >= p.effective_from &&
        dateStr <= p.effective_to
    );
  };

  const getAllPracticesForDate = (date: Date) => {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = dayNames[date.getDay()];
    const dateStr = toDateString(date);

    return practices.filter(
      (p) =>
        p.day_of_week === dayOfWeek &&
        dateStr >= p.effective_from &&
        dateStr <= p.effective_to
    );
  };

  const formatTimeShort = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const suffix = hour >= 12 ? 'p' : 'a';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes}${suffix}`;
  };

  const handleDateSelect = (date: Date) => {
    if (!getPracticeForDate(date)) return;
    setSelectedDate(date);
    setCalendarDate(date);
  };

  const sortedPractices = [...practices].sort((a, b) =>
    a.effective_from.localeCompare(b.effective_from)
  );

  const selectedPractice = selectedDate ? getPracticeForDate(selectedDate) : null;

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return null;

    const datePractices = getAllPracticesForDate(date);
    if (datePractices.length > 0) {
      return (
        <div className="flex flex-col items-center mt-0.5 leading-tight">
          {datePractices.map((p, i) => (
            <span key={i} className="text-[10px] md:text-xs font-semibold text-steel-blue">
              {formatTimeShort(p.start_time)}
            </span>
          ))}
        </div>
      );
    }
    return null;
  };

  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return '';
    const classes = [];
    if (hasPractice(date)) classes.push('has-practice hover:bg-ice-blue/20');
    if (selectedDate && isSameDay(date, selectedDate)) classes.push('is-selected-practice');
    return classes.join(' ');
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-dark-steel to-steel-blue pt-32 pb-16">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={false}
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

      {/* Calendar + List Split */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-steel-blue" />
              <p className="text-gray-600 mt-4">Loading practice schedule...</p>
            </div>
          ) : practices.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-lg">
              <FaHockeyPuck className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-xl text-gray-500 font-medium">No practices currently scheduled</p>
              <p className="text-gray-400 mt-2">Please check back later for updates</p>
            </div>
          ) : (
            <>
              <div className="grid lg:grid-cols-2 gap-8 items-start">
                {/* Calendar — left half */}
                <motion.div
                  initial={false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
                >
                  <div className="mb-4">
                    <h2 className="text-2xl font-sport text-dark-steel flex items-center gap-2">
                      <FaCalendarAlt className="text-steel-blue" />
                      Practice Calendar
                    </h2>
                    <p className="text-gray-600 text-sm mt-1">
                      Click a highlighted date to view details
                    </p>
                  </div>

                  <style>{`
                    .react-calendar {
                      width: 100%;
                      background: white;
                      border: none;
                      font-family: inherit;
                    }
                    .react-calendar__navigation {
                      margin-bottom: 1em;
                      height: 48px;
                      display: flex;
                      align-items: center;
                    }
                    .react-calendar__navigation button {
                      background: none;
                      font-size: 16px;
                      font-weight: 600;
                      color: #1f2937;
                      border-radius: 8px;
                      min-width: 40px;
                    }
                    .react-calendar__navigation button:hover {
                      background-color: #f3f4f6;
                    }
                    .react-calendar__month-view__weekdays {
                      text-transform: uppercase;
                      font-weight: bold;
                      font-size: 12px;
                      color: #6b7280;
                      border-bottom: 2px solid #e5e7eb;
                      padding-bottom: 8px;
                      margin-bottom: 8px;
                    }
                    .react-calendar__tile {
                      height: 72px;
                      display: flex;
                      flex-direction: column;
                      justify-content: flex-start;
                      align-items: center;
                      padding: 8px 4px;
                      font-size: 15px;
                      border-radius: 8px;
                    }
                    .react-calendar__tile:hover {
                      background-color: #f3f4f6;
                    }
                    .react-calendar__tile--now {
                      background: #dbeafe;
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
                    .react-calendar__tile.is-selected-practice {
                      background: #2563eb !important;
                      color: white !important;
                    }
                    .react-calendar__tile.is-selected-practice span {
                      color: white !important;
                    }
                    @media (max-width: 768px) {
                      .react-calendar__tile {
                        height: 56px;
                        font-size: 13px;
                      }
                    }
                  `}</style>
                  <Calendar
                    onChange={(value) => {
                      if (value instanceof Date) {
                        handleDateSelect(value);
                      }
                    }}
                    value={selectedDate ?? calendarDate}
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
                    prevAriaLabel="Previous month"
                    nextAriaLabel="Next month"
                    navigationAriaLabel="Practice calendar month"
                    prev2Label={null}
                    next2Label={null}
                  />
                </motion.div>

                {/* Practice list — right half */}
                <motion.div
                  initial={false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 flex flex-col"
                >
                  <div className="mb-4">
                    <h2 className="text-2xl font-sport text-dark-steel flex items-center gap-2">
                      <FaHockeyPuck className="text-steel-blue" />
                      Upcoming Practices
                    </h2>
                    <p className="text-gray-600 text-sm mt-1">
                      Select a date to see full session details
                    </p>
                  </div>

                  <div className="space-y-3 flex-1">
                    {sortedPractices.map((practice, index) => {
                      const practiceDate = new Date(practice.effective_from + 'T00:00:00');
                      const dateInfo = formatDateShort(practice.effective_from);
                      const isSelected =
                        selectedDate && isSameDay(practiceDate, selectedDate);

                      return (
                        <button
                          key={practice.id}
                          type="button"
                          onClick={() => handleDateSelect(practiceDate)}
                          className={`w-full text-left rounded-xl border-2 transition-all duration-200 overflow-hidden group ${
                            isSelected
                              ? 'border-steel-blue ring-4 ring-steel-blue/20 shadow-md'
                              : 'border-gray-200 hover:border-steel-blue/50 hover:shadow-sm'
                          }`}
                        >
                          <div className="flex items-stretch">
                            <div
                              className={`p-4 text-center w-20 flex-shrink-0 ${
                                isSelected
                                  ? 'bg-steel-blue text-white'
                                  : 'bg-gradient-to-br from-ice-blue to-steel-blue text-white'
                              }`}
                            >
                              <div className="text-2xl font-bold leading-none">{dateInfo.day}</div>
                              <div className="text-xs font-semibold uppercase mt-1">{dateInfo.month}</div>
                            </div>
                            <div className="flex-1 p-4">
                              <p className="font-bold text-dark-steel group-hover:text-steel-blue transition-colors">
                                {practice.description || 'Team Practice'}
                              </p>
                              <p className="text-sm text-gray-500 mt-0.5">{dateInfo.weekday}</p>
                              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-600">
                                <span className="flex items-center gap-1.5">
                                  <FaClock className="text-steel-blue text-xs" />
                                  {formatTime(practice.start_time)} – {formatTime(practice.end_time)}
                                </span>
                                {practice.location && (
                                  <span className="flex items-center gap-1.5">
                                    <FaMapMarkerAlt className="text-steel-blue text-xs" />
                                    {practice.location}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {practices[0]?.season && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <span className="inline-block px-3 py-1 bg-steel-blue/10 text-steel-blue text-sm font-semibold rounded-full">
                        {practices[0].season}
                      </span>
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Selected practice details */}
              {selectedPractice && selectedDate && (
                <motion.div
                  key={selectedPractice.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-8 bg-white rounded-xl shadow-lg p-8 border-2 border-steel-blue"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6 pb-6 border-b border-gray-200">
                    <div>
                      <h3 className="text-3xl font-sport text-steel-blue mb-1">
                        {selectedPractice.description || 'Practice Session'}
                      </h3>
                      <p className="text-xl text-gray-700 font-semibold">
                        {formatDate(selectedPractice.effective_from)}
                      </p>
                    </div>
                    <span className="self-start px-4 py-2 bg-steel-blue text-white rounded-full text-sm font-bold uppercase">
                      {selectedPractice.team_type}
                    </span>
                  </div>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-ice-blue/30 rounded-lg">
                        <FaClock className="text-steel-blue text-xl" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Time</p>
                        <p className="font-semibold text-dark-steel">
                          {formatTime(selectedPractice.start_time)} – {formatTime(selectedPractice.end_time)}
                        </p>
                      </div>
                    </div>

                    {selectedPractice.location && (
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-ice-blue/30 rounded-lg">
                          <FaMapMarkerAlt className="text-steel-blue text-xl" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Location</p>
                          <p className="font-semibold text-dark-steel">{selectedPractice.location}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-ice-blue/30 rounded-lg">
                        <FaUsers className="text-steel-blue text-xl" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Team</p>
                        <p className="font-semibold text-dark-steel capitalize">{selectedPractice.team_type}</p>
                      </div>
                    </div>
                  </div>

                  {selectedPractice.notes && (
                    <p className="mt-6 pt-6 border-t border-gray-200 text-gray-600 italic">
                      {selectedPractice.notes}
                    </p>
                  )}
                </motion.div>
              )}
            </>
          )}

          {/* Location Info */}
          <motion.div
            initial={false}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
            className="mt-12 bg-gradient-to-r from-steel-blue to-dark-steel rounded-xl p-8 text-center shadow-xl"
          >
            <h3 className="text-2xl font-sport text-white mb-4">Practice Location</h3>
            <p className="text-xl text-white mb-2 font-semibold">Flyers Skate Zone</p>
            <p className="text-ice-blue mb-6">601 Laurel Oak Rd, Voorhees, NJ 08043</p>
            <a
              href="https://www.google.com/maps/dir/?api=1&destination=Flyers+Skate+Zone+601+Laurel+Oak+Rd+Voorhees+NJ+08043"
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
            initial={false}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mt-12 text-center bg-white rounded-xl p-8 shadow-lg"
          >
            <h3 className="text-2xl font-bold text-dark-steel mb-4">Ready to Join?</h3>
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
