import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Outlet } from 'react-router-dom';
import { Leaderboard } from './components/social/Leaderboard';
import { StudyFeed } from './components/social/StudyFeed';
import { CourseViewer } from './components/course/CourseViewer';
import { AchievementModal } from './components/ui/AchievementModal';
import { useAuth } from './hooks/useAuth';

const Layout = () => {
  const { user, level, logout } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-brand-bg text-gray-900 dark:text-gray-100 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <nav className="w-full md:w-64 bg-white dark:bg-gray-900 border-b-2 md:border-b-0 md:border-r-2 border-gray-200 dark:border-gray-800 p-6 flex flex-col justify-between shrink-0">
        <div>
          <h1 className="text-3xl font-black text-brand-light tracking-tighter mb-8">PrepWise</h1>
          <ul className="space-y-4 font-bold text-lg text-gray-500 dark:text-gray-400">
            <li>
              <Link to="/" className="flex items-center gap-3 hover:text-gray-900 dark:hover:text-white transition-colors">
                <span className="text-2xl">🏠</span> Dashboard
              </Link>
            </li>
            <li>
              <Link to="/learn" className="flex items-center gap-3 hover:text-gray-900 dark:hover:text-white transition-colors">
                <span className="text-2xl">📚</span> Learn
              </Link>
            </li>
          </ul>
        </div>
        
        {/* User Stats Summary in Sidebar */}
        {user && (
          <div className="mt-8 pt-6 border-t-2 border-gray-100 dark:border-gray-800">
             <div className="flex items-center gap-3 mb-4">
                <img src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} className="w-12 h-12 rounded-full border-2 border-gray-200 dark:border-gray-700" alt="Avatar"/>
                <div>
                   <p className="font-extrabold pb-0 mb-0 leading-none">{user.username}</p>
                   <p className="text-sm font-bold text-brand-light">Level {level}</p>
                </div>
             </div>
             <button onClick={logout} className="text-sm font-bold text-gray-400 hover:text-red-500 uppercase tracking-widest transition-colors">Sign Out</button>
          </div>
        )}
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
         <Outlet />
      </main>
    </div>
  );
};

// Dummy lesson data mapping exactly what AI would yield
const demoLessonData = [
  { id: 1, type: 'text', content: 'Welcome to React Architecture. Today we cover Props.' },
  { id: 2, type: 'code', language: 'javascript', content: 'const App = ({ title }) => <h1>{title}</h1>;' },
  { id: 3, type: 'quiz', question: 'What passes data downwards in React?', options: ['State', 'Props', 'Redux', 'Context'], correctAnswer: 'Props', explanation: 'Props strictly pass data downwards mimicking waterfalls.'}
];

const App = () => {
  const [modalOpen, setModalOpen] = React.useState(false);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Dashboard Route (Leaderboard + Feed) */}
          <Route index element={
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <StudyFeed />
              </div>
              <div className="lg:col-span-1">
                <Leaderboard />
              </div>
            </div>
          } />

          {/* Dedicated Learning Player Route */}
          <Route path="learn" element={
            <div className="flex justify-center w-full">
               <CourseViewer 
                 courseData={demoLessonData}
                 onComplete={() => setModalOpen(true)}
                 onExit={() => alert('Exit clicked! Routing back to dashboard.')}
               />
               <AchievementModal 
                 isOpen={modalOpen}
                 onClose={() => setModalOpen(false)}
                 achievement={{ title: "Lesson Conquered", icon: "🧠" }}
                 oldXP={150}
                 newXP={160}
               />
            </div>
          } />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
