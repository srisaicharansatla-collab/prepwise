import React, { useState, useEffect } from 'react';
import { CourseViewer } from './course/CourseViewer';
import { AchievementModal } from './ui/AchievementModal';
import { GamifiedButton } from './ui/GamifiedButton';
import { getAllCourses, getCourseById, getSubtopicById, getLessonsForSubtopic } from '../data/courseData.js';

const CourseSelector = () => {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedSubtopic, setSelectedSubtopic] = useState(null);
  const [selectedSubtopicId, setSelectedSubtopicId] = useState(null);
  const [currentLessons, setCurrentLessons] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [achievement, setAchievement] = useState(null);

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
      } catch (err) {
        // ignore and use static fallback
      }

      setCourses(getAllCourses());
      setLoading(false);
    };
    fetchCourses();
  }, []);

  if (loading) return <div className="text-center p-8">Loading courses...</div>;

  if (!loading && courses.length === 0) {
    return (
      <div className="max-w-4xl mx-auto text-center p-12 bg-white rounded-3xl shadow-lg border border-gray-200">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">No learning paths available</h2>
        <p className="text-gray-600">A strong, interactive learning path should be ready here. Please refresh or open the app again.</p>
      </div>
    );
  }

  const handleCourseSelect = async (courseId) => {
    try {
      const response = await fetch(`/api/courses/${courseId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          setSelectedCourse(data.data);
        } else {
          setSelectedCourse(getCourseById(courseId));
        }
      } else {
        setSelectedCourse(getCourseById(courseId));
      }
    } catch (err) {
      setSelectedCourse(getCourseById(courseId));
    }
    setSelectedSubtopic(null);
    setSelectedSubtopicId(null);
    setCurrentLessons([]);
  };

  const handleSubtopicSelect = async (subtopicId) => {
    try {
      const response = await fetch(`/api/courses/${selectedCourse.id}/subtopic/${subtopicId}/lessons`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data.data) && data.data.length > 0) {
          setCurrentLessons(data.data);
        } else {
          setCurrentLessons(getLessonsForSubtopic(selectedCourse.id, subtopicId));
        }
      } else {
        setCurrentLessons(getLessonsForSubtopic(selectedCourse.id, subtopicId));
      }
    } catch (err) {
      setCurrentLessons(getLessonsForSubtopic(selectedCourse.id, subtopicId));
    }

    setSelectedSubtopic(getSubtopicById(selectedCourse.id, subtopicId));
    setSelectedSubtopicId(subtopicId);
  };

  const handleBackToCourses = () => {
    setSelectedCourse(null);
    setSelectedSubtopic(null);
    setCurrentLessons([]);
  };

  const handleBackToSubtopics = () => {
    setSelectedSubtopic(null);
    setSelectedSubtopicId(null);
    setCurrentLessons([]);
  };

  const handleLessonComplete = () => {
    setAchievement({
      title: `${selectedSubtopic?.title} Completed!`,
      icon: "🎉",
      description: `Congratulations on completing ${selectedSubtopic?.title}!`
    });
    setModalOpen(true);
  };

  if (currentLessons.length > 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <GamifiedButton onClick={handleBackToSubtopics} className="mb-4">
            ← Back to {selectedCourse.title}
          </GamifiedButton>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{selectedSubtopic.title}</h1>
          <p className="text-gray-600">{selectedCourse.title} • {selectedSubtopic.title}</p>
        </div>

        <CourseViewer
          courseData={currentLessons}
          courseId={selectedCourse.id}
          subtopicId={selectedSubtopicId}
          onComplete={handleLessonComplete}
          onExit={handleBackToSubtopics}
        />

        <AchievementModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          achievement={achievement}
          oldXP={100}
          newXP={120}
        />
      </div>
    );
  }

  if (selectedCourse) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <GamifiedButton onClick={handleBackToCourses} className="mb-4">
            ← Back to All Courses
          </GamifiedButton>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{selectedCourse.title}</h1>
          <p className="text-gray-600 mb-6">{selectedCourse.description}</p>
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-6 mb-8 border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-brand-light font-bold">Learning Path</p>
              <h2 className="text-3xl font-black text-gray-900 mt-2">{selectedCourse.title}</h2>
              <p className="text-gray-600 mt-2">{selectedCourse.description}</p>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center sm:text-right">
              <div>
                <p className="text-2xl font-extrabold text-brand-light">{selectedCourse.subtopics ? Object.keys(selectedCourse.subtopics).length : 0}</p>
                <p className="text-sm text-gray-500">Subtopics</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-brand-light">{selectedCourse.subtopics ? Object.values(selectedCourse.subtopics).reduce((sum, module) => sum + (module.lessons?.length || 0), 0) : 0}</p>
                <p className="text-sm text-gray-500">Total Slides</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-brand-light">{selectedCourse.subtopics ? Math.round(Object.values(selectedCourse.subtopics).reduce((sum, module) => sum + (module.lessons?.length || 0), 0) / Object.keys(selectedCourse.subtopics).length) : 0}</p>
                <p className="text-sm text-gray-500">Avg per Topic</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {selectedCourse.subtopics ? Object.entries(selectedCourse.subtopics).map(([key, subtopic]) => {
            const lessonCount = subtopic.lessons ? subtopic.lessons.length : 0;
            const quizCount = subtopic.lessons ? subtopic.lessons.filter(item => item.type === 'quiz').length : 0;
            const conceptCount = lessonCount - quizCount;
            return (
              <div
                key={key}
                className="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer border border-gray-200 hover:border-brand-light"
                onClick={() => handleSubtopicSelect(key)}
              >
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{subtopic.title}</h3>
                  <p className="text-gray-500 text-sm mb-4">{conceptCount} concept slides · {quizCount} questions</p>
                  <div className="flex items-center justify-between mt-6">
                    <span className="text-sm text-gray-600">{lessonCount} total slides</span>
                    <GamifiedButton className="w-full ml-3 py-2">
                      Start Module
                    </GamifiedButton>
                  </div>
                </div>
              </div>
            );
          }) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-brand-light tracking-tighter mb-4">Learning Paths</h1>
        <p className="text-gray-600 text-lg">Choose your learning journey and master new skills</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 hover:border-brand-light transform hover:-translate-y-1"
            onClick={() => handleCourseSelect(course.id)}
          >
            <div className="p-8">
              <div className="text-6xl mb-4">
                {course.id === 'cpp' && '⚡'}
                {course.id === 'python' && '🐍'}
                {course.id === 'dbms' && '🗄️'}
                {course.id === 'os' && '💻'}
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">{course.title}</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">{course.description}</p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-gray-500">
                  {course.subtopics ? Object.keys(course.subtopics).length : 0} subtopics · 10-15 slides each
                </div>
                <GamifiedButton>
                  Explore Course
                </GamifiedButton>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseSelector;
