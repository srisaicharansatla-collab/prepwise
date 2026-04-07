import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';

export const MultipleChoiceQuiz = ({ data, onValidate }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);

  const handleSelect = (option) => {
    // Prevent changing answer if they already got it right (Duolingo style lock-in)
    if (isCorrect) return;

    setSelectedOption(option);
    
    // Validate inherently against data block
    if (option === data.correctAnswer) {
      setIsCorrect(true);
      onValidate(true); // Signal parent to unlock "Next" button
    } else {
      setIsCorrect(false);
      onValidate(false); // Keeps "Next" disabled
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      <h3 className="text-2xl font-extrabold text-gray-800 dark:text-gray-100 leading-snug">
        {data.question}
      </h3>
      
      <div className="flex flex-col gap-3">
        {data.options.map((option, index) => {
          let stateStyle = "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 border-b-4 hover:bg-gray-50 dark:hover:bg-gray-750";
          
          if (selectedOption === option) {
            if (isCorrect) {
              stateStyle = "bg-brand-light/10 border-brand-light text-brand-dark dark:text-brand-light font-bold border-b-0";
            } else {
              stateStyle = "bg-red-50 dark:bg-red-900/30 border-red-500 text-red-600 font-bold border-b-0";
            }
          }

          // Disable wrong buttons if user correctly guessed it already
          const isDisabled = isCorrect && selectedOption !== option;

          return (
            <motion.button
              key={index}
              disabled={isDisabled}
              onClick={() => handleSelect(option)}
              animate={
                selectedOption === option && isCorrect
                  ? { scale: [1, 1.05, 1], y: [0, -8, 0] } // Correct Answer Elastic Bounce
                  : selectedOption === option && isCorrect === false
                  ? { x: [0, -8, 8, -8, 8, 0] }            // Wrong Answer Aggressive Shake
                  : {}
              }
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className={`p-4 text-left border-2 rounded-2xl transition-colors focus:outline-none ${stateStyle} ${isDisabled ? 'opacity-40 cursor-not-allowed scale-95' : ''}`}
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 flex items-center justify-center rounded-lg border-2 border-inherit text-inherit font-bold shrink-0">
                  {String.fromCharCode(65 + index)}
                </div>
                <span className="text-lg">{option}</span>
              </div>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {isCorrect && data.explanation && (
          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="mt-2 p-5 bg-brand-light/10 text-brand-dark dark:text-brand-light rounded-2xl border-2 border-brand-light/30 shadow-sm"
          >
            <p className="font-extrabold text-xl mb-1 flex items-center gap-2">
              <span role="img" aria-label="party">🎉</span> Exactly Complete!
            </p>
            <p className="font-medium opacity-90">{data.explanation}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

MultipleChoiceQuiz.propTypes = {
  data: PropTypes.shape({
    question: PropTypes.string.isRequired,
    options: PropTypes.arrayOf(PropTypes.string).isRequired,
    correctAnswer: PropTypes.string.isRequired,
    explanation: PropTypes.string,
  }).isRequired,
  onValidate: PropTypes.func.isRequired,
};
