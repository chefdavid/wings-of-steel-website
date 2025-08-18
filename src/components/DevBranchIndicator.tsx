import { useState, useEffect } from 'react';

const DevBranchIndicator = () => {
  const [branch, setBranch] = useState<string>('');
  
  useEffect(() => {
    // Only show in development
    if (import.meta.env.DEV) {
      // Get branch from environment variable or default
      const currentBranch = import.meta.env.VITE_GIT_BRANCH || 'master';
      setBranch(currentBranch);
    }
  }, []);

  // Only render in development mode
  if (!import.meta.env.DEV || !branch) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-black/90 backdrop-blur-sm border border-steel-blue/50 rounded-lg px-3 py-2 shadow-lg">
      <div className="flex items-center gap-2 text-xs">
        <svg className="w-4 h-4 text-steel-blue" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5 3.5a1.5 1.5 0 113 0V5a3 3 0 016 0v1.5a1.5 1.5 0 113 0V8a5 5 0 01-10 0V6.5zm3.5 4.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm5 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" clipRule="evenodd" />
        </svg>
        <span className="text-ice-blue font-mono">
          Branch: <span className="font-bold text-white">{branch}</span>
        </span>
      </div>
    </div>
  );
};

export default DevBranchIndicator;