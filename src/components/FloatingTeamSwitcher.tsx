import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaExchangeAlt, FaTimes } from 'react-icons/fa';
import TeamSwitcher from './TeamSwitcher';

const FloatingTeamSwitcher: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isExpanded ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-lg shadow-2xl border border-gray-200 p-4 min-w-64"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">Switch Team</h3>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </div>
            <TeamSwitcher 
              variant="dropdown" 
              className="w-full"
            />
          </motion.div>
        ) : (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsExpanded(true)}
            className="w-14 h-14 bg-gradient-to-br from-steel-blue to-dark-steel text-white rounded-full shadow-2xl flex items-center justify-center hover:shadow-3xl transition-all duration-300"
            title="Switch Team"
          >
            <FaExchangeAlt className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FloatingTeamSwitcher;