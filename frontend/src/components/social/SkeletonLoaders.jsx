import React from 'react';

export const FeedSkeleton = () => {
  return (
    <div className="flex flex-col gap-6 w-full">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] border-2 border-gray-100 dark:border-gray-700 animate-pulse shadow-sm">
          <div className="flex items-center gap-4 mb-4 border-b-2 border-gray-100 dark:border-gray-700 pb-4">
            <div className="w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-full shrink-0" />
            <div className="flex flex-col gap-2 flex-1">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
            </div>
            <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-xl" />
          </div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-full mb-3" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5 mb-6" />
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-2xl w-32" />
        </div>
      ))}
    </div>
  );
};

export const LeaderboardSkeleton = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-[2rem] border-2 border-gray-200 dark:border-gray-700 shadow-sm animate-pulse">
       <div className="p-6 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 h-16" />
       <div className="p-4 flex flex-col gap-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-2xl border-2 border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
            </div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16" />
          </div>
        ))}
      </div>
    </div>
  );
};
