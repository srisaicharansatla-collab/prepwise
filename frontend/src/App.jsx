import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, NavLink, Outlet, Navigate } from 'react-router-dom';
import { Leaderboard } from './components/social/Leaderboard';
import { StudyFeed } from './components/social/StudyFeed';
import { AchievementModal } from './components/ui/AchievementModal';
import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AdminDashboard from './components/AdminDashboard';
import CourseSelector from './components/CourseSelector';

/* ── Sidebar navigation link that highlights itself automatically ── */
const NavItem = ({ to, icon, label }) => (
  <li>
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-lg transition-all ${
          isActive
            ? 'bg-brand-light/15 text-brand-dark dark:text-brand-light border-2 border-brand-light/30'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 border-2 border-transparent'
        }`
      }
    >
      <span className="text-2xl">{icon}</span>
      {label}
    </NavLink>
  </li>
);

/* ── Root layout (sidebar + main area) ────────────────────────────── */
const Layout = () => {
  const { user, level, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-brand-bg text-gray-900 dark:text-gray-100 flex flex-col md:flex-row">

      {/* Sidebar */}
      <nav className="w-full md:w-64 bg-white dark:bg-gray-900 border-b-2 md:border-b-0 md:border-r-2 border-gray-200 dark:border-gray-800 p-6 flex flex-col justify-between shrink-0">
        <div>
          {/* Brand */}
          <Link to="/">
            <h1 className="text-3xl font-black text-brand-light tracking-tighter mb-8 hover:opacity-80 transition-opacity">
              PrepWise
            </h1>
          </Link>

          {/* Nav links */}
          <ul className="space-y-2">
            <NavItem to="/"       icon="🏠" label="Dashboard" />
            <NavItem to="/learn"  icon="📚" label="Learn" />
            <NavItem to="/feed"   icon="👥" label="Feed" />
            {user?.role === 'admin' && (
              <NavItem to="/admin" icon="⚙️" label="Admin" />
            )}
          </ul>
        </div>

        {/* User card at bottom of sidebar */}
        {user && (
          <div className="mt-8 pt-6 border-t-2 border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-3">
              <img
                src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                className="w-12 h-12 rounded-full border-2 border-gray-200 dark:border-gray-700 shrink-0"
                alt="Avatar"
              />
              <div className="min-w-0">
                <p className="font-extrabold leading-tight truncate">{user.username}</p>
                <p className="text-sm font-bold text-brand-light">Level {level} · {user.totalXP ?? 0} XP</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="text-sm font-bold text-gray-400 hover:text-red-500 uppercase tracking-widest transition-colors"
            >
              Sign Out
            </button>
          </div>
        )}
      </nav>

      {/* Main content */}
      <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
};

/* ── Auth guard ────────────────────────────────────────────────────── */
const RequireAuth = ({ children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4 text-gray-500">
        <svg className="animate-spin h-10 w-10 text-brand-light" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
        <p className="font-bold text-lg">Loading PrepWise…</p>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

/* ── App ───────────────────────────────────────────────────────────── */
const App = () => (
  <Router>
    <Routes>
      {/* Protected routes inside Layout */}
      <Route
        path="/"
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        {/* Home → Dashboard */}
        <Route index element={<DashboardPage />} />

        {/* Social feed (separate from dashboard) */}
        <Route
          path="feed"
          element={
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <div className="lg:col-span-2"><StudyFeed /></div>
              <div className="lg:col-span-1"><Leaderboard /></div>
            </div>
          }
        />

        {/* Learning player */}
        <Route path="learn" element={<CourseSelector />} />

        {/* Admin */}
        <Route path="admin" element={<AdminDashboard />} />
      </Route>

      {/* Public auth routes */}
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  </Router>
);

export default App;
