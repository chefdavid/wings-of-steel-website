import { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FaClock, FaMapMarkerAlt, FaUsers, FaHockeyPuck, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { supabase } from '../lib/supabaseClient';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useCurrentSeason } from '../hooks';

interface ScheduledGame {
  id: string;
  game_date: string;
  game_time: string;
  opponent: string | null;
  location: string | null;
  home_away: string | null;
  game_type?: string | null;
  notes?: string | null;
}

/** Everything happening on one calendar day. */
interface DaySchedule {
  practices: PracticeSession[];
  games: ScheduledGame[];
}

interface PracticeSession {
  id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  team_type: string;
  location?: string;
  rink?: string;
  description?: string;
  notes?: string;
  is_active: boolean;
  effective_from: string;
  effective_to: string;
  day_order: number;
}

/**
 * A Date rendered as YYYY-MM-DD in the *local* timezone.
 *
 * `date.toISOString().split('T')[0]` converts to UTC first, so a local midnight
 * in America/New_York comes back as the previous day. react-calendar hands us
 * local midnights, so using toISOString here made clicking a practice date look
 * up the day before and silently find nothing.
 */
const toLocalDateString = (date: Date) => {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
};

const PracticeSchedule = () => {
  const { season, loading: seasonLoading } = useCurrentSeason();
  const [practices, setPractices] = useState<PracticeSession[]>([]);
  const [games, setGames] = useState<ScheduledGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const practiceRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    // Wait for the season before querying, so the first render cannot flash
    // last season's practices before the filter arrives.
    if (seasonLoading) return;
    fetchPractices();
    fetchGames();
  }, [seasonLoading, season]);

  const fetchPractices = async () => {
    try {
      const today = toLocalDateString(new Date());

      let query = supabase
        .from('practice_schedules')
        .select('*')
        .eq('is_active', true)
        .gte('effective_to', today);

      // Seasons run September -> August. Without this, next August's page would
      // show the tail of the old season next to the start of the new one.
      if (season) {
        query = query.gte('effective_from', season.start_date).lte('effective_from', season.end_date);
      }

      const { data, error } = await query
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

  // Games share the calendar with practices - "something scheduled" means
  // either one, and a family looking at the month needs to see both.
  const fetchGames = async () => {
    try {
      let query = supabase
        .from('game_schedules')
        .select('id, game_date, game_time, opponent, location, home_away, game_type, notes');

      if (season) {
        query = query.gte('game_date', season.start_date).lte('game_date', season.end_date);
      }

      const { data, error } = await query.order('game_date').order('game_time');

      if (error) throw error;
      setGames(data || []);
    } catch (error) {
      console.error('Error fetching games:', error);
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

  /**
   * Compact time for a calendar chip: "6:10p", "4:00p", "9:00a".
   * Minutes are always shown - "4p" reads as an approximation, and an ice slot
   * that starts at 4:00 sharp should not look like one.
   */
  const shortTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const suffix = hour >= 12 ? 'p' : 'a';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes}${suffix}`;
  };

  /** Every YYYY-MM-DD a practice row covers. */
  const datesForPractice = (practice: PracticeSession): string[] => {
    const from = practice.effective_from;
    const to = practice.effective_to;
    if (!from) return [];

    // The normal case since the 2026-27 import: one row is one session.
    if (!to || from === to) return [from];

    // Legacy rows described a recurring weekday across a date range.
    const dayMap: { [key: string]: number } = {
      Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3,
      Thursday: 4, Friday: 5, Saturday: 6
    };
    const targetDay = dayMap[practice.day_of_week];
    if (targetDay === undefined) return [from];

    const dates: string[] = [];
    const current = new Date(from + 'T00:00:00');
    const endDate = new Date(to + 'T00:00:00');
    while (current <= endDate) {
      if (current.getDay() === targetDay) dates.push(toLocalDateString(current));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  // One lookup keyed by YYYY-MM-DD holding everything on that day. Built once
  // per data change rather than rescanned for all 42 tiles of every month view.
  const scheduleByDate = useMemo(() => {
    const map = new Map<string, DaySchedule>();

    const entryFor = (date: string) => {
      let entry = map.get(date);
      if (!entry) {
        entry = { practices: [], games: [] };
        map.set(date, entry);
      }
      return entry;
    };

    practices.forEach(practice => {
      datesForPractice(practice).forEach(date => entryFor(date).practices.push(practice));
    });

    games.forEach(game => {
      if (game.game_date) entryFor(game.game_date).games.push(game);
    });

    map.forEach(entry => {
      entry.games.sort((a, b) => (a.game_time || '').localeCompare(b.game_time || ''));
      entry.practices.sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''));
    });

    return map;
  }, [practices, games]);

  const scheduleFor = (date: Date): DaySchedule | undefined => scheduleByDate.get(toLocalDateString(date));

  const selectedSchedule = selectedDate ? scheduleFor(selectedDate) : undefined;

  // Handle date click from calendar
  const handleDateClick = (date: Date) => {
    const entry = scheduleFor(date);
    if (!entry) return;

    setSelectedDate(date);

    // Scroll to the matching practice card further down the page, when there is
    // one. Game-only days are covered by the day detail panel instead.
    const practice = entry.practices[0];
    if (practice) {
      const key = `${practice.effective_from}_${practice.effective_to}`;
      practiceRefs.current[key]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Tile contents: a chip per scheduled item rather than an anonymous dot, so
  // the month view answers "what time and where" without a click.
  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return null;
    const entry = scheduleFor(date);
    if (!entry) return null;

    return (
      <div className="cal-entries">
        {entry.games.map(game => (
          <span
            key={game.id}
            className={`cal-chip ${game.home_away === 'home' ? 'cal-chip--home' : 'cal-chip--away'}`}
            title={`Game ${formatTime(game.game_time)} ${game.home_away === 'home' ? 'vs' : 'at'} ${game.opponent || 'TBD'} - ${game.location || ''}`}
          >
            <span className="cal-chip__head">
              <span className="cal-chip__time">{shortTime(game.game_time)}</span>
              <span className="cal-chip__type">Game</span>
            </span>
            <span className="cal-chip__label">
              {game.home_away === 'home' ? 'vs ' : '@ '}{game.opponent || 'TBD'}
            </span>
          </span>
        ))}
        {entry.practices.map(practice => (
          <span
            key={practice.id}
            className="cal-chip cal-chip--practice"
            title={`Practice ${formatTime(practice.start_time)} - ${formatTime(practice.end_time)}${practice.rink ? ` - ${practice.rink}` : ''}`}
          >
            <span className="cal-chip__head">
              <span className="cal-chip__time">{shortTime(practice.start_time)}</span>
              <span className="cal-chip__type">Practice</span>
            </span>
            {practice.rink && <span className="cal-chip__label">{practice.rink}</span>}
          </span>
        ))}
      </div>
    );
  };

  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return '';
    const entry = scheduleFor(date);
    if (!entry) return '';
    return entry.games.length > 0 ? 'has-scheduled has-game' : 'has-scheduled has-practice';
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
            <p className="text-gray-600">Games and practices for the season. Click any highlighted date for full details.</p>
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
                /* Tall enough for a date plus two detail chips. Chips are the
                   whole point of this calendar, so the tile sizes to them. */
                min-height: 118px;
                display: flex;
                flex-direction: column;
                justify-content: flex-start;
                align-items: stretch;
                padding: 6px 4px;
                font-size: 14px;
                position: relative;
                overflow: hidden;
              }
              .react-calendar__tile abbr {
                align-self: center;
                margin-bottom: 2px;
              }
              .cal-entries {
                display: flex;
                flex-direction: column;
                gap: 2px;
                width: 100%;
                overflow: hidden;
              }
              .cal-chip {
                display: flex;
                flex-direction: column;
                padding: 2px 4px;
                border-radius: 4px;
                font-size: 10px;
                line-height: 1.3;
                text-align: left;
                border-left: 3px solid transparent;
                overflow: hidden;
              }
              /* Time and type on the first line, the specifics underneath.
                 Every chip names itself "Game" or "Practice" so the month view
                 is readable without consulting the legend. */
              .cal-chip__head {
                display: flex;
                align-items: baseline;
                gap: 3px;
                white-space: nowrap;
                font-weight: 700;
              }
              .cal-chip__time { flex-shrink: 0; font-variant-numeric: tabular-nums; }
              .cal-chip__type {
                text-transform: uppercase;
                letter-spacing: 0.02em;
                font-size: 9px;
                opacity: 0.85;
                overflow: hidden;
                text-overflow: ellipsis;
              }
              .cal-chip__label {
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                font-weight: 500;
                opacity: 0.9;
              }
              /* Home games carry the team's gold; away games the steel blue;
                 practices a quieter tint so games read first. */
              .cal-chip--home {
                background: #fef3c7;
                color: #78350f;
                border-left-color: #f59e0b;
              }
              .cal-chip--away {
                background: #dbeafe;
                color: #1e3a8a;
                border-left-color: #2563eb;
              }
              .cal-chip--practice {
                background: #f1f5f9;
                color: #334155;
                border-left-color: #94a3b8;
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
              .react-calendar__tile.has-scheduled {
                cursor: pointer;
                font-weight: 600;
              }
              .react-calendar__tile.has-practice { color: #334155; }
              .react-calendar__tile.has-game { color: #1e40af; }
              .react-calendar__tile.has-scheduled:hover {
                background-color: #eff6ff;
              }
              @media (max-width: 768px) {
                .react-calendar__tile {
                  min-height: 84px;
                  font-size: 12px;
                  padding: 4px 2px;
                }
                .cal-chip {
                  font-size: 8px;
                  padding: 1px 2px;
                  border-left-width: 2px;
                }
                /* A phone tile is too narrow for time and type side by side,
                   so they stack. The opponent/rink detail drops entirely - it
                   is one tap away in the day panel. */
                .cal-chip__head { flex-direction: column; gap: 0; }
                .cal-chip__type { font-size: 7px; }
                .cal-chip__label { display: none; }
              }
            `}</style>
            <Calendar
              onChange={(value) => {
                if (value instanceof Date) {
                  handleDateClick(value);
                }
              }}
              // `value` is the user's selection and `activeStartDate` is the
              // month on screen. Passing the month as `value` made the 1st of
              // every month render as if it were selected.
              value={selectedDate}
              activeStartDate={calendarDate}
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

            {/* Legend - the chips are colour-coded, so say what the colours mean. */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-5 text-sm text-gray-600">
              <span className="flex items-center gap-2">
                <span className="inline-block w-3.5 h-3.5 rounded" style={{ background: '#fef3c7', borderLeft: '3px solid #f59e0b' }} />
                Home game
              </span>
              <span className="flex items-center gap-2">
                <span className="inline-block w-3.5 h-3.5 rounded" style={{ background: '#dbeafe', borderLeft: '3px solid #2563eb' }} />
                Away game
              </span>
              <span className="flex items-center gap-2">
                <span className="inline-block w-3.5 h-3.5 rounded" style={{ background: '#f1f5f9', borderLeft: '3px solid #94a3b8' }} />
                Practice
              </span>
              <span className="text-gray-400 hidden md:inline">Times shown on each date</span>
            </div>

            {/* Day detail panel. The chips are deliberately terse; this is where
                the full time, opponent, surface and address live. */}
            {selectedDate && selectedSchedule && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 bg-white border-2 border-steel-blue rounded-xl shadow-lg overflow-hidden"
              >
                <div className="flex items-center justify-between bg-steel-blue text-white px-5 py-3">
                  <h3 className="font-bold text-lg">{formatDate(toLocalDateString(selectedDate))}</h3>
                  <button
                    onClick={() => setSelectedDate(null)}
                    className="text-white/80 hover:text-white text-sm font-medium"
                    aria-label="Close day details"
                  >
                    Close
                  </button>
                </div>

                <div className="p-5 space-y-4">
                  {selectedSchedule.games.map(game => (
                    <div key={game.id} className="flex flex-col sm:flex-row sm:items-start gap-3">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold self-start ${
                        game.home_away === 'home' ? 'bg-yellow-400 text-black' : 'bg-steel-blue text-white'
                      }`}>
                        <FaHockeyPuck />
                        {game.home_away === 'home' ? 'HOME GAME' : 'AWAY GAME'}
                      </span>
                      <div className="flex-1">
                        <p className="font-bold text-dark-steel text-lg">
                          Wings of Steel vs {game.opponent || 'TBD'}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-gray-700 mt-1">
                          <span className="flex items-center gap-1.5">
                            <FaClock className="text-steel-blue" /> {formatTime(game.game_time)}
                          </span>
                          {game.location && (
                            <span className="flex items-center gap-1.5">
                              <FaMapMarkerAlt className="text-steel-blue" /> {game.location}
                            </span>
                          )}
                        </div>
                        {game.notes && <p className="text-sm text-gray-500 italic mt-1">{game.notes}</p>}
                      </div>
                    </div>
                  ))}

                  {selectedSchedule.practices.map(practice => (
                    <div key={practice.id} className="flex flex-col sm:flex-row sm:items-start gap-3">
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold self-start bg-gray-200 text-gray-800">
                        <FaUsers />
                        PRACTICE
                      </span>
                      <div className="flex-1">
                        <p className="font-bold text-dark-steel text-lg">
                          {practice.description || 'Team Practice'}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-gray-700 mt-1">
                          <span className="flex items-center gap-1.5">
                            <FaClock className="text-steel-blue" />
                            {formatTime(practice.start_time)} - {formatTime(practice.end_time)}
                          </span>
                          {practice.location && (
                            <span className="flex items-center gap-1.5">
                              <FaMapMarkerAlt className="text-steel-blue" />
                              {practice.rink ? `${practice.location} - ${practice.rink}` : practice.location}
                            </span>
                          )}
                        </div>
                        {practice.notes && <p className="text-sm text-gray-500 italic mt-1">{practice.notes}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
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
                const isSelected = selectedSchedule?.practices[0]?.effective_from === group.from;
                
                return (
                  <motion.div
                    key={key}
                    ref={el => { practiceRefs.current[key] = el; }}
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
                        {group.from === group.to ? 'Practice' : 'Practice Period'}
                      </h3>
                      <p className="text-xl font-semibold text-gray-700">
                        {/* Each practice is a single day, so from === to. Older
                            rows used a real range, hence both forms. */}
                        {group.from === group.to
                          ? formatDate(group.from)
                          : `${formatDate(group.from)} - ${formatDate(group.to)}`}
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
                                <span className="text-lg font-semibold">
                                  {/* The rink is the ice surface inside the
                                      complex - Rink #3, Phantoms Ice, Flyers Ice
                                      Rink. Families need it to find the right sheet. */}
                                  {practice.rink ? `${practice.location} - ${practice.rink}` : practice.location}
                                </span>
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