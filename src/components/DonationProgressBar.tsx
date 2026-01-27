import { motion } from 'framer-motion';
import { useDonationGoals } from '../hooks/useDonationGoals';

interface DonationProgressBarProps {
  mode?: 'compact' | 'full' | 'floating';
  showDetails?: boolean;
  className?: string;
}

const DonationProgressBar = ({ 
  mode = 'compact', 
  showDetails = true,
  className = '' 
}: DonationProgressBarProps) => {
  const { activeGoal, loading } = useDonationGoals();

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-4 bg-gray-300 rounded w-full"></div>
      </div>
    );
  }

  if (!activeGoal) {
    return null; // No active goal to display
  }

  const {
    current_amount,
    target_amount,
    percentage_complete,
    days_remaining,
    goal_name,
    goal_type
  } = activeGoal;

  const formattedCurrent = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(current_amount);

  const formattedTarget = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(target_amount);

  const percentage = Math.min(percentage_complete, 100);

  // Compact mode (for hero section)
  if (mode === 'compact') {
    return (
      <div className={`${className}`}>
        {showDetails && (
          <div className="flex justify-between items-center mb-2 text-sm">
            <span className="text-gray-200">
              {goal_name}
            </span>
            <span className="text-yellow-400 font-semibold">
              {formattedCurrent} of {formattedTarget}
            </span>
          </div>
        )}
        <div className="w-full bg-steel-gray/50 rounded-full h-3 overflow-hidden border border-steel-blue/30">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-yellow-400 rounded-full shadow-lg"
          />
        </div>
        {showDetails && (
          <div className="flex justify-between items-center mt-1 text-xs text-ice-blue">
            <span className="font-semibold">{percentage.toFixed(1)}% complete</span>
            {days_remaining !== null && days_remaining > 0 && (
              <span className="text-yellow-400 font-semibold">{days_remaining} days remaining</span>
            )}
          </div>
        )}
      </div>
    );
  }

  // Full mode (for donation modal/page)
  if (mode === 'full') {
    return (
      <div className={`bg-dark-steel backdrop-blur-sm rounded-lg p-6 border-2 border-steel-blue ${className}`}>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-xl font-sport text-white">{goal_name}</h3>
            <p className="text-sm text-ice-blue capitalize font-medium">{goal_type} Goal</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-sport text-yellow-400">{percentage.toFixed(1)}%</div>
            <div className="text-xs text-ice-blue">Complete</div>
          </div>
        </div>
        
        <div className="w-full bg-steel-gray/50 rounded-full h-5 overflow-hidden mb-4 border border-steel-blue/30">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-yellow-400 rounded-full shadow-lg"
          />
        </div>

        <div className="flex justify-between items-center text-sm">
          <div>
            <span className="text-ice-blue">Raised:</span>
            <span className="text-white font-bold ml-2 text-yellow-400">{formattedCurrent}</span>
          </div>
          <div>
            <span className="text-ice-blue">Goal:</span>
            <span className="text-white font-bold ml-2">{formattedTarget}</span>
          </div>
          {days_remaining !== null && days_remaining > 0 && (
            <div>
              <span className="text-yellow-400 font-semibold">{days_remaining} days left</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Floating mode (mini version for floating button)
  if (mode === 'floating') {
    return (
      <div className={`${className}`}>
        <div className="text-xs text-white/90 mb-1 text-center">
          {percentage.toFixed(0)}%
        </div>
        <div className="w-full bg-white/20 rounded-full h-1.5 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-yellow-400 rounded-full"
          />
        </div>
      </div>
    );
  }

  return null;
};

export default DonationProgressBar;

