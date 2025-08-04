import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaEnvelope, FaPaperPlane, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { supabase } from '../lib/supabaseClient';

interface FormData {
  name: string;
  email: string;
  message: string;
  type: 'contact' | 'mailing_list';
}

const ContactForms = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: '',
    type: 'contact'
  });
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [activeForm, setActiveForm] = useState<'contact' | 'mailing'>('contact');

  const handleSubmit = async (e: React.FormEvent, formType: 'contact' | 'mailing_list') => {
    e.preventDefault();
    setSubmissionStatus('loading');

    try {
      if (formType === 'mailing_list') {
        // Handle mailing list signup
        const { error } = await supabase
          .from('mailing_list')
          .insert([{
            name: formData.name,
            email: formData.email,
            subscribed_at: new Date().toISOString()
          }]);

        if (error) throw error;
        
        console.log('Mailing list signup:', { name: formData.name, email: formData.email });
        setStatusMessage('Successfully subscribed to our mailing list!');
      } else {
        // Handle contact form
        const { error } = await supabase
          .from('contact_submissions')
          .insert([{
            name: formData.name,
            email: formData.email,
            message: formData.message,
            submitted_at: new Date().toISOString()
          }]);

        if (error) throw error;
        
        console.log('Contact form:', formData);
        setStatusMessage('Message sent successfully! We\'ll get back to you soon.');
      }

      setSubmissionStatus('success');
      setFormData({ name: '', email: '', message: '', type: formType });
      
      // Reset status after 5 seconds
      setTimeout(() => {
        setSubmissionStatus('idle');
        setStatusMessage('');
      }, 5000);

    } catch (error) {
      console.error('Form submission error:', error);
      setSubmissionStatus('error');
      setStatusMessage('Sorry, there was an error. Please try again.');
      
      setTimeout(() => {
        setSubmissionStatus('idle');
        setStatusMessage('');
      }, 5000);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
      {/* Contact Form */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <div className="flex items-center gap-3 mb-4 md:mb-6">
          <FaEnvelope className="text-2xl md:text-3xl text-steel-blue" />
          <h3 className="text-xl md:text-2xl font-bold">Send Us a Message</h3>
        </div>
        
        <form onSubmit={(e) => handleSubmit(e, 'contact')} className="space-y-4">
          <div>
            <label htmlFor="contact-name" className="block text-sm font-medium text-white mb-2">
              Your Name
            </label>
            <input
              type="text"
              id="contact-name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-steel-gray/30 border border-steel-blue/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-steel-blue focus:border-transparent"
              placeholder="Enter your full name"
            />
          </div>
          
          <div>
            <label htmlFor="contact-email" className="block text-sm font-medium text-white mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="contact-email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-steel-gray/30 border border-steel-blue/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-steel-blue focus:border-transparent"
              placeholder="your.email@example.com"
            />
          </div>
          
          <div>
            <label htmlFor="contact-message" className="block text-sm font-medium text-white mb-2">
              Message
            </label>
            <textarea
              id="contact-message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              required
              rows={6}
              className="w-full px-4 py-3 bg-steel-gray/30 border border-steel-blue/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-steel-blue focus:border-transparent resize-none"
              placeholder="Tell us about your interest in Wings of Steel sled hockey, questions about the program, or how we can help..."
            />
          </div>
          
          <motion.button
            type="submit"
            disabled={submissionStatus === 'loading'}
            whileHover={{ scale: submissionStatus === 'loading' ? 1 : 1.02 }}
            whileTap={{ scale: submissionStatus === 'loading' ? 1 : 0.98 }}
            className={`w-full py-3 px-6 rounded-lg font-bold text-base transition-all duration-300 flex items-center justify-center gap-2 ${
              submissionStatus === 'loading'
                ? 'bg-gray-500 cursor-not-allowed'
                : 'bg-steel-blue hover:bg-blue-600 text-white shadow-lg hover:shadow-xl'
            }`}
          >
            {submissionStatus === 'loading' ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Sending...
              </>
            ) : (
              <>
                <FaPaperPlane />
                Send Message
              </>
            )}
          </motion.button>
        </form>
      </motion.div>

      {/* Mailing List Signup */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <div className="flex items-center gap-3 mb-4 md:mb-6">
          <FaEnvelope className="text-2xl md:text-3xl text-steel-blue" />
          <h3 className="text-xl md:text-2xl font-bold">Join Our Mailing List</h3>
        </div>
        
        <div className="bg-steel-gray/20 rounded-lg p-6 md:p-8 mb-6">
          <h4 className="text-lg font-semibold text-white mb-3">Stay Connected!</h4>
          <ul className="text-sm text-gray-300 space-y-2 mb-4">
            <li>• Get updates on games and tournaments</li>
            <li>• Learn about upcoming events and fundraisers</li>
            <li>• Receive program announcements</li>
            <li>• Never miss important team news</li>
          </ul>
          <p className="text-xs text-gray-400">We respect your privacy. Unsubscribe anytime.</p>
        </div>
        
        <form onSubmit={(e) => handleSubmit(e, 'mailing_list')} className="space-y-4">
          <div>
            <label htmlFor="mailing-name" className="block text-sm font-medium text-white mb-2">
              Your Name
            </label>
            <input
              type="text"
              id="mailing-name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-steel-gray/30 border border-steel-blue/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-steel-blue focus:border-transparent"
              placeholder="Enter your full name"
            />
          </div>
          
          <div>
            <label htmlFor="mailing-email" className="block text-sm font-medium text-white mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="mailing-email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-steel-gray/30 border border-steel-blue/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-steel-blue focus:border-transparent"
              placeholder="your.email@example.com"
            />
          </div>
          
          <motion.button
            type="submit"
            disabled={submissionStatus === 'loading'}
            whileHover={{ scale: submissionStatus === 'loading' ? 1 : 1.02 }}
            whileTap={{ scale: submissionStatus === 'loading' ? 1 : 0.98 }}
            className={`w-full py-3 px-6 rounded-lg font-bold text-base transition-all duration-300 flex items-center justify-center gap-2 ${
              submissionStatus === 'loading'
                ? 'bg-gray-500 cursor-not-allowed'
                : 'bg-yellow-400 hover:bg-yellow-300 text-black shadow-lg hover:shadow-xl'
            }`}
          >
            {submissionStatus === 'loading' ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                Subscribing...
              </>
            ) : (
              <>
                <FaEnvelope />
                Join Mailing List
              </>
            )}
          </motion.button>
        </form>
      </motion.div>

      {/* Status Messages */}
      {submissionStatus !== 'idle' && (
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-lg flex items-center gap-3 ${
              submissionStatus === 'success'
                ? 'bg-green-600/20 border border-green-500/30 text-green-100'
                : submissionStatus === 'error'
                ? 'bg-red-600/20 border border-red-500/30 text-red-100'
                : 'bg-blue-600/20 border border-blue-500/30 text-blue-100'
            }`}
          >
            {submissionStatus === 'success' ? (
              <FaCheckCircle className="text-green-400 flex-shrink-0" />
            ) : submissionStatus === 'error' ? (
              <FaExclamationTriangle className="text-red-400 flex-shrink-0" />
            ) : (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400 flex-shrink-0"></div>
            )}
            <p className="text-sm font-medium">{statusMessage}</p>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ContactForms;