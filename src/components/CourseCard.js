import React from 'react';

const CourseCard = ({ course }) => {
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case '初級':
        return 'bg-green-500';
      case '中級':
        return 'bg-orange-500';
      case '上級':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg transition-all duration-200 hover:-translate-y-1 hover:shadow-xl flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl text-gray-800 font-semibold flex-1 mr-4">{course.title}</h3>
        <span className={`${getDifficultyColor(course.difficulty)} text-white px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0`}>
          {course.difficulty}
        </span>
      </div>
      
      <p className="text-gray-600 leading-relaxed mb-6 flex-1">{course.description}</p>
      
      <div className="mb-6">
        <div className="flex flex-col gap-2">
          <span className="text-sm text-gray-600 flex items-center gap-2">👨‍🏫 {course.instructor}</span>
          <span className="text-sm text-gray-600 flex items-center gap-2">⏱️ {course.duration}</span>
          <span className="text-sm text-gray-600 flex items-center gap-2">📚 {course.lessons} レッスン</span>
        </div>
      </div>

      {course.enrolled ? (
        <div className="mt-auto">
          <div className="mb-4">
            <span className="text-sm text-gray-600 block mb-2">進捗: {course.progress}%</span>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300"
                style={{ width: `${course.progress}%` }}
              ></div>
            </div>
          </div>
          <button className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 px-4 font-medium rounded-lg transition-all duration-200 hover:from-indigo-600 hover:to-purple-700">
            続きを学習
          </button>
        </div>
      ) : (
        <div className="mt-auto">
          <button className="w-full bg-green-500 text-white py-3 px-4 font-medium rounded-lg transition-all duration-200 hover:bg-green-600">
            コースに参加
          </button>
        </div>
      )}
    </div>
  );
};

export default CourseCard; 