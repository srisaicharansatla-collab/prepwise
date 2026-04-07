import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { GamifiedButton } from '../ui/GamifiedButton';
import { ProgressBar } from '../ui/ProgressBar';
import { TextContent } from './TextContent';
import { CodeSnippet } from './CodeSnippet';
import { MultipleChoiceQuiz } from './MultipleChoiceQuiz';
import { useAuth } from '../../hooks/useAuth';

/**
 * Main Controller orchestrating the AI-generated JSON Array into a seamless "Course Player"
 */
export const CourseViewer = ({ courseData, courseId, subtopicId, onComplete, onExit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCurrentValid, setIsCurrentValid] = useState(false);
  const [updatingProgress, setUpdatingProgress] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [animationType, setAnimationType] = useState(''); // 'correct' or 'wrong'
  const [xpEarned, setXpEarned] = useState(0);
  const { refreshStats } = useAuth();

  // Safety fallback if AI fails to stream valid block formats
  if (!courseData || courseData.length === 0) {
    return <div className="text-center p-8 font-bold animate-pulse text-gray-500">Generating AI Content...</div>;
  }

  const currentItem = courseData[currentIndex];
  // Calculate Progress percentage based on the current slide index in the subtopic
  const progressPercentage = ((currentIndex + 1) / courseData.length) * 100;

  // Signal received from child components (e.g. they clicked Correct quiz option)
  const handleValidation = (isValid) => {
    setIsCurrentValid(isValid);
  };

  // Handle quiz answer with animation
  const handleQuizAnswer = async (isCorrect) => {
    const earnedXP = isCorrect ? 5 : 0;
    setXpEarned(earnedXP);
    setAnimationType(isCorrect ? 'correct' : 'wrong');
    setShowAnimation(true);

    if (isCorrect) {
      setUpdatingProgress(true);
      try {
        const response = await fetch('/api/users/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            courseId,
            lessonId: currentItem.id,
            xpEarned: earnedXP
          }),
        });
        const data = await response.json();
        if (data.success) {
          await refreshStats();
        }
      } catch (error) {
        console.error('Failed to update progress:', error);
      } finally {
        setUpdatingProgress(false);
      }
    }

    // Hide animation after 2 seconds and move to next item
    setTimeout(() => {
      setShowAnimation(false);
      setAnimationType('');
      setXpEarned(0);
      handleNext();
    }, 2000);
  };

  const handleNext = async () => {
    if (currentIndex < courseData.length - 1) {
      setCurrentIndex(prev => prev + 1);
      // Immediately lock the "Next" button again on new views until the new segment re-validates itself
      setIsCurrentValid(false);
    } else {
      // End of subtopic sequence triggered! Award completion XP
      setUpdatingProgress(true);
      try {
        const response = await fetch('/api/users/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            courseId,
            subtopicId,
            xpEarned: 25, // Bonus XP for completing subtopic
            isSubtopicCompletion: true
          }),
        });
        const data = await response.json();

        if (data.success) {
          await refreshStats();
        }
      } catch (error) {
        console.error('Failed to update subtopic progress:', error);
      } finally {
        setUpdatingProgress(false);
        onComplete();
      }
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
        return <MultipleChoiceQuiz key={currentItem.id} data={currentItem} onValidate={handleValidation} onAnswer={handleQuizAnswer} />;
      default:
        return <div className="p-4 bg-red-100 text-red-600 rounded">Error: Unknown AI content type rendered.</div>;
    }
  };

  return (
    <div className="max-w-3xl mx-auto w-full flex flex-col h-screen max-h-[85vh] bg-white dark:bg-brand-bg relative overflow-hidden shadow-2xl sm:rounded-3xl sm:border border-gray-100 dark:border-gray-800">

      {/* Top Navigation HUD: Quit Button + Progress Meter */}
      <div className="w-full pt-6 pb-4 px-6 flex flex-col gap-4">
        <div className="flex items-center gap-6">
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
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Slide {currentIndex + 1} of {courseData.length}</span>
          <span>Subtopic {subtopicId || ''}</span>
        </div>
      </div>

      {/* Primary Scrollable Educational Window */}
      <div className="flex-1 overflow-y-auto w-full px-6 py-6 pb-24 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
        <div className="max-w-2xl mx-auto w-full">
           {renderContent()}
        </div>
      </div>

      {/* Animation Overlay */}
      {showAnimation && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`text-center p-8 rounded-2xl shadow-2xl transform transition-all duration-500 ${
            animationType === 'correct'
              ? 'bg-green-500 text-white animate-bounce'
              : 'bg-red-500 text-white animate-pulse'
          }`}>
            <div className="text-6xl mb-4">
              {animationType === 'correct' ? '🎉' : '😞'}
            </div>
            <h3 className="text-2xl font-bold mb-2">
              {animationType === 'correct' ? 'Correct!' : 'Incorrect!'}
            </h3>
            <p className="text-lg">
              {animationType === 'correct'
                ? `Great job! +${xpEarned} XP earned!`
                : 'Keep trying! No XP earned this time.'
              }
            </p>
          </div>
        </div>
      )}

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
               disabled={!isCurrentValid || showAnimation}
               onClick={handleNext}
               fullWidth={window.innerWidth < 640}
             >
               {currentIndex === courseData.length - 1 ? 'Complete Subtopic' : 'Continue'}
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
