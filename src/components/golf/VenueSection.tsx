import { motion } from 'framer-motion'
import { MapPin, Globe, Phone, Clock, Calendar, Car } from 'lucide-react'

const VenueSection = () => {
  return (
    <section className="relative py-16 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/images/golf-hero.jpg" 
          alt="Golf course background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
      </div>
      
      <div className="relative z-10 container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-sport text-5xl text-white mb-4 drop-shadow-lg">
            TOURNAMENT VENUE
          </h2>
          <p className="text-xl text-white/90 max-w-3xl mx-auto drop-shadow">
            Join us at the prestigious Ron Jaworski's Ramblewood Country Club, 
            one of New Jersey's premier golf destinations
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left Column - Map and Golf Cart Image */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-white rounded-lg shadow-xl overflow-hidden h-[400px]"
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3063.0871551095!2d-74.92127768461712!3d39.85031197943565!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c13f8a5d5a5a5b%3A0x1234567890abcdef!2sRamblewood%20Country%20Club!5e0!3m2!1sen!2sus!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ron Jaworski's Ramblewood Country Club Location"
                className="w-full h-full"
              />
            </motion.div>
            
            {/* Golf Cart Image - Extended Height */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white rounded-lg shadow-xl overflow-hidden h-full"
            >
              <img 
                src="/images/golf cart (1).jpg" 
                alt="Golf carts ready for tournament"
                className="w-full h-[400px] lg:h-[500px] object-cover"
              />
              <div className="p-6 bg-gradient-to-r from-steel-blue to-dark-steel">
                <p className="text-white font-bold text-lg text-center">
                  Premium golf carts included for all participants
                </p>
                <p className="text-ice-blue text-sm text-center mt-2">
                  Experience the course in comfort and style
                </p>
              </div>
            </motion.div>
          </div>

          {/* Venue Details */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            {/* Venue Card */}
            <div className="bg-white rounded-lg shadow-xl p-8">
              <h3 className="font-sport text-3xl text-dark-steel mb-6">
                Ron Jaworski's Ramblewood Country Club
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="text-steel-blue mt-1 flex-shrink-0" size={20} />
                  <div>
                    <p className="font-semibold text-gray-800">Address</p>
                    <p className="text-gray-600">
                      200 Country Club Parkway<br />
                      Mt. Laurel, NJ 08054
                    </p>
                    <a 
                      href="https://www.google.com/maps/dir/?api=1&destination=200+Country+Club+Parkway+Mt+Laurel+NJ+08054"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-steel-blue hover:text-dark-steel text-sm font-semibold mt-2 inline-block"
                    >
                      Get Directions →
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Globe className="text-steel-blue mt-1 flex-shrink-0" size={20} />
                  <div>
                    <p className="font-semibold text-gray-800">Website</p>
                    <a 
                      href="https://ramblewoodcc.com/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-steel-blue hover:text-dark-steel"
                    >
                      ramblewoodcc.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Phone className="text-steel-blue mt-1 flex-shrink-0" size={20} />
                  <div>
                    <p className="font-semibold text-gray-800">Contact</p>
                    <a 
                      href="tel:856-235-2118"
                      className="text-steel-blue hover:text-dark-steel"
                    >
                      (856) 235-2118
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Car className="text-steel-blue mt-1 flex-shrink-0" size={20} />
                  <div>
                    <p className="font-semibold text-gray-800">Parking</p>
                    <p className="text-gray-600">Free on-site parking available</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Schedule Card */}
            <div className="bg-gradient-to-r from-steel-blue to-dark-steel rounded-lg shadow-xl p-8 text-white">
              <h4 className="font-sport text-2xl mb-4">Event Schedule</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Clock size={18} />
                  <div>
                    <span className="font-semibold">11:00 AM</span> - Registration Opens
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock size={18} />
                  <div>
                    <span className="font-semibold">11:15 AM</span> - Lunch Served
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock size={18} />
                  <div>
                    <span className="font-semibold">1:00 PM</span> - Shotgun Start
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock size={18} />
                  <div>
                    <span className="font-semibold">5:30 PM</span> - Dinner & Awards
                  </div>
                </div>
              </div>
            </div>

            {/* About Venue */}
            <div className="bg-white rounded-lg shadow-xl p-8">
              <h4 className="font-bold text-xl text-dark-steel mb-3">About the Venue</h4>
              <p className="text-gray-600 leading-relaxed">
                Ron Jaworski's Ramblewood Country Club is a premier 27-hole championship 
                golf facility that has hosted numerous professional and amateur tournaments. 
                Known for its pristine conditions and challenging layout, Ramblewood offers 
                an exceptional golf experience perfect for our charity event.
              </p>
              <a 
                href="https://ramblewoodcc.com/course-tour/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block mt-4 bg-steel-blue text-white px-6 py-2 rounded-lg hover:bg-dark-steel transition-colors"
              >
                View Course Tour
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default VenueSection