import React from 'react';

const CourseSelector = ({ courses, selectedCourse, onCourseSelect }) => {
  return (
    <div className="mb-6">
      <div className="flex flex-wrap gap-4">
        {courses.map(course => (
          <div key={course.id} className="flex flex-col">
            {/* カリキュラムパス情報 */}
            {course.curriculum_path_name && (
              <div className="mb-2">
                <div className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-100 to-purple-200 rounded-lg border border-purple-300">
                  <span className="text-purple-700 text-sm font-semibold">
                    📚 {course.curriculum_path_name}
                  </span>
                </div>
              </div>
            )}
            
            {/* コース選択ボタン */}
            <button
              className={`px-6 py-3 ${course.curriculum_path_name ? 'rounded-b-lg rounded-tr-lg' : 'rounded-t-lg'} font-semibold text-lg border-b-4 transition-all duration-200 focus:outline-none ${
                selectedCourse?.id === course.id
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white border-blue-600 shadow-lg'
                  : 'bg-gray-100 text-gray-700 border-transparent hover:bg-blue-50'
              }`}
              onClick={() => onCourseSelect(course)}
            >
              {course.title}
              <span className="ml-2 text-xs font-normal px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                {course.category}
              </span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseSelector;
