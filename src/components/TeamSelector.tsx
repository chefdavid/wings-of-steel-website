import React from 'react';
import { motion } from 'framer-motion';
import { useTeam } from '../hooks/useTeam';
import { TEAM_CONFIGS } from '../config/teams';
import type { TeamType } from '../types/team';

interface TeamSelectorProps {
  className?: string;
  variant?: 'dropdown' | 'tabs' | 'buttons';
}

const TeamSelector: React.FC<TeamSelectorProps> = ({ 
  className = '',
  variant = 'tabs'
}) => {
  const { currentTeam, switchTeam, isLoading } = useTeam();

  if (variant === 'dropdown') {
    return (
      <div className={`relative ${className}`}>
        <select
          value={currentTeam}
          onChange={(e) => switchTeam(e.target.value as TeamType)}
          disabled={isLoading}
          className="bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
        >
          {Object.entries(TEAM_CONFIGS).map(([key, config]) => (
            <option key={key} value={key}>
              {config.name}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (variant === 'buttons') {
    return (
      <div className={`flex gap-2 ${className}`}>
        {Object.entries(TEAM_CONFIGS).map(([key, config]) => (
          <motion.button
            key={key}
            onClick={() => switchTeam(key as TeamType)}
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all duration-200 disabled:opacity-50 ${
              currentTeam === key
                ? 'text-white shadow-lg border border-white/20'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
            style={{
              backgroundColor: currentTeam === key ? 'rgba(255,255,255,0.25)' : 'transparent'
            }}
          >
            {config.name}
          </motion.button>
        ))}
      </div>
    );
  }

  // Default: tabs variant
  return (
    <div className={`flex bg-black/20 backdrop-blur-sm rounded-lg p-1 shadow-lg ${className}`}>
      {Object.entries(TEAM_CONFIGS).map(([key, config]) => (
        <motion.button
          key={key}
          onClick={() => switchTeam(key as TeamType)}
          disabled={isLoading}
          whileHover={currentTeam !== key ? { scale: 1.02 } : {}}
          whileTap={{ scale: 0.98 }}
          className={`flex-1 px-3 py-1.5 rounded-md font-semibold text-xs transition-all duration-200 disabled:opacity-50 ${
            currentTeam === key
              ? 'text-white shadow-lg border border-white/20'
              : 'text-white/80 hover:text-white hover:bg-white/10'
          }`}
          style={{
            backgroundColor: currentTeam === key ? 'rgba(255,255,255,0.25)' : 'transparent'
          }}
        >
          <span className="font-bold">{config.name}</span>
        </motion.button>
      ))}
      
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 rounded-lg flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        </div>
      )}
    </div>
  );
};

export default TeamSelector;