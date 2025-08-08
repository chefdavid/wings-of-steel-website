import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronDown, FaExchangeAlt } from 'react-icons/fa';
import { useTeam } from '../hooks/useTeam';
import { TEAM_CONFIGS } from '../config/teams';

interface TeamSwitcherProps {
  className?: string;
  variant?: 'dropdown' | 'button' | 'compact';
}

const TeamSwitcher: React.FC<TeamSwitcherProps> = ({ 
  className = '',
  variant = 'dropdown'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { teamConfig, currentTeam } = useTeam();
  
  const otherTeam = currentTeam === 'youth' ? 'adult' : 'youth';
  const otherTeamConfig = TEAM_CONFIGS[otherTeam];

  if (variant === 'button') {
    return (
      <Link
        to={`/team/${otherTeam}`}
        className={`inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-all duration-200 backdrop-blur-sm ${className}`}
      >
        <FaExchangeAlt className="w-3 h-3" />
        Switch to {otherTeamConfig.name}
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <Link
        to={`/team/${otherTeam}`}
        className={`inline-flex items-center gap-1 px-2 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-xs font-medium transition-all duration-200 ${className}`}
        title={`Switch to ${otherTeamConfig.name}`}
      >
        <FaExchangeAlt className="w-2 h-2" />
        {otherTeamConfig.name}
      </Link>
    );
  }

  // Default: dropdown variant
  return (
    <div className={`relative ${className}`}>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-all duration-200 backdrop-blur-sm min-w-0"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div 
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: teamConfig.colors.accent }}
          />
          <span className="truncate">{teamConfig.name}</span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0 ml-2"
        >
          <FaChevronDown className="w-3 h-3" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50"
            onBlur={() => setIsOpen(false)}
          >
            {Object.entries(TEAM_CONFIGS).map(([teamType, config]) => (
              <Link
                key={teamType}
                to={`/team/${teamType}`}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 transition-colors duration-150 ${
                  currentTeam === teamType
                    ? 'bg-gray-100 font-medium'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: config.colors.primary }}
                  />
                  <div>
                    <div 
                      className="font-semibold"
                      style={{ color: config.colors.primary }}
                    >
                      {config.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {config.description}
                    </div>
                  </div>
                  {currentTeam === teamType && (
                    <div className="ml-auto">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                  )}
                </div>
              </Link>
            ))}
            
            <div className="border-t border-gray-100 p-2">
              <Link
                to="/"
                onClick={() => setIsOpen(false)}
                className="block px-2 py-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
              >
                ← Back to Team Selection
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default TeamSwitcher;