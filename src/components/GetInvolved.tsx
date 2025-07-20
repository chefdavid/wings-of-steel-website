import { motion } from 'framer-motion';
import { FaDonate, FaHandHoldingHeart, FaEnvelope, FaHockeyPuck, FaMapMarkerAlt } from 'react-icons/fa';

const GetInvolved = () => {
  const donationOptions = [
    { amount: "$5", frequency: "Weekly", impact: "Helps provide equipment maintenance" },
    { amount: "$10", frequency: "Weekly", impact: "Supports ice time and practice sessions" },
    { amount: "$25", frequency: "Monthly", impact: "Covers tournament entry fees" },
    { amount: "$50", frequency: "Monthly", impact: "Provides new equipment for players" }
  ];

  return (
    <section id="get-involved" className="py-20 bg-dark-steel text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-sport mb-4">
            Get Involved
          </h2>
          <div className="w-24 h-1 bg-steel-blue mx-auto mb-8"></div>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Your support makes it possible for every child to play. 100% of donations 
            go directly to supporting our players and programs.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-6">
              <FaDonate className="text-3xl text-steel-blue" />
              <h3 className="text-2xl font-bold">Make a Donation</h3>
            </div>
            
            <div className="space-y-4">
              {donationOptions.map((option, index) => (
                <motion.div
                  key={index}
                  whileHover={{ x: 10 }}
                  className="bg-steel-gray/30 backdrop-blur-sm rounded-lg p-4 border border-steel-blue/30 hover:border-steel-blue transition-colors duration-300"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-2xl font-bold text-steel-blue">
                        {option.amount}
                      </span>
                      <span className="text-gray-400 ml-2">/{option.frequency}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-300 mt-2">{option.impact}</p>
                </motion.div>
              ))}
            </div>

            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="#donate"
              className="inline-block w-full bg-steel-blue text-white px-8 py-4 rounded-full font-medium text-center mt-6 hover:bg-blue-600 transition-colors duration-300"
            >
              Donate Now
            </motion.a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-6">
              <FaHandHoldingHeart className="text-3xl text-steel-blue" />
              <h3 className="text-2xl font-bold">Volunteer With Us</h3>
            </div>
            
            <div className="bg-steel-gray/30 backdrop-blur-sm rounded-lg p-6 border border-steel-blue/30">
              <p className="text-gray-300 mb-6">
                We're always looking for dedicated volunteers to help with:
              </p>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start">
                  <span className="text-steel-blue mr-2">•</span>
                  On-ice coaching and player assistance
                </li>
                <li className="flex items-start">
                  <span className="text-steel-blue mr-2">•</span>
                  Equipment management and maintenance
                </li>
                <li className="flex items-start">
                  <span className="text-steel-blue mr-2">•</span>
                  Event planning and fundraising
                </li>
                <li className="flex items-start">
                  <span className="text-steel-blue mr-2">•</span>
                  Transportation and logistics support
                </li>
                <li className="flex items-start">
                  <span className="text-steel-blue mr-2">•</span>
                  Marketing and community outreach
                </li>
              </ul>
              
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="#contact"
                className="inline-block w-full bg-transparent border-2 border-steel-blue text-steel-blue px-8 py-4 rounded-full font-medium text-center mt-6 hover:bg-steel-blue hover:text-white transition-all duration-300"
              >
                Contact Us to Volunteer
              </motion.a>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-steel-blue to-blue-600 rounded-2xl p-8 mb-12"
        >
          <div className="max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold text-center mb-8">
              Join the Wings of Steel Team!
            </h3>
            
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <FaHockeyPuck className="text-ice-blue" />
                  Try Sled Hockey Today
                </h4>
                <p className="mb-4">
                  Interested in joining our championship team? Come to a practice and try it out! 
                  We provide all equipment and on-ice support. No experience necessary.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <span className="text-ice-blue mr-2">•</span>
                    Open to all youth with disabilities
                  </li>
                  <li className="flex items-start">
                    <span className="text-ice-blue mr-2">•</span>
                    Equipment provided at no cost
                  </li>
                  <li className="flex items-start">
                    <span className="text-ice-blue mr-2">•</span>
                    Experienced coaches and volunteers
                  </li>
                  <li className="flex items-start">
                    <span className="text-ice-blue mr-2">•</span>
                    No child pays to play - ever!
                  </li>
                </ul>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <h4 className="text-xl font-bold mb-4">Practice Information</h4>
                <p className="mb-4">
                  Join us at our home rink in Voorhees, NJ. Contact us to schedule your 
                  first visit and meet our amazing team!
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FaMapMarkerAlt className="text-ice-blue" />
                    <span>601 Laurel Oak Road, Voorhees, NJ</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaEnvelope className="text-ice-blue" />
                    <span>info@WingsofSteel.org</span>
                  </div>
                </div>
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href="#contact"
                  className="inline-block w-full bg-white text-steel-blue px-6 py-3 rounded-full font-medium text-center mt-4 hover:bg-gray-100 transition-colors duration-300"
                >
                  Contact Us to Visit
                </motion.a>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-8 text-center"
        >
          <h3 className="text-2xl font-bold mb-4">
            Join Our Mailing List
          </h3>
          <p className="mb-6">
            Stay updated on team news, upcoming games, and special events
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-steel-blue text-white px-8 py-3 rounded-full font-medium hover:bg-blue-600 transition-colors duration-300"
            >
              Subscribe
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default GetInvolved;