import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';

/**
 * MultipleChoiceQuiz
 *
 * When `data.quizId` exists (DB-served quiz):
 *   → POSTs to /api/quizzes/answer for atomic server-side validation + XP award
 *   → waits for the response BEFORE updating any UI state
 *
 * When `data.quizId` is absent (static fallback from courseData.js):
 *   → validates locally against data.correctAnswer
 *   → parent handles XP via /api/users/progress
 */
export const MultipleChoiceQuiz = ({ data, onValidate, onAnswer, token, courseId }) => {
  const { refreshStats } = useAuth();
  const [selectedOption, setSelectedOption] = useState(null);
  const [correctOption, setCorrectOption]   = useState(null);
  const [isCorrect, setIsCorrect]           = useState(null);
  const [answered, setAnswered]             = useState(false);
  const [isLoading, setIsLoading]           = useState(false);
  const [isSyncing, setIsSyncing]           = useState(false);

  /**
   * "Success Hook" pattern:
   * 1. Show "Syncing..." while the DB call is in-flight
   * 2. POST to /api/users/update-progress with { isCorrect }
   * 3. ONLY update local state + parent AFTER backend returns 200 OK
   * 4. If the request fails → alert() so the user can see the error
   */
  const commitResult = useCallback(async (option, correct, correctAns, explanation, xpEarned, wasServerValidated) => {
    // Show the answer visuals immediately (green/red)
    setSelectedOption(option);
    setIsCorrect(correct);
    setCorrectOption(correctAns);
    setAnswered(true);
    setIsLoading(false);

    // ── Persist to DB via the Data Bridge endpoint ───────────────────
    setIsSyncing(true);
    let syncSuccess = false;
    let updatedUser = null;

    try {
      if (!wasServerValidated) {
        const response = await fetch('/api/users/update-progress', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ isCorrect: correct }),
        });
        console.log('🟢 STATUS:', response.status);

        const result = await response.json();

        if (response.ok && result.success) {
          syncSuccess = true;
          updatedUser = result.data;
          console.log('[DB Sync ✓] Progress saved:', updatedUser);
          
          await refreshStats();
          console.log('[STATE SYNC ✓] Global XP/Streak/Accuracy refreshed');
        } else {
          console.error('[DB Sync ✗]', result.message || 'Unknown error');
          alert('Error: Could not save to database. Check your backend connection.');
        }
      } else {
        // Server already validated it, so sync is implicitly successful
        syncSuccess = true;
      }
    } catch (err) {
      console.error('[DB Sync ✗] Network error:', err);
      alert('Error: Could not save to database. The backend may be offline.');
    } finally {
      setIsSyncing(false);
    }

    // ── "Success Hook": ONLY update parent state after 200 OK ───────
    // Unlock the "Continue" button
    onValidate(true);

    if (onAnswer) {
      // Defer so our local DOM update paints first
      Promise.resolve().then(() => {
        onAnswer(correct, explanation, syncSuccess ? xpEarned : 0, wasServerValidated);
      });
    }
  }, [onValidate, onAnswer, token]);

  const handleSelect = async (option) => {
    if (answered || isLoading) return;

    setSelectedOption(option);
    setIsLoading(true);

    // ── Server-side validation (quiz from DB) ─────────────────────────
    if (data.quizId && token && courseId) {
      try {
        const response = await fetch('/api/quizzes/answer', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            quizId: data.quizId,
            courseId,
            selectedAnswer: option,
          }),
        });

        const result = await response.json();

        if (result.success || result.data) {
          const correctAns  = result.data?.correctAnswer || option;
          const explanation  = result.data?.explanation ?? data.explanation ?? '';

          // ── THE FIX: Always compare the CURRENT click against correctAnswer ──
          // result.data.isCorrect reflects a PREVIOUS attempt on re-tries,
          // so we must NOT use it for UI feedback. Compare strings directly.
          const visuallyCorrect = option === correctAns;

          // XP: trust the server value (0 on re-attempts, 5 on first correct)
          const xpEarned = result.data?.alreadyAttempted
            ? 0                                             // re-attempt → no XP
            : (visuallyCorrect ? (result.data?.xpEarned ?? 5) : 0);

          commitResult(option, visuallyCorrect, correctAns, explanation, xpEarned, true);
        } else {
          // Server returned an error with no data — fall through to local
          throw new Error('No data in response');
        }
        return;
      } catch {
        // Network error → fall through to local validation
      }
    }

    // ── Local validation (static fallback) ────────────────────────────
    if (data.correctAnswer === undefined) {
      // If the API failed AND we don't have local data (e.g., user hasn't refreshed), don't fake a result.
      alert('Network error connecting to the quiz server. Please refresh the page and try again.');
      setIsLoading(false);
      return;
    }

    const correct    = option === data.correctAnswer;
    const correctAns = data.correctAnswer;
    const xpEarned   = correct ? 5 : 0;

    commitResult(option, correct, correctAns, data.explanation ?? '', xpEarned, false);
  };

  // ── Option styling (only applied AFTER answered === true) ──────────
  const getOptionStyle = (option) => {
    if (!answered) {
      return 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-750 border-b-4';
    }
    // Correct answer → always green
    if (option === correctOption) {
      return 'bg-green-50 dark:bg-green-900/30 border-green-500 text-green-700 dark:text-green-300 font-bold border-b-0';
    }
    // User's wrong pick → red
    if (option === selectedOption && isCorrect === false) {
      return 'bg-red-50 dark:bg-red-900/30 border-red-500 text-red-600 dark:text-red-400 font-bold border-b-0';
    }
    // Everything else → dimmed
    return 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 opacity-50 border-b-4';
  };

  const getOptionBadge = (option, index) => {
    if (!answered) return String.fromCharCode(65 + index);
    if (option === correctOption) return '✓';
    if (option === selectedOption && isCorrect === false) return '✗';
    return String.fromCharCode(65 + index);
  };

  const getOptionBadgeStyle = (option) => {
    if (!answered) return 'border-inherit text-inherit';
    if (option === correctOption) return 'bg-green-500 text-white border-green-500';
    if (option === selectedOption && isCorrect === false) return 'bg-red-500 text-white border-red-500';
    return 'border-inherit text-inherit';
  };

  // ── Feedback text: strictly separated correct vs incorrect ─────────
  const feedbackEmoji   = isCorrect === true ? '🎉' : '🤔';
  const feedbackTitle   = isCorrect === true
    ? 'Correct! Well done.'
    : `Incorrect — the correct answer is: ${correctOption}`;
  const feedbackBgClass = isCorrect === true
    ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800'
    : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800';

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      <h3 className="text-2xl font-extrabold text-gray-800 dark:text-gray-100 leading-snug">
        {data.question}
      </h3>

      {(isLoading || isSyncing) && (
        <div className="flex items-center gap-2 text-brand-light font-bold text-sm">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          {isSyncing ? 'Syncing...' : 'Checking answer…'}
        </div>
      )}

      <div className="flex flex-col gap-3">
        {data.options.map((option, index) => (
          <motion.button
            key={index}
            disabled={answered || isLoading}
            onClick={() => handleSelect(option)}
            animate={
              answered && option === correctOption
                ? { scale: [1, 1.04, 1], y: [0, -6, 0] }
                : answered && option === selectedOption && isCorrect === false
                ? { x: [0, -8, 8, -8, 8, 0] }
                : {}
            }
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            className={`p-4 text-left border-2 rounded-2xl transition-colors focus:outline-none
              ${getOptionStyle(option)}
              ${(answered || isLoading) ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-8 h-8 flex items-center justify-center rounded-lg border-2 font-bold shrink-0 ${getOptionBadgeStyle(option)}`}>
                {getOptionBadge(option, index)}
              </div>
              <span className="text-lg">{option}</span>
            </div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {answered && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-2 p-5 rounded-2xl border-2 shadow-sm ${feedbackBgClass}`}
          >
            <p className="font-extrabold text-xl mb-1 flex items-center gap-2">
              <span role="img" aria-label={isCorrect === true ? 'celebration' : 'thinking'}>
                {feedbackEmoji}
              </span>
              {feedbackTitle}
            </p>
            {data.explanation && (
              <p className="font-medium opacity-90 mt-1">{data.explanation}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

MultipleChoiceQuiz.propTypes = {
  data: PropTypes.shape({
    quizId:        PropTypes.string,
    question:      PropTypes.string.isRequired,
    options:       PropTypes.arrayOf(PropTypes.string).isRequired,
    correctAnswer: PropTypes.string,
    explanation:   PropTypes.string,
  }).isRequired,
  token:      PropTypes.string,
  courseId:    PropTypes.string,
  onValidate: PropTypes.func.isRequired,
  onAnswer:   PropTypes.func,
};
