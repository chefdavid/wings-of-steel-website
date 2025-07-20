import { motion } from 'framer-motion';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt } from 'react-icons/fa';

const Schedule = () => {
  const upcomingMatches = [
    {
      date: "September 22, 2024",
      time: "2:40 PM",
      opponent: "Hammerheads",
      location: "Skate Zone NE",
      home: false
    },
    {
      date: "October 5, 2024",
      time: "6:00 PM",
      opponent: "Bennett",
      location: "Ice World",
      home: false
    },
    {
      date: "November 2, 2024",
      time: "3:10 PM",
      opponent: "Vineland",
      location: "Hollydell Ice Arena",
      home: false
    }
  ];

  return (
    <section id="schedule" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-sport text-dark-steel mb-4">
            Upcoming Matches
          </h2>
          <div className="w-24 h-1 bg-steel-blue mx-auto mb-8"></div>
          <p className="text-lg text-gray-700">
            Come support the Wings of Steel at our upcoming games!
          </p>
        </motion.div>

        <div className="grid gap-6 max-w-4xl mx-auto">
          {upcomingMatches.map((match, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex flex-col md:flex-row">
                <div className="bg-gradient-to-r from-steel-blue to-dark-steel p-6 md:p-8 text-white md:w-1/3">
                  <div className="flex items-center gap-2 mb-2">
                    <FaCalendarAlt className="text-ice-blue" />
                    <span className="font-medium">{match.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaClock className="text-ice-blue" />
                    <span className="text-2xl font-bold">{match.time}</span>
                  </div>
                </div>
                
                <div className="p-6 md:p-8 flex-1">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="mb-4 md:mb-0">
                      <div className="text-sm text-gray-600 mb-1">
                        {match.home ? 'HOME' : 'AWAY'}
                      </div>
                      <h3 className="text-2xl font-bold text-dark-steel">
                        Wings of Steel vs {match.opponent}
                      </h3>
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-700">
                      <FaMapMarkerAlt className="text-steel-blue" />
                      <span className="font-medium">{match.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-gray-600 mb-6">
            All games are free to attend. Come cheer on our amazing athletes!
          </p>
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href="#contact"
            className="inline-block bg-steel-blue text-white px-8 py-4 rounded-full font-medium hover:bg-blue-600 transition-colors duration-300"
          >
            Get Directions
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
};

export default Schedule;