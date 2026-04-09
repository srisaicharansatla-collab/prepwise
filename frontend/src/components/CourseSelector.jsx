import React, { useState, useEffect } from 'react';
import { CourseViewer } from './course/CourseViewer';
import { AchievementModal } from './ui/AchievementModal';
import { GamifiedButton } from './ui/GamifiedButton';
import { getAllCourses, getCourseById, getSubtopicById, getLessonsForSubtopic } from '../data/courseData.js';
import { useAuth } from '../hooks/useAuth';

/**
 * Normalise course identifier: MongoDB courses use `_id`, static fallback uses `id`.
 */
const getCourseId = (course) => course?._id?.toString() || course?.id || null;

const CourseSelector = () => {
  const { token } = useAuth();

  const [selectedCourse,    setSelectedCourse]    = useState(null);
  const [selectedSubtopic,  setSelectedSubtopic]  = useState(null);
  const [selectedSubtopicId,setSelectedSubtopicId]= useState(null);
  const [currentLessons,    setCurrentLessons]    = useState([]);
  const [courses,           setCourses]           = useState([]);
  const [loading,           setLoading]           = useState(true);
  const [error,             setError]             = useState(null);
  const [modalOpen,         setModalOpen]         = useState(false);
  const [achievement,       setAchievement]       = useState(null);

  /* ── 1. Load courses from API (fallback to static) ─────────────── */
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('/api/courses');
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data.data) && data.data.length > 0) {
            setCourses(data.data);
            setLoading(false);
            return;
          }
        }
      } catch {
        // ignore — use static fallback
      }
      setCourses(getAllCourses());
      setLoading(false);
    };
    fetchCourses();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16 gap-3">
        <svg className="animate-spin h-8 w-8 text-brand-light" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
        <span className="text-lg font-bold text-gray-500">Loading courses…</span>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="max-w-4xl mx-auto text-center p-12 bg-white rounded-3xl shadow-lg border border-gray-200">
        <p className="text-5xl mb-4">📭</p>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">No learning paths available</h2>
        <p className="text-gray-600">Run the seeder or refresh the page.</p>
      </div>
    );
  }

  /* ── 2. Select a course ─────────────────────────────────────────── */
  const handleCourseSelect = async (courseId) => {
    setError(null);
    try {
      const response = await fetch(`/api/courses/${courseId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          setSelectedCourse(data.data);
          setSelectedSubtopic(null);
          setSelectedSubtopicId(null);
          setCurrentLessons([]);
          return;
        }
      }
    } catch {
      // fall through to static
    }
    // Static fallback (courseId might be 'cpp' or 'python')
    setSelectedCourse(getCourseById(courseId));
    setSelectedSubtopic(null);
    setSelectedSubtopicId(null);
    setCurrentLessons([]);
  };

  /* ── 3. Select a subtopic ───────────────────────────────────────── */
  const handleSubtopicSelect = async (subtopicId) => {
    setError(null);
    const resolvedCourseId = getCourseId(selectedCourse);

    // Optimistically set subtopic title from local data
    const localSubtopic = getSubtopicById(
      selectedCourse?.id || selectedCourse?._id?.toString(),
      subtopicId
    ) || { title: subtopicId };
    setSelectedSubtopic(localSubtopic);
    setSelectedSubtopicId(subtopicId);

    try {
      const response = await fetch(`/api/courses/${resolvedCourseId}/subtopic/${subtopicId}/content`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data.data) && data.data.length > 0) {
          setCurrentLessons(data.data);
          // Update subtopic title from API response
          if (data.subtopicTitle) setSelectedSubtopic({ title: data.subtopicTitle });
          return;
        }
      }
    } catch {
      // fall through to static
    }

    // Map DB course titles to static slugs
    const dbTitle = (selectedCourse?.title || '').toLowerCase();
    let staticCourseSlug = 'cpp';
    if (dbTitle.includes('python')) staticCourseSlug = 'python';
    else if (dbTitle.includes('dbms') || dbTitle.includes('database')) staticCourseSlug = 'dbms';
    else if (dbTitle.includes('os') || dbTitle.includes('operating')) staticCourseSlug = 'os';

    let staticLessons = getLessonsForSubtopic(staticCourseSlug, subtopicId);

    // If subtopicId is a MongoDB ObjectId, it won't match static slug keys (like 'dataStructures').
    // Try matching by title instead.
    if (!staticLessons || staticLessons.length === 0) {
      const courseStaticData = courseData[staticCourseSlug];
      if (courseStaticData) {
        // Find the subtopic whose title matches the selected subtopic title
        const titleToMatch = (localSubtopic?.title || '').toLowerCase().replace(/\s+/g,'');
        const matchedKey = Object.keys(courseStaticData.subtopics || {}).find(k =>
          k.toLowerCase() === titleToMatch ||
          (courseStaticData.subtopics[k]?.title || '').toLowerCase().replace(/\s+/g,'') === titleToMatch
        );
        if (matchedKey) {
          staticLessons = getLessonsForSubtopic(staticCourseSlug, matchedKey);
        }
      }
    }

    if (staticLessons && staticLessons.length > 0) {
      setCurrentLessons(staticLessons);
    } else {
      setError('Could not load subtopic content. Please try again.');
    }
  };

  const handleBackToCourses  = () => { setSelectedCourse(null);  setSelectedSubtopic(null); setCurrentLessons([]); };
  const handleBackToSubtopics= () => { setSelectedSubtopic(null); setSelectedSubtopicId(null); setCurrentLessons([]); };

  const handleLessonComplete = () => {
    setAchievement({
      title:       `${selectedSubtopic?.title || 'Subtopic'} Completed!`,
      icon:        '🎉',
      description: `Congratulations on completing ${selectedSubtopic?.title}!`,
    });
    setModalOpen(true);
    handleBackToSubtopics();
  };

  /* ── Render: Lesson player ──────────────────────────────────────── */
  if (currentLessons.length > 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <GamifiedButton onClick={handleBackToSubtopics} className="mb-4">
            ← Back to {selectedCourse?.title}
          </GamifiedButton>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-1">
            {selectedSubtopic?.title}
          </h1>
          <p className="text-gray-500">{selectedCourse?.title} · {currentLessons.length} slides</p>
        </div>

        <CourseViewer
          courseData={currentLessons}
          courseId={getCourseId(selectedCourse)}
          subtopicId={selectedSubtopicId}
          onComplete={handleLessonComplete}
          onExit={handleBackToSubtopics}
        />
      </div>
    );
  }

  let content = null;

  if (selectedCourse) {
    const subtopics = selectedCourse.subtopics
      ? Object.entries(selectedCourse.subtopics)
      : selectedCourse.modules?.map(m => [m._id.toString(), { title: m.title, lessons: m.lessons }]) || [];

    content = (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <GamifiedButton onClick={handleBackToCourses} className="mb-4">
            ← All Courses
          </GamifiedButton>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">{selectedCourse.title}</h1>
          <p className="text-gray-500 mb-6">{selectedCourse.description}</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-2xl text-red-700 font-bold">
            {error}
          </div>
        )}

        {/* Stats summary */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow p-6 mb-8 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-8 text-center">
            <div>
              <p className="text-3xl font-extrabold text-brand-light">{subtopics.length}</p>
              <p className="text-sm text-gray-500">Subtopics</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-brand-light">{subtopics.length * 12}</p>
              <p className="text-sm text-gray-500">Total Slides</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-brand-light">{subtopics.length * 6}</p>
              <p className="text-sm text-gray-500">MCQs</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subtopics.map(([key, subtopic]) => {
            const lessons   = subtopic.lessons || [];
            const quizCount = lessons.filter?.(l => l.type === 'quiz').length || 0;
            const slideCount = lessons.length || 12;
            return (
              <div
                key={key}
                className="bg-white dark:bg-gray-800 rounded-3xl shadow hover:shadow-xl transition-all cursor-pointer border-2 border-gray-200 dark:border-gray-700 hover:border-brand-light group"
                onClick={() => handleSubtopicSelect(key)}
              >
                <div className="p-6">
                  <div className="w-12 h-12 rounded-2xl bg-brand-light/10 flex items-center justify-center text-2xl mb-4 group-hover:bg-brand-light/20 transition-colors">
                    📖
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                    {subtopic.title}
                  </h3>
                  <p className="text-gray-500 text-sm mb-4">
                    {slideCount} slides · {quizCount || 6} MCQs
                  </p>
                  <div className="w-full py-2 px-4 bg-brand-light text-white font-extrabold rounded-xl text-center text-sm group-hover:bg-brand-dark transition-colors">
                    Start Module →
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  } else {
    /* ── Render: Course list ────────────────────────────────────────── */
    const courseIcons = { cpp: '⚡', python: '🐍', dbms: '🗄️', os: '💻' };

    content = (
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-brand-light tracking-tighter mb-2">Learning Paths</h1>
          <p className="text-gray-500 text-lg">Choose your journey and earn XP with every correct answer</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => {
            const id      = getCourseId(course);
            const icon    = courseIcons[id] || courseIcons[course.id] || '📚';
            // subtopicCount: handle both DB courses (modules[]) and static (subtopics{})
            const topicCount = course.modules?.length
              ?? (course.subtopics ? Object.keys(course.subtopics).length : 0);

            return (
              <div
                key={id}
                className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-gray-200 dark:border-gray-700 hover:border-brand-light transform hover:-translate-y-1 group"
                onClick={() => handleCourseSelect(id)}
              >
                <div className="p-8">
                  <div className="text-6xl mb-4">{icon}</div>
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">{course.title}</h3>
                  <p className="text-gray-500 mb-6 leading-relaxed">{course.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">{topicCount} subtopics · {topicCount * 12} slides</span>
                    <span className="bg-brand-light text-white font-extrabold px-4 py-2 rounded-xl text-sm group-hover:bg-brand-dark transition-colors">
                      Explore →
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <>
      {content}
      <AchievementModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        achievement={achievement}
        oldXP={0}
        newXP={25}
      />
    </>
  );
};

export default CourseSelector;
