import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaHockeyPuck, FaUser, FaEnvelope, FaPhone, FaBirthdayCake, FaMapMarkerAlt, FaCheckCircle, FaExclamationTriangle, FaHome, FaInfoCircle } from 'react-icons/fa';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { supabase } from '../lib/supabaseClient';
import { Link } from 'react-router-dom';

interface JoinFormData {
  playerName: string;
  dateOfBirth: string;
  parentName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  diagnosis: string;
  experienceLevel: string;
  additionalInfo: string;
  emergencyContact: string;
  emergencyPhone: string;
  howHeard: string;
}

const JoinTeam = () => {
  const [formData, setFormData] = useState<JoinFormData>({
    playerName: '',
    dateOfBirth: '',
    parentName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: 'NJ',
    zipCode: '',
    diagnosis: '',
    experienceLevel: 'beginner',
    additionalInfo: '',
    emergencyContact: '',
    emergencyPhone: '',
    howHeard: ''
  });

  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionStatus('loading');

    try {
      // First, save to database
      const { error: dbError } = await supabase
        .from('team_registrations')
        .insert([{
          player_name: formData.playerName,
          date_of_birth: formData.dateOfBirth,
          parent_name: formData.parentName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zipCode,
          diagnosis: formData.diagnosis,
          experience_level: formData.experienceLevel,
          additional_info: formData.additionalInfo,
          emergency_contact: formData.emergencyContact,
          emergency_phone: formData.emergencyPhone,
          how_heard: formData.howHeard,
          submitted_at: new Date().toISOString(),
          status: 'pending'
        }]);

      if (dbError) throw dbError;

      // Then, send email notifications via Netlify function
      try {
        const emailResponse = await fetch('/.netlify/functions/send-registration-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const emailResult = await emailResponse.json();
        if (!emailResult.success) {
          console.error('Email notification failed:', emailResult.message);
        }
      } catch (emailErr) {
        console.error('Email notification error:', emailErr);
        // Continue - registration was still saved
      }

      setSubmissionStatus('success');
      setStatusMessage('Registration submitted successfully! We\'ll contact you within 24-48 hours.');
      
      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          playerName: '',
          dateOfBirth: '',
          parentName: '',
          email: '',
          phone: '',
          address: '',
          city: '',
          state: 'NJ',
          zipCode: '',
          diagnosis: '',
          experienceLevel: 'beginner',
          additionalInfo: '',
          emergencyContact: '',
          emergencyPhone: '',
          howHeard: ''
        });
        setSubmissionStatus('idle');
        setStatusMessage('');
      }, 5000);

    } catch (error) {
      console.error('Registration error:', error);
      setSubmissionStatus('error');
      setStatusMessage('Sorry, there was an error submitting your registration. Please try again or contact us directly.');
      
      setTimeout(() => {
        setSubmissionStatus('idle');
        setStatusMessage('');
      }, 5000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark-steel to-black">
      <Navigation />
      
      <main className="pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="flex justify-center items-center mb-6">
              <FaHockeyPuck className="text-5xl text-ice-blue animate-pulse" />
            </div>
            <h1 className="text-4xl md:text-5xl font-sport text-white mb-4">
              JOIN THE WINGS OF STEEL
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Ready to be part of our championship team? Fill out the form below and we'll get you on the ice!
            </p>
          </motion.div>

          {/* Info Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-gradient-to-r from-steel-blue to-blue-600 rounded-xl p-6 mb-8"
          >
            <div className="flex items-start gap-4">
              <FaInfoCircle className="text-3xl text-white flex-shrink-0 mt-1" />
              <div className="text-white">
                <h3 className="text-xl font-bold mb-2">NO CHILD PAYS TO PLAY</h3>
                <p className="text-sm">
                  All equipment, ice time, coaching, and tournament fees are provided at NO COST to families. 
                  We believe every child deserves the opportunity to play, regardless of financial circumstances.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Registration Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-gray-900 border border-steel-blue/40 rounded-2xl p-8"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Player Information */}
              <div>
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <FaUser className="text-steel-blue" />
                  Player Information
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="playerName" className="block text-sm font-medium text-gray-300 mb-2">
                      Player's Full Name *
                    </label>
                    <input
                      type="text"
                      id="playerName"
                      name="playerName"
                      value={formData.playerName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-black/50 border border-steel-blue/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-steel-blue focus:border-transparent"
                      placeholder="Enter player's full name"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-300 mb-2">
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      id="dateOfBirth"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-black/50 border border-steel-blue/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-steel-blue focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Parent/Guardian Information */}
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Parent/Guardian Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="parentName" className="block text-sm font-medium text-gray-300 mb-2">
                      Parent/Guardian Name *
                    </label>
                    <input
                      type="text"
                      id="parentName"
                      name="parentName"
                      value={formData.parentName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-black/50 border border-steel-blue/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-steel-blue focus:border-transparent"
                      placeholder="Enter parent/guardian name"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-black/50 border border-steel-blue/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-steel-blue focus:border-transparent"
                      placeholder="parent@example.com"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-black/50 border border-steel-blue/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-steel-blue focus:border-transparent"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div>
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <FaMapMarkerAlt className="text-steel-blue" />
                  Address
                </h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-300 mb-2">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-black/50 border border-steel-blue/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-steel-blue focus:border-transparent"
                      placeholder="123 Main Street"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-300 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-black/50 border border-steel-blue/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-steel-blue focus:border-transparent"
                        placeholder="Voorhees"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="state" className="block text-sm font-medium text-gray-300 mb-2">
                        State *
                      </label>
                      <select
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-black/50 border border-steel-blue/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-steel-blue focus:border-transparent"
                      >
                        <option value="NJ">NJ</option>
                        <option value="PA">PA</option>
                        <option value="DE">DE</option>
                        <option value="NY">NY</option>
                        <option value="MD">MD</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="zipCode" className="block text-sm font-medium text-gray-300 mb-2">
                        ZIP Code *
                      </label>
                      <input
                        type="text"
                        id="zipCode"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        required
                        pattern="[0-9]{5}"
                        className="w-full px-4 py-3 bg-black/50 border border-steel-blue/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-steel-blue focus:border-transparent"
                        placeholder="08043"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Medical & Experience Information */}
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Medical & Experience Information</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="diagnosis" className="block text-sm font-medium text-gray-300 mb-2">
                      Diagnosis/Disability (Optional)
                    </label>
                    <input
                      type="text"
                      id="diagnosis"
                      name="diagnosis"
                      value={formData.diagnosis}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-black/50 border border-steel-blue/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-steel-blue focus:border-transparent"
                      placeholder="This helps us provide appropriate support"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="experienceLevel" className="block text-sm font-medium text-gray-300 mb-2">
                      Hockey Experience Level *
                    </label>
                    <select
                      id="experienceLevel"
                      name="experienceLevel"
                      value={formData.experienceLevel}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-black/50 border border-steel-blue/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-steel-blue focus:border-transparent"
                    >
                      <option value="beginner">No Experience / Beginner</option>
                      <option value="some">Some Experience (1-2 years)</option>
                      <option value="experienced">Experienced (3+ years)</option>
                      <option value="sled">Previous Sled Hockey Experience</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Emergency Contact</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-300 mb-2">
                      Emergency Contact Name *
                    </label>
                    <input
                      type="text"
                      id="emergencyContact"
                      name="emergencyContact"
                      value={formData.emergencyContact}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-black/50 border border-steel-blue/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-steel-blue focus:border-transparent"
                      placeholder="Contact name"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="emergencyPhone" className="block text-sm font-medium text-gray-300 mb-2">
                      Emergency Phone *
                    </label>
                    <input
                      type="tel"
                      id="emergencyPhone"
                      name="emergencyPhone"
                      value={formData.emergencyPhone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-black/50 border border-steel-blue/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-steel-blue focus:border-transparent"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Additional Information</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="howHeard" className="block text-sm font-medium text-gray-300 mb-2">
                      How did you hear about Wings of Steel?
                    </label>
                    <input
                      type="text"
                      id="howHeard"
                      name="howHeard"
                      value={formData.howHeard}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-black/50 border border-steel-blue/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-steel-blue focus:border-transparent"
                      placeholder="Friend, social media, doctor, etc."
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-300 mb-2">
                      Anything else we should know?
                    </label>
                    <textarea
                      id="additionalInfo"
                      name="additionalInfo"
                      value={formData.additionalInfo}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-3 bg-black/50 border border-steel-blue/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-steel-blue focus:border-transparent resize-none"
                      placeholder="Special needs, concerns, questions, etc."
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <motion.button
                  type="submit"
                  disabled={submissionStatus === 'loading'}
                  whileHover={{ scale: submissionStatus === 'loading' ? 1 : 1.02 }}
                  whileTap={{ scale: submissionStatus === 'loading' ? 1 : 0.98 }}
                  className={`w-full py-4 px-6 rounded-lg font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                    submissionStatus === 'loading'
                      ? 'bg-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-black shadow-lg hover:shadow-xl'
                  }`}
                >
                  {submissionStatus === 'loading' ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                      Submitting Registration...
                    </>
                  ) : (
                    <>
                      <FaHockeyPuck />
                      Submit Registration
                    </>
                  )}
                </motion.button>
              </div>
            </form>

            {/* Status Messages */}
            {submissionStatus !== 'idle' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`mt-6 p-4 rounded-lg flex items-center gap-3 ${
                  submissionStatus === 'success'
                    ? 'bg-green-600/20 border border-green-500/30 text-green-100'
                    : submissionStatus === 'error'
                    ? 'bg-red-600/20 border border-red-500/30 text-red-100'
                    : 'bg-blue-600/20 border border-blue-500/30 text-blue-100'
                }`}
              >
                {submissionStatus === 'success' ? (
                  <FaCheckCircle className="text-green-400 flex-shrink-0 text-xl" />
                ) : submissionStatus === 'error' ? (
                  <FaExclamationTriangle className="text-red-400 flex-shrink-0 text-xl" />
                ) : (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400 flex-shrink-0"></div>
                )}
                <div>
                  <p className="font-medium">{statusMessage}</p>
                  {submissionStatus === 'success' && (
                    <p className="text-sm mt-2">
                      <Link to="/" className="underline hover:text-white">Return to Home</Link>
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 text-center"
          >
            <p className="text-gray-400 mb-2">Have questions? Contact us directly:</p>
            <a href="mailto:info@WingsofSteel.org" className="text-steel-blue hover:text-ice-blue transition-colors inline-flex items-center gap-2">
              <FaEnvelope />
              info@WingsofSteel.org
            </a>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default JoinTeam;