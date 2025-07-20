import { motion } from 'framer-motion';
import { FaHeart, FaUsers, FaHandsHelping, FaStar } from 'react-icons/fa';

const About = () => {
  const features = [
    {
      icon: <FaHeart className="text-4xl text-red-500" />,
      title: "No Child Pays to Play",
      description: "100% free program ensuring every child has access to sled hockey regardless of financial situation"
    },
    {
      icon: <FaUsers className="text-4xl text-steel-blue" />,
      title: "Inclusive Community",
      description: "A supportive environment where children with special needs can thrive through teamwork and sport"
    },
    {
      icon: <FaHandsHelping className="text-4xl text-green-500" />,
      title: "501(c)(3) Nonprofit",
      description: "100% of donations go directly to supporting our players and programs"
    },
    {
      icon: <FaStar className="text-4xl text-yellow-500" />,
      title: "Championship Excellence",
      description: "Back-to-back USA Sled Hockey Champions in 2024 and 2025"
    }
  ];

  return (
    <section id="about" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-sport text-dark-steel mb-4">
            About Wings of Steel
          </h2>
          <div className="w-24 h-1 bg-steel-blue mx-auto mb-8"></div>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            Wings of Steel Sled Hockey provides an inclusive and empowering athletic experience 
            for disabled youth in New Jersey. Our program focuses on building confidence, 
            developing skills, and fostering lifelong friendships through the sport of sled hockey.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">{feature.icon}</div>
                <div>
                  <h3 className="text-xl font-bold text-dark-steel mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-steel-blue to-dark-steel rounded-2xl p-12 text-white"
        >
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-3xl font-sport mb-6">Our Mission</h3>
            <p className="text-lg leading-relaxed mb-8">
              Founded by Tom Brake, Wings of Steel is dedicated to providing every child, 
              regardless of their physical abilities or financial situation, the opportunity 
              to experience the thrill of competitive sled hockey. We believe in the power of 
              sport to transform lives, build character, and create lasting memories.
            </p>
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="#get-involved"
              className="inline-block bg-white text-steel-blue px-8 py-4 rounded-full font-medium hover:bg-gray-100 transition-colors duration-300"
            >
              Join Our Community
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;