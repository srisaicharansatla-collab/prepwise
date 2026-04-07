import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';

export const MultipleChoiceQuiz = ({ data, onValidate, onAnswer }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [answered, setAnswered] = useState(false);

  const handleSelect = (option) => {
    // Prevent changing answer if they already answered
    if (answered) return;

    setSelectedOption(option);
    setAnswered(true);

    // Validate inherently against data block
    const correct = option === data.correctAnswer;
    setIsCorrect(correct);

    // Signal parent to unlock "Next" button for non-quiz content
    onValidate(true);

    // Call onAnswer callback for quiz-specific handling (animations, XP)
    if (onAnswer) {
      onAnswer(correct);
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
              stateStyle = "bg-green-50 dark:bg-green-900/30 border-green-500 text-green-700 dark:text-green-300 font-bold border-b-0";
            } else {
              stateStyle = "bg-red-50 dark:bg-red-900/30 border-red-500 text-red-600 dark:text-red-400 font-bold border-b-0";
            }
          }

          // Disable all buttons after answering
          const isDisabled = answered;

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
              className={`p-4 text-left border-2 rounded-2xl transition-colors focus:outline-none ${stateStyle} ${isDisabled ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-8 h-8 flex items-center justify-center rounded-lg border-2 text-inherit font-bold shrink-0 ${
                  selectedOption === option && isCorrect
                    ? 'bg-green-500 text-white border-green-500'
                    : selectedOption === option && isCorrect === false
                    ? 'bg-red-500 text-white border-red-500'
                    : 'border-inherit'
                }`}>
                  {String.fromCharCode(65 + index)}
                </div>
                <span className="text-lg">{option}</span>
              </div>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {answered && data.explanation && (
          <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className={`mt-2 p-5 rounded-2xl border-2 shadow-sm ${
               isCorrect
                 ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800'
                 : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800'
             }`}
          >
            <p className="font-extrabold text-xl mb-1 flex items-center gap-2">
              <span role="img" aria-label={isCorrect ? "party" : "thinking"}>{isCorrect ? '🎉' : '🤔'}</span>
              {isCorrect ? 'Correct!' : 'Incorrect!'}
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
  onAnswer: PropTypes.func,
};
