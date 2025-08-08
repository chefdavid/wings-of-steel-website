import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TEAM_CONFIGS } from '../config/teams';

const TeamLanding: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-steel-blue to-dark-steel flex items-center justify-center">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          {/* Logo and Title */}
          <div className="mb-8">
            <img 
              src="/assets/wings-logo.png" 
              alt="Wings of Steel Logo" 
              className="h-24 w-auto mx-auto mb-6"
            />
            <h1 className="text-5xl md:text-7xl font-sport text-white mb-4">
              WINGS OF STEEL
            </h1>
            <p className="text-xl md:text-2xl text-ice-blue font-display">
              Choose Your Team
            </p>
          </div>

          {/* Team Selection */}
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {Object.entries(TEAM_CONFIGS).map(([teamType, config]) => (
              <motion.div
                key={teamType}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: teamType === 'youth' ? 0.2 : 0.4 }}
              >
                <Link
                  to={`/team/${teamType}`}
                  className="block group"
                >
                  <motion.div
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 group-hover:shadow-3xl"
                    style={{ 
                      boxShadow: `0 20px 40px rgba(0,0,0,0.1), 0 0 0 2px ${config.colors.primary}20` 
                    }}
                  >
                    <div 
                      className="h-4"
                      style={{ backgroundColor: config.colors.primary }}
                    />
                    <div className="p-8">
                      <h2 
                        className="text-3xl font-sport mb-3"
                        style={{ color: config.colors.primary }}
                      >
                        {config.name}
                      </h2>
                      <p className="text-gray-600 mb-4 text-lg">
                        {config.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-500">
                          {config.ageGroup}
                        </span>
                        <motion.div
                          className="w-8 h-8 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: config.colors.primary }}
                        >
                          <svg 
                            className="w-4 h-4 text-white" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M9 5l7 7-7 7" 
                            />
                          </svg>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Mission Statement */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="mt-12 p-6 bg-white/10 backdrop-blur-sm rounded-xl"
          >
            <p className="text-lg text-white/90">
              Breaking barriers and building champions on the ice
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default TeamLanding;