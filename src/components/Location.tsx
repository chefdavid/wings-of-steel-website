import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaClock, FaParking, FaDirections } from 'react-icons/fa';
import { supabase } from '../lib/supabaseClient';

const Location = () => {
  const [locationData, setLocationData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLocationData();
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
      setLoading(false);
    }
  };

  // Default data with CMS fallbacks
  const rinkInfo = {
    name: locationData?.rink_name || "Flyers Skate Zone",
    address: locationData?.address || "601 Laurel Oak Rd, Voorhees Township, NJ 08043",
    phone: locationData?.phone || "(856) 751-9161",
    website: locationData?.website || "https://flyersskatezone.com/",
    googleMapsUrl: locationData?.google_maps_url || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3046.4442671551143!2d-75.04284768459386!3d39.84582267943893!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c6dd4c3b1c1c3b%3A0x8e8e8e8e8e8e8e8e!2s601%20Laurel%20Oak%20Rd%2C%20Voorhees%20Township%2C%20NJ%2008043!5e0!3m2!1sen!2sus!4v1643000000000!5m2!1sen!2sus"
  };

  const practiceSchedule = [
    { day: "Monday", time: "6:00 PM - 8:00 PM", type: "Team Practice" },
    { day: "Wednesday", time: "6:00 PM - 8:00 PM", type: "Team Practice" },
    { day: "Saturday", time: "10:00 AM - 12:00 PM", type: "Skills & Scrimmage" },
    { day: "Sunday", time: "2:00 PM - 4:00 PM", type: "Open Practice" }
  ];

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
              <h3 className="text-xl md:text-2xl font-bold text-dark-steel mb-4 flex items-center gap-2">
                <FaClock className="text-steel-blue" />
                Practice Schedule
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 md:p-6">
                <div className="space-y-3">
                  {practiceSchedule.map((session, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                      <div>
                        <p className="font-semibold text-sm md:text-base text-dark-steel">{session.day}</p>
                        <p className="text-xs md:text-sm text-steel-blue">{session.type}</p>
                      </div>
                      <p className="text-sm md:text-base font-medium text-gray-700">{session.time}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-xs md:text-sm text-yellow-800">
                    <strong>New players welcome!</strong> Contact us to schedule a trial session.
                  </p>
                </div>
              </div>
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
                <p className="text-sm md:text-base opacity-90">Phone: {rinkInfo.phone}</p>
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
    </section>
  );
};

export default Location;