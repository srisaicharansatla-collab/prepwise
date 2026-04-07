import React from 'react';
import PropTypes from 'prop-types';

export const StatCard = ({ icon: Icon, label, value, colorClass }) => {
  return (
    <div className="flex items-center gap-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className={`p-3 rounded-xl flex items-center justify-center ${colorClass || 'text-brand-light bg-brand-light/10'}`}>
        {/* Strictly mapping robust icons */}
        <Icon size={24} strokeWidth={2.5} />
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          {label}
        </span>
        <span className="text-xl font-extrabold text-gray-900 dark:text-white leading-tight">
          {value}
        </span>
      </div>
    </div>
  );
};

StatCard.propTypes = {
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  colorClass: PropTypes.string,
};
