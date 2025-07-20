import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaEnvelope, FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa';

const Contact = () => {
  return (
    <section id="contact" className="py-20 bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-sport text-dark-steel mb-4">
            Contact Us
          </h2>
          <div className="w-24 h-1 bg-steel-blue mx-auto mb-8"></div>
          <p className="text-lg text-gray-700">
            Get in touch with Wings of Steel Sled Hockey
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-white rounded-lg shadow-lg p-8"
          >
            <h3 className="text-2xl font-bold text-dark-steel mb-6">Get In Touch</h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <FaMapMarkerAlt className="text-steel-blue text-xl mt-1" />
                <div>
                  <p className="font-medium text-gray-900">Location</p>
                  <p className="text-gray-600">601 Laurel Oak Road</p>
                  <p className="text-gray-600">Voorhees, New Jersey</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <FaEnvelope className="text-steel-blue text-xl mt-1" />
                <div>
                  <p className="font-medium text-gray-900">Email</p>
                  <a 
                    href="mailto:info@WingsofSteel.org" 
                    className="text-steel-blue hover:text-blue-600 transition-colors"
                  >
                    info@WingsofSteel.org
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <p className="font-medium text-gray-900 mb-4">Follow Us</p>
              <div className="flex gap-4">
                <motion.a
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  href="#"
                  className="bg-steel-blue text-white p-3 rounded-full hover:bg-blue-600 transition-colors"
                >
                  <FaFacebook className="text-xl" />
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  href="#"
                  className="bg-steel-blue text-white p-3 rounded-full hover:bg-blue-600 transition-colors"
                >
                  <FaInstagram className="text-xl" />
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  href="#"
                  className="bg-steel-blue text-white p-3 rounded-full hover:bg-blue-600 transition-colors"
                >
                  <FaTwitter className="text-xl" />
                </motion.a>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-white rounded-lg shadow-lg p-8"
          >
            <h3 className="text-2xl font-bold text-dark-steel mb-6">Send Us a Message</h3>
            
            <form className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-steel-blue focus:border-transparent"
                  placeholder="Your Name"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-steel-blue focus:border-transparent"
                  placeholder="your@email.com"
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  id="message"
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-steel-blue focus:border-transparent"
                  placeholder="Your message..."
                />
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full bg-steel-blue text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors duration-300"
              >
                Send Message
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;