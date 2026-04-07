import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import { FeedSkeleton } from './SkeletonLoaders';

export const StudyFeed = () => {
  const { token, user: currentUser } = useAuth();
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  
  // Custom Interaction Observer natively wiring an Infinite Scrolling hook organically
  const observer = useRef();
  const lastPostElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      // If user scrolls exactly to the bottom card marker, trigger backend query page++
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    }, { threshold: 0.5 }); // Fire exactly when the card is 50% exposed

    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  useEffect(() => {
    const fetchFeed = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const response = await axios.get(`/api/feed?page=${page}&limit=10`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.success) {
          const newPosts = response.data.data;
          setPosts(prev => [...prev, ...newPosts]);
          setHasMore(response.data.pagination.hasNextPage);
        }
      } catch (error) {
        console.error("Feed fetch failed", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeed();
  }, [token, page]);

  const handleCheer = async (postId) => {
    try {
      // Optimistic UI Update: React instantly to remove lag!
      setPosts(prevPosts => prevPosts.map(post => {
        if (post._id === postId) {
          const alreadyCheered = post.cheers?.includes(currentUser._id);
          return {
            ...post,
            cheers: alreadyCheered 
              ? post.cheers.filter(id => id !== currentUser._id)                // Pull
              : [...(post.cheers || []), currentUser._id],                      // Push
            cheerCount: alreadyCheered ? post.cheerCount - 1 : post.cheerCount + 1
          };
        }
        return post;
      }));

      // Background strict API request syncing DB logic
      await axios.put(`/api/feed/${postId}/cheer`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
       console.error("Failed to sync Cheer", error);
    }
  };

  const getEventIcon = (type) => {
    switch(type) {
      case 'streak_milestone': return '🔥';
      case 'badge_earned': return '🏆';
      case 'course_completed': return '🎓';
      default: return '🎉';
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full">
      {posts.map((post, index) => {
        const isLastPost = posts.length === index + 1;
        const hasCheered = post.cheers?.includes(currentUser?._id);

        return (
          <div 
            ref={isLastPost ? lastPostElementRef : null} // Attach sentinel ref conditionally
            key={post._id}
            className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] border-2 border-gray-200 dark:border-gray-700 shadow-sm animate-slideUp text-gray-900 dark:text-gray-100"
          >
            {/* Header: User Info */}
            <div className="flex items-center gap-4 mb-4 border-b-2 border-gray-100 dark:border-gray-700 pb-4">
              <img 
                src={post.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.user?.username}`} 
                alt="Avatar" 
                className="w-14 h-14 rounded-full border-4 border-gray-100 dark:border-gray-700 bg-brand-light/10"
              />
              <div className="flex flex-col">
                <span className="font-extrabold text-lg leading-tight">{post.user?.username}</span>
                <span className="text-gray-500 dark:text-gray-400 font-bold text-xs uppercase tracking-widest">
                  Level {Math.floor(Math.sqrt((post.user?.totalXP || 0) / 100)) + 1}
                </span>
              </div>
              <span className="text-gray-400 text-sm font-bold ml-auto self-start bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-xl">
                 {new Date(post.createdAt).toLocaleDateString()}
              </span>
            </div>

            {/* Main Content Body */}
            <div className="flex gap-4 items-center mb-6 py-2 bg-gray-50 dark:bg-gray-750 p-4 rounded-xl">
              <div className="text-5xl drop-shadow-md">
                 {getEventIcon(post.type)}
              </div>
              <p className="text-xl font-bold text-gray-800 dark:text-gray-100 leading-snug">
                {post.content}
              </p>
            </div>

            {/* Interaction Bar */}
            <div className="flex items-center justify-between mt-2">
              <button 
                onClick={() => handleCheer(post._id)}
                className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-extrabold uppercase tracking-wide text-sm transition-all transform active:scale-95 ${
                  hasCheered 
                    ? 'bg-brand-light/20 text-brand-dark dark:text-brand-light border-2 border-brand-light/50' 
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 border-2 border-transparent'
                }`}
              >
                <span className={hasCheered ? 'animate-bounce' : ''}>👏</span> 
                {hasCheered ? 'Cheered' : 'Cheer'} ({post.cheerCount || 0})
              </button>
            </div>
          </div>
        );
      })}
      
      {/* Dynamic Skeletons append specifically while infinite scrolling is locked fetching */}
      {loading && <FeedSkeleton />}
      
      {!loading && !hasMore && posts.length > 0 && (
         <div className="text-center p-6 text-gray-400 font-extrabold uppercase tracking-widest bg-gray-50 dark:bg-gray-900 rounded-3xl">
           You are fully caught up!
         </div>
      )}
    </div>
  );
};
