import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { GamifiedButton } from '../ui/GamifiedButton';
import { ProgressBar } from '../ui/ProgressBar';
import { TextContent } from './TextContent';
import { CodeSnippet } from './CodeSnippet';
import { MultipleChoiceQuiz } from './MultipleChoiceQuiz';
import { useAuth } from '../../hooks/useAuth';

// Helper: is a string a valid MongoDB ObjectId?
const isObjectId = (str) => typeof str === 'string' && /^[0-9a-fA-F]{24}$/.test(str);

/**
 * CourseViewer — orchestrates the slide-by-slide learning flow.
 *
 * Quiz XP flow (no double-award):
 *   • If the quiz was server-validated → XP awarded inside validateQuizAnswer on backend;
 *     we only call refreshStats() to sync the UI.
 *   • If the quiz was locally validated (static fallback) → we POST to /api/users/progress
 *     to award XP, then refreshStats().
 */
export const CourseViewer = ({ courseData, courseId, subtopicId, onComplete, onExit }) => {
  const [currentIndex, setCurrentIndex]     = useState(0);
  const [isCurrentValid, setIsCurrentValid] = useState(false);
  const [updatingProgress, setUpdatingProgress] = useState(false);
  const [quizResult, setQuizResult]         = useState(null);
  const { token, refreshStats }             = useAuth();

  if (!courseData || courseData.length === 0) {
    return (
      <div className="text-center p-8 font-bold animate-pulse text-gray-500">
        Generating content…
      </div>
    );
  }

  const currentItem       = courseData[currentIndex];
  const progressPercentage = ((currentIndex + 1) / courseData.length) * 100;

  const handleValidation = (isValid) => setIsCurrentValid(isValid);

  /**
   * Called by MultipleChoiceQuiz after an answer is submitted.
   * @param {boolean} isCorrect
   * @param {string}  explanation
   * @param {number}  xpEarned       — 0 or 5 (already awarded if wasServerValidated)
   * @param {boolean} wasServerValidated — true when /api/quizzes/answer handled the XP
   */
  const handleQuizAnswer = async (isCorrect, explanation, xpEarned = 0, wasServerValidated = false) => {
    // Strictly gate XP: only show/award if the answer was actually correct
    const confirmedXP = isCorrect === true ? xpEarned : 0;

    setQuizResult({
      isCorrect: isCorrect === true,  // strict boolean — never null/undefined
      explanation,
      xpEarned: confirmedXP,
    });

    if (wasServerValidated) {
      // XP already in DB — just refresh the UI counters
      await refreshStats();
      return;
    }

    // Static / fallback quiz — award XP via /api/users/progress ONLY if correct
    if (!isObjectId(courseId) || confirmedXP === 0) return;

    setUpdatingProgress(true);
    try {
      const response = await fetch('/api/users/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          courseId,
          lessonId: currentItem.lessonId ?? null,
          xpEarned: confirmedXP,
        }),
      });
      const data = await response.json();
      if (data.success) await refreshStats();
    } catch (error) {
      console.error('Failed to update progress:', error);
    } finally {
      setUpdatingProgress(false);
    }
  };

  const handleNext = async () => {
    if (currentIndex < courseData.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsCurrentValid(false);
      setQuizResult(null);
    } else {
      // End of subtopic — award completion bonus (25 XP) if courseId is a valid ObjectId
      setUpdatingProgress(true);
      try {
        if (isObjectId(courseId)) {
          const response = await fetch('/api/users/progress', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              courseId,
              subtopicId,
              xpEarned: 25,
              isSubtopicCompletion: true,
            }),
          });
          const data = await response.json();
          if (data.success) await refreshStats();
        } else {
          await refreshStats();
        }
      } catch (error) {
        console.error('Failed to record subtopic completion:', error);
      } finally {
        setUpdatingProgress(false);
        onComplete();
      }
    }
  };

  const renderContent = () => {
    switch (currentItem.type) {
      case 'text':
        return <TextContent key={currentItem.id} data={currentItem} onValidate={handleValidation} />;
      case 'code':
        return <CodeSnippet key={currentItem.id} data={currentItem} onValidate={handleValidation} />;
      case 'quiz':
        return (
          <MultipleChoiceQuiz
            key={currentItem.id}
            data={currentItem}
            onValidate={handleValidation}
            onAnswer={handleQuizAnswer}
            token={token}
            courseId={courseId}
          />
        );
      default:
        return (
          <div className="p-4 bg-red-100 text-red-600 rounded">
            Unknown content type: {currentItem.type}
          </div>
        );
    }
  };

  return (
    <div className="max-w-3xl mx-auto w-full flex flex-col h-screen max-h-[85vh] bg-white dark:bg-brand-bg relative overflow-hidden shadow-2xl sm:rounded-3xl sm:border border-gray-100 dark:border-gray-800">

      {/* Top HUD */}
      <div className="w-full pt-6 pb-4 px-6 flex flex-col gap-4">
        <div className="flex items-center gap-6">
          <button
            onClick={onExit}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors font-extrabold text-2xl h-10 w-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Exit lesson"
          >
            ✕
          </button>
          <div className="flex-1">
            <ProgressBar progress={progressPercentage} />
          </div>
        </div>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Slide {currentIndex + 1} of {courseData.length}</span>
          <span className="font-bold text-brand-light">
            {currentItem.type === 'quiz' ? '📝 Quiz' : '📖 Lesson'}
          </span>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto w-full px-6 py-6 pb-28 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
        <div className="max-w-2xl mx-auto w-full">
          {renderContent()}
        </div>
      </div>

      {/* Quiz result banner */}
      {quizResult && (
        <div className={`mx-6 mb-2 p-4 rounded-2xl border-2 ${
          quizResult.isCorrect === true
            ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
            : 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'
        }`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{quizResult.isCorrect === true ? '🎉' : '😞'}</span>
            <span className={`font-bold text-lg ${
              quizResult.isCorrect === true ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
            }`}>
              {quizResult.isCorrect === true ? 'Correct! Well done.' : 'Incorrect. Try reviewing the slides again.'}
            </span>
            <span className={`ml-auto font-black text-xl ${
              quizResult.isCorrect === true ? 'text-green-600 dark:text-green-400' : 'text-gray-400'
            }`}>
              {quizResult.isCorrect === true ? `+${quizResult.xpEarned} XP` : '+0 XP'}
            </span>
          </div>
        </div>
      )}

      {/* Floating action bar */}
      <div className="absolute bottom-0 w-full border-t-2 border-gray-100 dark:border-gray-800 bg-white dark:bg-brand-bg px-6 py-5">
        <div className="max-w-3xl mx-auto flex justify-between items-center w-full">
          <div className="hidden sm:block text-sm font-bold text-gray-400 tracking-widest uppercase">
            {currentIndex + 1} / {courseData.length}
          </div>
          <div className="sm:w-auto w-full flex justify-end">
            <GamifiedButton
              variant={isCurrentValid ? 'primary' : 'secondary'}
              disabled={!isCurrentValid || updatingProgress}
              onClick={handleNext}
              fullWidth={window.innerWidth < 640}
            >
              {updatingProgress
                ? 'Saving…'
                : currentIndex === courseData.length - 1
                ? '🏁 Complete Subtopic'
                : 'Continue →'}
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
      id:       PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      type:     PropTypes.oneOf(['text', 'code', 'quiz']).isRequired,
      lessonId: PropTypes.string, // MongoDB Lesson _id for progress tracking
      quizId:   PropTypes.string, // MongoDB Quiz _id for server-side validation
    })
  ).isRequired,
  courseId:   PropTypes.string,
  subtopicId: PropTypes.string,
  onComplete: PropTypes.func.isRequired,
  onExit:     PropTypes.func,
};
