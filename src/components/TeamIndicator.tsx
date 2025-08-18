import React from 'react';
import { motion } from 'framer-motion';
import { FaHockeyPuck } from 'react-icons/fa';
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

  const iconSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`inline-flex items-center gap-2 rounded-full font-bold text-white shadow-lg mb-2 ${sizeClasses[size]} ${className}`}
      style={{ backgroundColor: teamConfig.colors.primary }}
    >
      <FaHockeyPuck 
        className={`${iconSizes[size]} flex-shrink-0`}
        style={{ color: teamConfig.colors.accent }}
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