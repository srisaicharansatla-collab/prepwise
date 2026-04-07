import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { GamifiedButton } from '../ui/GamifiedButton';
import { ProgressBar } from '../ui/ProgressBar';
import { TextContent } from './TextContent';
import { CodeSnippet } from './CodeSnippet';
import { MultipleChoiceQuiz } from './MultipleChoiceQuiz';

/**
 * Main Controller orchestrating the AI-generated JSON Array into a seamless "Course Player"
 */
export const CourseViewer = ({ courseData, onComplete, onExit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCurrentValid, setIsCurrentValid] = useState(false);

  // Safety fallback if AI fails to stream valid block formats
  if (!courseData || courseData.length === 0) {
    return <div className="text-center p-8 font-bold animate-pulse text-gray-500">Generating AI Content...</div>;
  }

  const currentItem = courseData[currentIndex];
  // Calculate Progress percentage based strictly on how many items we successfully cleared
  const progressPercentage = ((currentIndex) / courseData.length) * 100;

  // Signal received from child components (e.g. they clicked Correct quiz option)
  const handleValidation = (isValid) => {
    setIsCurrentValid(isValid);
  };

  const handleNext = () => {
    if (currentIndex < courseData.length - 1) {
      setCurrentIndex(prev => prev + 1);
      // Immediately lock the "Next" button again on new views until the new segment re-validates itself
      setIsCurrentValid(false); 
    } else {
      // End of Course sequence triggered! Time to mutate Backend XP logic.
      onComplete();
    }
  };

  // Node Renderer Factory - strictly maps 'type' strings from Database to correct UI Components
  const renderContent = () => {
    switch (currentItem.type) {
      case 'text':
        return <TextContent key={currentItem.id} data={currentItem} onValidate={handleValidation} />;
      case 'code':
        return <CodeSnippet key={currentItem.id} data={currentItem} onValidate={handleValidation} />;
      case 'quiz':
        return <MultipleChoiceQuiz key={currentItem.id} data={currentItem} onValidate={handleValidation} />;
      default:
        return <div className="p-4 bg-red-100 text-red-600 rounded">Error: Unknown AI content type rendered.</div>;
    }
  };

  return (
    <div className="max-w-3xl mx-auto w-full flex flex-col h-screen max-h-[85vh] bg-white dark:bg-brand-bg relative overflow-hidden shadow-2xl sm:rounded-3xl sm:border border-gray-100 dark:border-gray-800">
      
      {/* Top Navigation HUD: Quit Button + Progress Meter */}
      <div className="w-full pt-6 pb-4 px-6 flex items-center gap-6">
        <button 
          onClick={onExit} 
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors font-extrabold text-2xl h-10 w-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Exit Lesson"
        >
          X
        </button>
        <div className="flex-1">
          <ProgressBar progress={progressPercentage} />
        </div>
      </div>

      {/* Primary Scrollable Educational Window */}
      <div className="flex-1 overflow-y-auto w-full px-6 py-6 pb-24 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
        <div className="max-w-2xl mx-auto w-full">
           {renderContent()}
        </div>
      </div>

      {/* Floating Check/Continue Action Bar glued safely to the bottom edge */}
      <div className="absolute bottom-0 w-full border-t-2 border-gray-100 dark:border-gray-800 bg-white dark:bg-brand-bg px-6 py-5">
        <div className="max-w-3xl mx-auto flex justify-between items-center w-full">
          {/* Subtle location tracker */}
          <div className="hidden sm:block text-sm font-bold text-gray-400 tracking-widest uppercase">
            Segment {currentIndex + 1} / {courseData.length}
          </div>
          
          <div className="sm:w-auto w-full flex justify-end">
             <GamifiedButton 
               variant={isCurrentValid ? 'primary' : 'secondary'} 
               disabled={!isCurrentValid} 
               onClick={handleNext}
               fullWidth={window.innerWidth < 640} // Auto-expand button entirely on mobile viewports
             >
               {currentIndex === courseData.length - 1 ? 'Finish Lesson' : 'Continue'}
             </GamifiedButton>
          </div>
        </div>
      </div>

    </div>
  );
};

CourseViewer.propTypes = {
  courseData: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      type: PropTypes.oneOf(['text', 'code', 'quiz']).isRequired,
    })
  ).isRequired,
  onComplete: PropTypes.func.isRequired,
  onExit: PropTypes.func,
};
