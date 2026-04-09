import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../../hooks/useAuth';

/**
 * QuizReview Component - Shows user's quiz attempts and statistics
 */
export const QuizReview = ({ courseId, courseName }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [quizData, setQuizData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuizData = async () => {
      if (!user || !courseId) return;

      try {
        const response = await fetch(`/api/quizzes/attempts/course/${courseId}`, {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setQuizData(data.data);
        } else {
          setError('Failed to load quiz data');
        }
      } catch (err) {
        setError('Failed to load quiz data');
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
  }, [courseId, user]);

  if (loading) {
    return (
      <div className="text-center p-8">
        <div className="animate-pulse text-gray-500">Loading quiz review...</div>
      </div>
    );
  }

  if (error || !quizData) {
    return (
      <div className="text-center p-8">
        <p className="text-red-500">{error || 'No quiz data available'}</p>
      </div>
    );
  }

  const { attempts, stats } = quizData;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
        Quiz Review - {courseName}
      </h2>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.totalAttempts}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Attempts</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.correctAnswers}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Correct</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-800">
          <p className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.incorrectAnswers}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Incorrect</p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{stats.accuracy}%</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Accuracy</p>
        </div>
      </div>

      {/* XP Earned */}
      <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
        <p className="text-lg font-bold text-yellow-700 dark:text-yellow-400">
          🎯 Total XP Earned from Quizzes: {stats.totalXpFromQuizzes}
        </p>
      </div>

      {/* Attempts List */}
      {attempts.length === 0 ? (
        <div className="text-center p-8 text-gray-500">
          <p>No quiz attempts yet. Start learning to earn XP!</p>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300">Recent Attempts</h3>
          {attempts.slice().reverse().map((attempt, index) => (
            <div
              key={index}
              className={`p-4 rounded-xl border-2 ${
                attempt.isCorrect
                  ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-xl">
                    {attempt.isCorrect ? '✅' : '❌'}
                  </span>
                  <span className={`font-bold ${
                    attempt.isCorrect
                      ? 'text-green-700 dark:text-green-300'
                      : 'text-red-700 dark:text-red-300'
                  }`}>
                    {attempt.isCorrect ? 'Correct' : 'Incorrect'}
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  +{attempt.xpEarned} XP
                </span>
              </div>
              {attempt.quizId && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Your answer:</strong> {attempt.selectedAnswer}
                </p>
              )}
              {attempt.quizId && attempt.quizId.explanation && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <strong>Explanation:</strong> {attempt.quizId.explanation}
                </p>
              )}
              <p className="text-xs text-gray-400 mt-2">
                {new Date(attempt.attemptedAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

QuizReview.propTypes = {
  courseId: PropTypes.string.isRequired,
  courseName: PropTypes.string.isRequired,
};

export default QuizReview;