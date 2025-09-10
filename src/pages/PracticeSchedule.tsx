import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUsers, FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

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

  const practiceGroups = groupPracticesByPeriod();

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark-steel to-black pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back to Home Link */}
        <Link 
          to="/"
          className="inline-flex items-center gap-2 text-ice-blue hover:text-white transition-colors mb-8"
        >
          <FaArrowLeft />
          <span>Back to Home</span>
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-sport text-white mb-4">
            Practice Schedule
          </h1>
          <p className="text-xl text-ice-blue">
            All upcoming practice sessions for Wings of Steel
          </p>
        </motion.div>

        {/* Practice Schedule */}
        {loading ? (
          <div className="text-center text-white">Loading practice schedule...</div>
        ) : practiceGroups.length === 0 ? (
          <div className="text-center text-gray-400">No practices currently scheduled</div>
        ) : (
          <div className="space-y-12">
            {practiceGroups.map((group, groupIndex) => (
              <motion.div
                key={`${group.from}_${group.to}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: groupIndex * 0.1 }}
                className="bg-dark-steel/50 backdrop-blur-sm rounded-lg p-8 border border-steel-blue/30"
              >
                {/* Period Header */}
                <div className="mb-6 pb-4 border-b border-steel-blue/30">
                  <h2 className="text-2xl font-sport text-championship-gold mb-2">
                    Practice Period
                  </h2>
                  <p className="text-ice-blue">
                    {formatDate(group.from)} - {formatDate(group.to)}
                  </p>
                </div>

                {/* Practice Sessions */}
                <div className="grid md:grid-cols-2 gap-6">
                  {group.sessions.map((practice) => (
                    <div
                      key={practice.id}
                      className="bg-black/30 rounded-lg p-6 border border-steel-blue/20 hover:border-ice-blue/50 transition-all"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-xl font-bold text-white">
                          {practice.day_of_week}
                        </h3>
                        <span className="px-3 py-1 bg-steel-blue/30 text-ice-blue rounded-full text-sm">
                          {practice.team_type}
                        </span>
                      </div>

                      <div className="space-y-3 text-gray-300">
                        <div className="flex items-center gap-3">
                          <FaClock className="text-ice-blue" />
                          <span>{formatTime(practice.start_time)} - {formatTime(practice.end_time)}</span>
                        </div>

                        {practice.location && (
                          <div className="flex items-center gap-3">
                            <FaMapMarkerAlt className="text-ice-blue" />
                            <span>{practice.location}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-3">
                          <FaUsers className="text-ice-blue" />
                          <span>Team: {practice.team_type}</span>
                        </div>

                        {practice.notes && (
                          <div className="mt-4 pt-4 border-t border-steel-blue/20">
                            <p className="text-sm italic">{practice.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Location Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12 bg-steel-blue/20 rounded-lg p-8 text-center"
        >
          <h3 className="text-2xl font-sport text-championship-gold mb-4">
            Practice Location
          </h3>
          <p className="text-xl text-white mb-2">Grundy Ice Arena</p>
          <p className="text-ice-blue mb-4">
            1001 South Broad St, Bristol, PA 19047
          </p>
          <a
            href="https://www.google.com/maps/dir/?api=1&destination=Grundy+Ice+Arena+1001+South+Broad+St+Bristol+PA+19047"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-steel-blue text-white rounded-full hover:bg-steel-blue/80 transition-all duration-200"
          >
            <FaMapMarkerAlt />
            Get Directions
          </a>
        </motion.div>
      </div>
    </div>
  );
};

export default PracticeSchedule;