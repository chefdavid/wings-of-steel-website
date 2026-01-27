import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaDonate, FaHandHoldingHeart, FaEnvelope, FaHockeyPuck, FaMapMarkerAlt } from 'react-icons/fa';
import { supabase } from '../lib/supabaseClient';
import ContactForms from './ContactForms';
import { useDonationModal } from '../contexts/DonationModalContext';

const GetInvolved = () => {
  const [getInvolvedData, setGetInvolvedData] = useState<any>(null);
  const { openModal } = useDonationModal();

  useEffect(() => {
    fetchGetInvolvedData();
  }, []);

  const fetchGetInvolvedData = async () => {
    try {
      const { data, error } = await supabase
        .from('site_sections')
        .select('*')
        .eq('section_key', 'get_involved')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching get involved data:', error);
      }

      if (data) {
        setGetInvolvedData(data.content);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      // Loading complete
    }
  };

  const donationOptions = getInvolvedData?.donation_options || [
    { amount: "$5", frequency: "Weekly", impact: "Helps provide equipment maintenance" },
    { amount: "$10", frequency: "Weekly", impact: "Supports ice time and practice sessions" },
    { amount: "$25", frequency: "Monthly", impact: "Covers tournament entry fees" },
    { amount: "$50", frequency: "Monthly", impact: "Provides new equipment for players" }
  ];

  return (
    <section id="get-involved" className="py-12 md:py-20 bg-dark-steel text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-8 md:mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-sport mb-3 md:mb-4">
            {getInvolvedData?.title || 'Get Involved'}
          </h2>
          <div className="w-16 md:w-24 h-1 bg-steel-blue mx-auto mb-4 md:mb-8"></div>
          <p className="text-base md:text-lg text-gray-300 max-w-3xl mx-auto px-2">
            {getInvolvedData?.description || 'Your support makes it possible for every child to play. 100% of donations go directly to supporting our players and programs.'}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 mb-8 md:mb-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-4 md:mb-6">
              <FaDonate className="text-2xl md:text-3xl text-steel-blue" />
              <h3 className="text-xl md:text-2xl font-bold">Make a Donation</h3>
            </div>
            
            <div className="space-y-4">
              {donationOptions.map((option: any, index: number) => {
                const numericAmount = typeof option.amount === 'string'
                  ? parseInt(option.amount.replace(/[^0-9]/g, ''), 10)
                  : option.amount;
                return (
                <motion.button
                  key={index}
                  whileHover={{ x: 10 }}
                  onClick={() => openModal(numericAmount)}
                  className="bg-steel-gray/30 backdrop-blur-sm rounded-lg p-3 md:p-4 border border-steel-blue/30 hover:border-steel-blue transition-colors duration-300 text-left w-full cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xl md:text-2xl font-bold text-steel-blue">
                        {option.amount}
                      </span>
                      <span className="text-gray-400 ml-2">/{option.frequency}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-300 mt-2">{option.impact}</p>
                </motion.button>
                );
              })}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => openModal()}
              className="inline-block w-full bg-steel-blue text-white px-8 py-4 rounded-full font-medium text-center mt-6 hover:bg-blue-600 transition-colors duration-300"
            >
              Donate Now
            </motion.button>
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
          className="bg-gray-900 border border-steel-blue/40 rounded-2xl p-8 mb-12"
        >
          <div className="max-w-4xl mx-auto">
            <h3 className="text-4xl font-sport text-center mb-8 text-white py-4">
              JOIN OUR TEAM
            </h3>
            
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="bg-black/50 border border-steel-blue/50 rounded-lg p-6">
                <h4 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
                  <FaHockeyPuck className="text-steel-blue" />
                  Try Sled Hockey Today
                </h4>
                <p className="mb-4 text-gray-200">
                  Interested in joining our championship team? Come to a practice and try it out! 
                  We provide all equipment and on-ice support. No experience necessary.
                </p>
                <ul className="space-y-2 text-sm text-gray-200">
                  <li className="flex items-start">
                    <span className="text-steel-blue mr-2 font-bold">•</span>
                    Open to all youth with disabilities
                  </li>
                  <li className="flex items-start">
                    <span className="text-steel-blue mr-2 font-bold">•</span>
                    Equipment provided at no cost
                  </li>
                  <li className="flex items-start">
                    <span className="text-steel-blue mr-2 font-bold">•</span>
                    Experienced coaches and volunteers
                  </li>
                  <li className="flex items-start">
                    <span className="text-steel-blue mr-2 font-bold">•</span>
                    No child pays to play - ever!
                  </li>
                </ul>
              </div>
              
              <div className="bg-black/50 border border-steel-blue/50 rounded-lg p-6">
                <h4 className="text-xl font-bold mb-4 text-white">Practice Information</h4>
                <p className="mb-4 text-gray-200">
                  Join us at our home rink in Voorhees, NJ. Contact us to schedule your 
                  first visit and meet our amazing team!
                </p>
                <div className="space-y-3 text-gray-200">
                  <div className="flex items-center gap-2">
                    <FaMapMarkerAlt className="text-steel-blue" />
                    <span>601 Laurel Oak Road, Voorhees, NJ</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaEnvelope className="text-steel-blue" />
                    <span>info@WingsofSteel.org</span>
                  </div>
                </div>
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href="/join-team"
                  className="inline-block w-full bg-steel-blue text-white px-6 py-3 rounded-full font-medium text-center mt-4 hover:bg-blue-600 transition-colors duration-300"
                >
                  Join the Team
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
          className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-8"
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-4 text-white">
              Contact & Subscribe
            </h3>
            <p className="mb-6 text-gray-300">
              Get in touch with us or join our mailing list for updates
            </p>
          </div>
          <ContactForms />
        </motion.div>
      </div>
    </section>
  );
};

export default GetInvolved;