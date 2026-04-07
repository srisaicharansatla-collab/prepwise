import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import { LeaderboardSkeleton } from './SkeletonLoaders';

export const Leaderboard = () => {
  const { token, user: currentUser } = useAuth();
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Poll backend specifically for the Top 10 sorted XP Array once on mount
  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!token) return;
      try {
        const response = await axios.get('/api/users/leaderboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) {
          setLeaders(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch leaderboard telemetry", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [token]);

  if (loading) return <LeaderboardSkeleton />;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-[2rem] border-2 border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden animate-fadeIn text-gray-900 dark:text-gray-100">
      <div className="p-6 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center gap-3">
        <span className="text-3xl drop-shadow-sm" role="img" aria-label="trophy">🏆</span>
        <h2 className="text-2xl font-black uppercase tracking-wide">Top Scholars</h2>
      </div>
      
      <div className="p-4 flex flex-col gap-2">
        {leaders.map((user, index) => {
          const isCurrentUser = currentUser?._id === user._id;
          
          // Style Top-3 distinctively (Gold, Silver, Bronze color approximations)
          const rankColor = index === 0 ? 'text-yellow-500 text-3xl' 
                          : index === 1 ? 'text-gray-400 text-2xl' 
                          : index === 2 ? 'text-amber-600 text-2xl' 
                          : 'text-gray-500 text-xl';
          
          return (
            <div 
              key={user._id} 
              className={`flex items-center justify-between p-3 rounded-2xl transition-colors ${
                isCurrentUser 
                  ? 'bg-brand-light/10 border-2 border-brand-light' 
                  : 'hover:bg-gray-50 dark:hover:bg-gray-750 border-2 border-transparent hover:border-gray-100 dark:hover:border-gray-700'
              }`}
            >
              <div className="flex items-center gap-4">
                <span className={`font-black w-8 text-center ${rankColor}`}>
                  {index + 1}
                </span>
                
                <img 
                  src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} 
                  alt={user.username} 
                  className="w-14 h-14 rounded-full border-4 border-gray-100 dark:border-gray-700"
                />
                
                <div className="flex flex-col">
                  <span className={`font-extrabold text-lg ${isCurrentUser ? 'text-brand-dark dark:text-brand-light' : ''}`}>
                    {user.username} {isCurrentUser && '(You)'}
                  </span>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1">
                    <span className="text-orange-500">🔥</span> {user.currentStreak} Day Streak
                  </span>
                </div>
              </div>
              
              <div className="flex flex-col items-end px-2">
                <span className="font-black text-2xl leading-none tracking-tight text-gray-800 dark:text-gray-100">{user.totalXP}</span>
                <span className="text-yellow-500 font-extrabold text-sm uppercase">XP</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
