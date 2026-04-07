import React from 'react';
import PropTypes from 'prop-types';

export const GamifiedButton = ({ children, onClick, variant, disabled, fullWidth }) => {
  // Core styling providing the 3D 'push-down' look
  const baseStyles = "relative font-bold uppercase tracking-wider rounded-2xl transition-all duration-150 transform active:translate-y-1 block select-none border-b-4 focus:outline-none";
  
  const variants = {
    primary: "bg-brand-light border-brand-dark text-white hover:bg-[#61E002] active:border-b-0 active:mt-1",
    secondary: "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-750 active:border-b-0 active:mt-1",
    danger: "bg-red-500 border-red-700 text-white hover:bg-red-400 active:border-b-0 active:mt-1",
  };

  const selectedVariant = variants[variant] || variants.primary;
  
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseStyles} 
        ${selectedVariant} 
        ${fullWidth ? 'w-full px-6 py-4' : 'px-8 py-3'}
        ${disabled ? 'opacity-50 cursor-not-allowed transform-none border-b-0 mt-1' : ''}
      `}
    >
      {children}
    </button>
  );
};

GamifiedButton.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger']),
  disabled: PropTypes.bool,
  fullWidth: PropTypes.bool,
};

GamifiedButton.defaultProps = {
  onClick: () => {},
  variant: 'primary',
  disabled: false,
  fullWidth: false,
};
