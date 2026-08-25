import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaEnvelope, FaFacebook, FaPaperPlane } from 'react-icons/fa';

// The working contact form (wired to Supabase + email) lives in the
// Get Involved section's ContactForms. This section used to render a second,
// identical-looking form with no submit handler — messages typed there went
// nowhere. Now it holds the contact details and points at the real form.
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
          <h2 className="font-sport text-display-md md:text-display-lg text-dark-steel mb-4">
            Contact Us
          </h2>
          <div className="w-24 h-1 bg-steel-blue mx-auto mb-8"></div>
          <p className="text-lg text-gray-700">
            Get in touch with Wings of Steel Sled Hockey
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-white rounded-lg shadow-lg p-8 max-w-3xl mx-auto"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="flex items-start gap-4">
              <FaMapMarkerAlt className="text-steel-blue text-xl mt-1" aria-hidden="true" />
              <div>
                <p className="font-medium text-gray-900">Location</p>
                <p className="text-gray-600">601 Laurel Oak Road</p>
                <p className="text-gray-600">Voorhees, New Jersey</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <FaEnvelope className="text-steel-blue text-xl mt-1" aria-hidden="true" />
              <div>
                <p className="font-medium text-gray-900">Email</p>
                <a
                  href="mailto:info@WingsofSteel.org"
                  className="text-steel-blue underline underline-offset-2 hover:text-blue-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-steel-blue rounded-sm"
                >
                  info@WingsofSteel.org
                </a>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-200 pt-6">
            <a
              href="https://www.facebook.com/wingsofsteel"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-steel-blue hover:text-blue-600 transition-colors font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-steel-blue rounded-md px-2 py-1"
              aria-label="Follow Wings of Steel on Facebook"
            >
              <FaFacebook className="text-2xl" aria-hidden="true" />
              Follow us on Facebook
            </a>

            <a
              href="#contact-forms"
              className="inline-flex items-center gap-2 bg-steel-blue text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-steel-blue"
            >
              <FaPaperPlane aria-hidden="true" />
              Send Us a Message
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;
