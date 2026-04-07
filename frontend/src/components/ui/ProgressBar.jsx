import React from 'react';
import PropTypes from 'prop-types';

export const ProgressBar = ({ progress }) => {
  // Clamp progress strictly between 0 and 100 to prevent layout snapping
  const normalizedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden relative shadow-inner">
      <div 
        className="bg-brand-light h-full rounded-full transition-all duration-500 ease-out flex items-center relative"
        style={{ width: `${normalizedProgress}%` }}
      >
        {/* Subtle nice shine effect replicating 3D rendered progress bars */}
        <div className="absolute top-0 left-0 right-0 h-1/3 bg-white/30 rounded-t-full mx-2 mt-0.5"></div>
      </div>
    </div>
  );
};

ProgressBar.propTypes = {
  progress: PropTypes.number.isRequired,
};

ProgressBar.defaultProps = {
  progress: 0,
};
