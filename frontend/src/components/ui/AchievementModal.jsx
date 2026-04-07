import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { AnimatedXPCounter } from './AnimatedXPCounter';

export const AchievementModal = ({ isOpen, onClose, achievement, newXP, oldXP }) => {
  const { width, height } = useWindowSize();

  return (
    <AnimatePresence>
      {isOpen && (
        <React.Fragment>
          {/* Confetti spans entirely across the viewport but stays strictly behind the Card itself */}
          <div className="fixed inset-0 z-40 pointer-events-none">
            <Confetti 
               width={width} 
               height={height} 
               recycle={false} 
               numberOfPieces={400} 
               gravity={0.15} 
               tweenDuration={5000}
            />
          </div>

          {/* Modal Background Dimmer */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 h-full"
          >
            {/* The Badge Card itself mapped to a snappy Spring Physics configuration */}
            <motion.div
              initial={{ scale: 0.5, y: 100, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: -50, opacity: 0 }}
              transition={{ type: "spring", damping: 14, stiffness: 200 }}
              className="bg-white dark:bg-gray-800 rounded-[2rem] max-w-sm w-full p-8 pb-10 shadow-2xl relative border-[5px] border-yellow-400 flex flex-col items-center text-center"
            >
              {/* Badge Icon Element with dynamic loop-rotation indicating "magic" */}
              <motion.div 
                animate={{ rotate: [0, 8, -8, 0] }}
                transition={{ duration: 0.8, delay: 0.3, repeat: Infinity, repeatDelay: 2 }}
                className="w-28 h-28 mb-6 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center text-6xl shadow-inner border-4 border-yellow-200"
              >
                {achievement?.icon || '🏆'}
              </motion.div>

              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2 uppercase tracking-wide">
                {achievement?.title || 'Achievement Unlocked!'}
              </h2>
              
              <p className="text-gray-500 dark:text-gray-300 font-bold mb-8">
                {achievement?.description || 'You are making incredible progress.'}
              </p>

              {newXP !== undefined && (
                <div className="bg-brand-light/10 text-brand-dark dark:text-brand-light py-4 px-6 rounded-2xl w-full border-2 border-brand-light/30 mb-8 flex justify-between items-center font-extrabold text-2xl">
                  <span className="uppercase tracking-widest text-sm self-center">Total XP</span>
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-500">⚡</span>
                    {/* Seamless 60FPS Roller Engine */}
                    <AnimatedXPCounter from={oldXP || 0} to={newXP} duration={2} />
                  </div>
                </div>
              )}

              <button 
                onClick={onClose}
                className="w-full bg-brand-light hover:bg-[#61E002] active:translate-y-1 active:border-b-0 border-b-4 border-brand-dark text-white font-extrabold text-lg uppercase tracking-wider py-4 rounded-2xl transition-all select-none shadow-lg focus:outline-none"
              >
                Continue Unstoppable
              </button>
            </motion.div>
          </motion.div>
        </React.Fragment>
      )}
    </AnimatePresence>
  );
};
