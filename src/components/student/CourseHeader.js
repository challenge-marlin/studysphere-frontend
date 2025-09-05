import React from 'react';

const CourseHeader = ({ course }) => {
  if (!course) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-2 mb-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            コース名不明
          </h1>
          <div className="flex items-center gap-3">
            <span className="px-4 py-2 rounded-full text-sm font-semibold bg-gray-100 text-gray-800">
              カテゴリ不明
            </span>
            <span className="text-gray-500 text-sm">0レッスン</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col gap-4 mb-6">
        {/* カリキュラムパス専用カード */}
        {course.curriculum_path_name && (
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xl">📚</span>
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-purple-800 mb-2">
                  カリキュラムパス: {course.curriculum_path_name}
                </h2>
                {course.curriculum_path_description && (
                  <p className="text-purple-700 leading-relaxed">
                    {course.curriculum_path_description}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* コース情報カード */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-4">
            {course.title}
          </h1>
          
          <div className="flex items-center gap-4">
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
              course.category === '必修科目'
                ? 'bg-red-100 text-red-800'
                : 'bg-blue-100 text-blue-800'
            }`}>
              {course.category}
            </span>
            <span className="text-gray-500 text-sm">{course.total_lessons || 0}レッスン</span>
            {course.progress_percentage !== null && (
              <span className="text-gray-500 text-sm">
                進捗: {Math.round(course.progress_percentage)}%
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseHeader;
