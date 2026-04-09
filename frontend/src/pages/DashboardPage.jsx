import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';

/* ─── Animated number that smoothly counts up ─── */
/* ─── Animated number that smoothly counts up ─── */
const CountUp = ({ value, duration = 1200, suffix = '' }) => {
  const [display, setDisplay] = useState(0);
  const startRef = useRef(null);

  useEffect(() => {
    let startTime;
    let isCancelled = false;

    // We animate from whatever is currently displayed to the new value
    const from = display;
    const to = value;
    if (from === to) return;

    const tick = (now) => {
      if (isCancelled) return;
      if (!startTime) startTime = now;
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
      
      setDisplay(Math.round(from + (to - from) * eased));
      
      if (progress < 1) {
        startRef.current = requestAnimationFrame(tick);
      }
    };
    
    startRef.current = requestAnimationFrame(tick);
    
    return () => {
      isCancelled = true;
      if (startRef.current) cancelAnimationFrame(startRef.current);
    };
  }, [value, duration]); // Intentionally omitting `display` from deps so it only triggers when `value` changes

  return <span>{display.toLocaleString()}{suffix}</span>;
};

/* ─── Stat Card ─── */
const StatCard = ({ icon, label, value, suffix = '', color = 'brand-light' }) => (
  <motion.div
    whileHover={{ y: -4, scale: 1.02 }}
    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
    className="bg-white dark:bg-gray-800 rounded-2xl p-5 border-2 border-gray-100 dark:border-gray-700 shadow-sm flex flex-col gap-2"
  >
    <span className="text-3xl">{icon}</span>
    <p className="text-3xl font-black text-gray-900 dark:text-white">
      <CountUp value={typeof value === 'number' ? value : 0} suffix={suffix} />
    </p>
    <p className="text-sm font-bold uppercase tracking-widest text-gray-400">{label}</p>
  </motion.div>
);

/* ─── Badge Chip ─── */
const BadgeChip = ({ badge, index }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: index * 0.08 }}
    whileHover={{ scale: 1.08 }}
    className="flex items-center gap-2 bg-brand-light/10 border-2 border-brand-light/30 rounded-2xl px-4 py-2"
  >
    <span className="text-xl">{badge.icon}</span>
    <span className="text-sm font-bold text-brand-dark dark:text-brand-light">{badge.name}</span>
  </motion.div>
);

/* ─── Course Quick-start Card ─── */
const CourseCard = ({ course }) => (
  <motion.div
    whileHover={{ y: -6, scale: 1.02 }}
    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    className="relative overflow-hidden rounded-3xl shadow-lg border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col"
  >
    {/* gradient top strip */}
    <div className={`h-2 w-full bg-gradient-to-r ${course.gradient}`} />
    <div className="p-6 flex flex-col gap-4 flex-1">
      <div className="flex items-center gap-4">
        <span className="text-5xl">{course.icon}</span>
        <div>
          <h3 className="text-xl font-black text-gray-900 dark:text-white leading-tight">{course.title}</h3>
          <p className="text-sm text-gray-500 mt-1">{course.topics} subtopics · {course.topics * 12} slides</p>
        </div>
      </div>
      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed flex-1">{course.desc}</p>
      <Link
        to="/learn"
        className="block text-center bg-brand-light hover:bg-brand-dark text-white font-extrabold rounded-xl py-3 px-6 transition-colors active:scale-95"
      >
        Start Learning →
      </Link>
    </div>
  </motion.div>
);

/* ─── Main Dashboard ─── */
const DashboardPage = () => {
  const { user, level, token } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingLB, setLoadingLB] = useState(true);

  const totalXP        = user?.totalXP ?? 0;
  const streak         = user?.currentStreak ?? 0;
  const badges         = user?.badges ?? [];
  const totalAttempted = user?.totalAttempted ?? 0;
  const accuracy       = user?.accuracyRate ?? 0;

  // Level XP thresholds: level N starts at (N-1)² × 100
  const currentLevelXP  = Math.pow(level - 1, 2) * 100;
  const nextLevelXP     = Math.pow(level, 2) * 100;
  const xpInThisLevel   = totalXP - currentLevelXP;
  const xpForThisLevel  = nextLevelXP - currentLevelXP;
  const progressPercent = xpForThisLevel > 0
    ? Math.min((xpInThisLevel / xpForThisLevel) * 100, 100)
    : 100;
  const xpToNext = Math.max(nextLevelXP - totalXP, 0);

  useEffect(() => {
    if (!token) return;
    setLoadingLB(true);
    fetch('/api/users/leaderboard', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d.success) setLeaderboard(d.data.slice(0, 5)); })
      .catch(() => {})
      .finally(() => setLoadingLB(false));
  }, [token]);

  const courses = [
    {
      id: 'cpp',
      icon: '⚡',
      title: 'C++ Programming',
      desc: 'Master syntax, OOP, pointers & memory management from beginner to advanced.',
      gradient: 'from-blue-500 to-indigo-600',
      topics: 6,
    },
    {
      id: 'python',
      icon: '🐍',
      title: 'Python Programming',
      desc: 'Data structures, functions, OOP, file I/O & modules — all in one path.',
      gradient: 'from-yellow-400 to-orange-500',
      topics: 6,
    },
  ];

  const rankMedal = (i) => ['🥇','🥈','🥉'][i] ?? `#${i + 1}`;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">

      {/* ── Hero: Avatar + XP counter ─────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl"
        style={{ background: 'linear-gradient(135deg, #131F24 0%, #1e3a2a 60%, #58CC02 160%)' }}
      >
        {/* decorative blobs */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-brand-light/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-40 h-40 rounded-full bg-brand-light/5 blur-2xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center gap-6">
          {/* Avatar */}
          <motion.img
            whileHover={{ scale: 1.05, rotate: 2 }}
            src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`}
            alt="Avatar"
            className="w-24 h-24 rounded-2xl border-4 border-brand-light shadow-lg shrink-0"
          />

          {/* Name + Level */}
          <div className="flex-1">
            <p className="text-brand-light text-sm font-bold uppercase tracking-widest mb-1">Welcome back</p>
            <h1 className="text-4xl font-black tracking-tight leading-none mb-1">{user?.username}</h1>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className="bg-brand-light text-white text-sm font-extrabold px-4 py-1 rounded-full shadow">
                Level {level}
              </span>
              {streak >= 3 && (
                <span className="bg-orange-500/20 border border-orange-400 text-orange-300 text-sm font-bold px-3 py-1 rounded-full">
                  🔥 {streak}-day streak
                </span>
              )}
              {badges.length > 0 && (
                <span className="bg-white/10 border border-white/20 text-white/80 text-sm font-bold px-3 py-1 rounded-full">
                  🏆 {badges.length} badge{badges.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          {/* Total XP counter */}
          <div className="text-right shrink-0">
            <p className="text-6xl font-black text-brand-light leading-none">
              <CountUp value={totalXP} duration={1500} />
            </p>
            <p className="text-white/60 text-sm font-bold uppercase tracking-widest mt-1">Total XP</p>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="relative mt-8">
          <div className="flex justify-between text-xs font-bold text-white/60 mb-2">
            <span>Level {level}</span>
            <span>{xpToNext > 0 ? `${xpToNext} XP to Level ${level + 1}` : 'Max level in range!'}</span>
            <span>Level {level + 1}</span>
          </div>
          <div className="h-4 bg-white/10 rounded-full overflow-hidden border border-white/20">
            <motion.div
              className="h-full rounded-full shadow-lg"
              style={{ background: 'linear-gradient(90deg, #58CC02, #89e22a)' }}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
            />
          </div>
          <div className="flex justify-between text-xs text-white/40 mt-1">
            <span>{currentLevelXP} XP</span>
            <span className="text-brand-light font-bold">{totalXP} XP</span>
            <span>{nextLevelXP} XP</span>
          </div>
        </div>
      </motion.div>

      {/* ── Stat Cards ────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatCard icon="⚡" label="Total XP"         value={totalXP}         />
        <StatCard icon="🔥" label="Day Streak"       value={streak}  suffix=" days" />
        <StatCard icon="🎯" label="Quizzes Done"     value={totalAttempted} />
        <StatCard icon="📊" label="Accuracy"         value={accuracy}        suffix="%" />
      </motion.div>

      {/* ── Courses ───────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
      >
        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-4">
          📚 Learning Paths
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map(c => <CourseCard key={c.id} course={c} />)}
        </div>
      </motion.div>

      {/* ── Badges + Leaderboard ──────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Badges */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-3xl p-6 border-2 border-gray-100 dark:border-gray-700 shadow-sm"
        >
          <h2 className="text-xl font-black text-gray-900 dark:text-white mb-4">🏆 Badges Earned</h2>
          {badges.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-5xl mb-3">🎖️</p>
              <p className="text-gray-500 font-bold">Answer quizzes correctly to earn your first badge!</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              <AnimatePresence>
                {badges.map((badge, i) => (
                  <BadgeChip key={badge.name} badge={badge} index={i} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>

        {/* Leaderboard preview */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="bg-white dark:bg-gray-800 rounded-3xl p-6 border-2 border-gray-100 dark:border-gray-700 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-gray-900 dark:text-white">🏅 Top Learners</h2>
          </div>

          {loadingLB ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : leaderboard.length === 0 ? (
            <p className="text-center text-gray-400 py-8 font-bold">No learners yet — be the first!</p>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((u, i) => {
                const isMe = u._id === user?._id;
                return (
                  <motion.div
                    key={u._id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className={`flex items-center gap-3 p-3 rounded-2xl transition-colors ${
                      isMe
                        ? 'bg-brand-light/10 border-2 border-brand-light/40'
                        : 'bg-gray-50 dark:bg-gray-700/50 border-2 border-transparent'
                    }`}
                  >
                    <span className="text-xl w-8 text-center shrink-0">{rankMedal(i)}</span>
                    <img
                      src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`}
                      className="w-9 h-9 rounded-full border-2 border-gray-200 dark:border-gray-600"
                      alt={u.username}
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`font-extrabold text-sm truncate leading-none ${isMe ? 'text-brand-dark dark:text-brand-light' : 'text-gray-800 dark:text-gray-100'}`}>
                        {u.username} {isMe && '(You)'}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">🔥 {u.currentStreak} streak</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-black text-brand-dark dark:text-brand-light text-sm">{u.totalXP.toLocaleString()}</p>
                      <p className="text-xs text-gray-400">XP</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Quick actions ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="flex flex-wrap gap-4"
      >
        <Link
          to="/learn"
          className="flex-1 min-w-[200px] flex items-center justify-center gap-3 bg-brand-light hover:bg-brand-dark text-white font-extrabold text-lg rounded-2xl py-4 px-8 shadow-lg transition-all active:scale-95"
        >
          📚 Continue Learning
        </Link>
        <Link
          to="/feed"
          className="flex-1 min-w-[200px] flex items-center justify-center gap-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 border-2 border-gray-200 dark:border-gray-600 font-extrabold text-lg rounded-2xl py-4 px-8 shadow-sm transition-all active:scale-95"
        >
          👥 Study Feed
        </Link>
      </motion.div>

    </div>
  );
};

export default DashboardPage;
