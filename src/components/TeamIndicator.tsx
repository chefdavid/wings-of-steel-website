import React from 'react';
import { motion } from 'framer-motion';
import { useTeam } from '../hooks/useTeam';

interface TeamIndicatorProps {
  className?: string;
  showDescription?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const TeamIndicator: React.FC<TeamIndicatorProps> = ({ 
  className = '',
  showDescription = false,
  size = 'md'
}) => {
  const { teamConfig } = useTeam();

  const sizeClasses = {
    sm: 'text-sm px-3 py-1',
    md: 'text-base px-4 py-2',
    lg: 'text-lg px-6 py-3'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`inline-flex items-center gap-2 rounded-full font-bold text-white shadow-lg ${sizeClasses[size]} ${className}`}
      style={{ backgroundColor: teamConfig.colors.primary }}
    >
      <div 
        className="w-3 h-3 rounded-full"
        style={{ backgroundColor: teamConfig.colors.accent }}
      />
      <div className="flex flex-col">
        <span>{teamConfig.name}</span>
        {showDescription && (
          <span className="text-xs opacity-90 font-normal">
            {teamConfig.description}
          </span>
        )}
      </div>
    </motion.div>
  );
};

export default TeamIndicator;