import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMapMarkerAlt, FaClock, FaParking, FaDirections, FaTimes, FaPhone, FaGlobe, FaHockeyPuck, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { supabase } from '../lib/supabaseClient';
import { formatPhoneDisplay } from '../utils/phoneUtils';
import type { PracticeSchedule } from '../types/practice-schedule';

const Location = () => {
  const [locationData, setLocationData] = useState<any>(null);
  const [practiceSchedules, setPracticeSchedules] = useState<PracticeSchedule[]>([]);
  const [loadingSchedule, setLoadingSchedule] = useState(true);
  const [showRinkModal, setShowRinkModal] = useState(false);
  const [showAllPractices, setShowAllPractices] = useState(false);

  useEffect(() => {
    fetchLocationData();
    fetchPracticeSchedule();
  }, []);

  const fetchLocationData = async () => {
    try {
      const { data, error } = await supabase
        .from('site_sections')
        .select('*')
        .eq('section_key', 'location')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching location data:', error);
      }

      if (data) {
        setLocationData(data.content);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      // Loading complete
    }
  };

  const fetchPracticeSchedule = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('practice_schedules')
        .select('*')
        .eq('is_active', true)
        .gte('practice_date', today)
        .order('practice_date')
        .order('start_time')
        .limit(10);

      if (error) {
        console.error('Error fetching practice schedule:', error);
      } else {
        setPracticeSchedules(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoadingSchedule(false);
    }
  };

  // Default data with CMS fallbacks
  const rinkInfo = {
    name: locationData?.rink_name || "Flyers Skate Zone",
    address: locationData?.address || "601 Laurel Oak Rd, Voorhees Township, NJ 08043",
    phone: locationData?.phone || "(856) 751-9161",
    website: locationData?.website || "https://flyersskatezone.com/",
    googleMapsUrl: locationData?.google_maps_url || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12185.776868620458!2d-75.04284768459386!3d39.84582267943893!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c6dd4c3b1c1c3b%3A0x8e8e8e8e8e8e8e8e!2s601%20Laurel%20Oak%20Rd%2C%20Voorhees%20Township%2C%20NJ%2008043!5e0!3m2!1sen!2sus!4v1643000000000!5m2!1sen!2sus"
  };

  // Format time for display
  const formatTime = (time: string) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Group schedules by day - commented out as not currently used
  // const groupedSchedules = practiceSchedules.reduce((acc, schedule) => {
  //   if (!acc[schedule.day_of_week]) {
  //     acc[schedule.day_of_week] = [];
  //   }
  //   acc[schedule.day_of_week].push(schedule);
  //   return acc;
  // }, {} as Record<string, PracticeSchedule[]>);

  // Get team type label
  const getTeamTypeLabel = (type?: string) => {
    const labels: Record<string, string> = {
      'all': 'All Teams',
      'youth': 'Youth Team',
      'mites': 'Mites (8U)',
      'squirts': 'Squirts (10U)',
      'peewees': 'Peewees (12U)',
      'bantams': 'Bantams (14U)',
      'midgets': 'Midgets (16U)',
      'juniors': 'Juniors (18U)',
      'beginners': 'Learn to Play',
      'adult': 'Adult Team'
    };
    return labels[type || ''] || type || 'Team Practice';
  };

  const rinkFeatures = [
    {
      icon: <FaParking className="text-2xl text-steel-blue" />,
      title: "Free Parking",
      description: "Ample parking available for families and equipment"
    },
    {
      icon: <FaClock className="text-2xl text-steel-blue" />,
      title: "Accessible Hours",
      description: "Multiple practice times throughout the week"
    },
    {
      icon: <FaMapMarkerAlt className="text-2xl text-steel-blue" />,
      title: "Central Location",
      description: "Easy access from major highways in South Jersey"
    }
  ];

  return (
    <section id="location" className="py-12 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-8 md:mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-sport text-dark-steel mb-3 md:mb-4">
            {locationData?.title || 'Find Us on the Ice'}
          </h2>
          <div className="w-16 md:w-24 h-1 bg-steel-blue mx-auto mb-4 md:mb-8"></div>
          <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto px-2">
            {locationData?.description || 'Join us at our home rink in Voorhees, NJ. Come watch a practice or game, and see what Wings of Steel sled hockey is all about!'}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 mb-8 md:mb-16">
          {/* Google Maps Embed */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-gray-100 rounded-xl overflow-hidden shadow-lg h-64 md:h-96 lg:h-[500px]">
              <iframe
                src={rinkInfo.googleMapsUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Wings of Steel Practice Location"
              ></iframe>
            </div>
            
            {/* Map Overlay with Quick Info */}
            <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 md:p-4 shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <FaMapMarkerAlt className="text-steel-blue flex-shrink-0" />
                <h3 className="font-bold text-sm md:text-base text-dark-steel">{rinkInfo.name}</h3>
              </div>
              <p className="text-xs md:text-sm text-gray-600 mb-2">{rinkInfo.address}</p>
              <div className="flex gap-2">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(rinkInfo.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 bg-steel-blue text-white px-3 py-1.5 rounded-md text-xs md:text-sm font-medium hover:bg-dark-steel transition-colors"
                >
                  <FaDirections />
                  Directions
                </a>
                <a
                  href={rinkInfo.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 bg-gray-200 text-dark-steel px-3 py-1.5 rounded-md text-xs md:text-sm font-medium hover:bg-gray-300 transition-colors"
                >
                  Visit Website
                </a>
              </div>
            </div>
          </motion.div>

          {/* Rink Information */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-6 md:space-y-8"
          >
            {/* Practice Schedule */}
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-dark-steel mb-2 flex items-center gap-2">
                <FaClock className="text-steel-blue" />
                Upcoming Practices
              </h3>
              <p className="text-sm text-gray-600 italic mb-4">
                * Schedule subject to change. Please check back regularly for updates.
              </p>
              {loadingSchedule ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-steel-blue"></div>
                </div>
              ) : practiceSchedules.length > 0 ? (
                <>
                  <div className="space-y-4">
                    {practiceSchedules.slice(0, showAllPractices ? practiceSchedules.length : 5).map((session, index) => {
                      const practiceDate = new Date(session.practice_date + 'T00:00:00');
                      const dateInfo = {
                        day: practiceDate.getDate(),
                        month: practiceDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
                        weekday: practiceDate.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
                        fullDate: practiceDate.toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })
                      };
                      
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.05 }}
                          className="group"
                        >
                          <div className="relative bg-gradient-to-r from-white to-gray-50 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
                            {/* Background Hockey Puck */}
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
                              <FaHockeyPuck className="text-[80px] text-steel-blue transform -rotate-12" />
                            </div>
                            
                            <div className="relative flex items-stretch">
                              {/* Date Block */}
                              <div className="bg-gradient-to-br from-ice-blue to-steel-blue p-4 md:p-5 text-white text-center w-20 md:w-24 rounded-l-xl">
                                <div className="text-2xl md:text-3xl font-bold">{dateInfo.day}</div>
                                <div className="text-xs md:text-sm font-semibold uppercase tracking-wide">{dateInfo.month}</div>
                                <div className="text-xs opacity-90 mt-1">{dateInfo.weekday}</div>
                              </div>
                              
                              {/* Practice Details */}
                              <div className="flex-1 p-4 md:p-5 relative">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                  <div className="flex-1">
                                    <h4 className="text-base md:text-lg font-bold text-dark-steel mb-1 group-hover:text-steel-blue transition-colors">
                                      {session.description || getTeamTypeLabel(session.team_type)}
                                    </h4>
                                    
                                    <div className="flex flex-wrap items-center gap-3 text-sm">
                                      <div className="flex items-center gap-1.5 bg-gray-100 px-2.5 py-1 rounded-full">
                                        <FaClock className="text-steel-blue text-xs" />
                                        <span className="font-medium text-gray-700">
                                          {formatTime(session.start_time)} - {formatTime(session.end_time)}
                                        </span>
                                      </div>
                                      {session.rink && (
                                        <button
                                          onClick={(e) => {
                                            e.preventDefault();
                                            setShowRinkModal(true);
                                          }}
                                          className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-full transition-colors"
                                        >
                                          <FaMapMarkerAlt className="text-steel-blue text-xs" />
                                          <span className="text-blue-700 font-medium hover:underline text-xs">
                                            {session.location} - {session.rink}
                                          </span>
                                        </button>
                                      )}
                                    </div>
                                    
                                    {session.season && index === 0 && (
                                      <div className="mt-2">
                                        <span className="inline-block px-2.5 py-0.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-semibold rounded-full">
                                          {session.season}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                  
                  {/* Show More/Less Button */}
                  {practiceSchedules.length > 5 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="mt-6 text-center"
                    >
                      <button
                        onClick={() => setShowAllPractices(!showAllPractices)}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-steel-blue to-dark-steel text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
                      >
                        {showAllPractices ? (
                          <>
                            <FaChevronUp />
                            Show Less
                          </>
                        ) : (
                          <>
                            <FaChevronDown />
                            Show All {practiceSchedules.length} Practices
                          </>
                        )}
                      </button>
                    </motion.div>
                  )}
                  
                  {/* Info Box */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-300 rounded-xl"
                  >
                    <p className="text-sm text-yellow-900 font-semibold mb-1">
                      🏒 New players welcome!
                    </p>
                    <p className="text-xs text-yellow-800">
                      Contact us to schedule a trial session. Check schedule for practice times.
                    </p>
                    <p className="text-xs text-yellow-700 mt-2 italic">
                      * Schedule subject to change. Please check back regularly for updates.
                    </p>
                  </motion.div>
                </>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-xl">
                  <FaHockeyPuck className="text-4xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">Practice schedule coming soon!</p>
                  <p className="text-sm text-gray-400 mt-2">Check back later or contact us for details.</p>
                </div>
              )}
            </div>

            {/* Rink Features */}
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-dark-steel mb-4">
                Rink Features
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {rinkFeatures.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-start gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex-shrink-0">{feature.icon}</div>
                    <div>
                      <h4 className="font-semibold text-sm md:text-base text-dark-steel mb-1">
                        {feature.title}
                      </h4>
                      <p className="text-xs md:text-sm text-gray-600">{feature.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-gradient-to-r from-steel-blue to-dark-steel rounded-lg p-4 md:p-6 text-white">
              <h3 className="text-lg md:text-xl font-bold mb-3">Visit Us</h3>
              <div className="space-y-2">
                <p className="text-sm md:text-base">
                  <strong>{rinkInfo.name}</strong>
                </p>
                <p className="text-sm md:text-base opacity-90">{rinkInfo.address}</p>
                <p className="text-sm md:text-base opacity-90">Phone: {formatPhoneDisplay(rinkInfo.phone)}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center bg-gray-50 rounded-xl p-6 md:p-8"
        >
          <h3 className="text-xl md:text-2xl font-bold text-dark-steel mb-3 md:mb-4">
            Ready to Visit?
          </h3>
          <p className="text-base md:text-lg text-gray-600 mb-4 md:mb-6 max-w-2xl mx-auto">
            Come see Wings of Steel in action! Spectators are always welcome at our practices and games. 
            Contact us to learn about upcoming events and how you can get involved.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="#get-involved"
              className="bg-steel-blue text-white px-6 py-3 md:px-8 md:py-4 rounded-lg font-bold text-sm md:text-base hover:bg-dark-steel transition-colors shadow-lg flex items-center justify-center gap-2"
            >
              <FaMapMarkerAlt />
              Contact Us
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(rinkInfo.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-steel-blue border-2 border-steel-blue px-6 py-3 md:px-8 md:py-4 rounded-lg font-bold text-sm md:text-base hover:bg-gray-50 transition-colors shadow-lg flex items-center justify-center gap-2"
            >
              <FaDirections />
              Get Directions
            </motion.a>
          </div>
        </motion.div>
      </div>

      {/* Rink Details Modal */}
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

export default Location;