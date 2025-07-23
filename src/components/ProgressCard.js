import React from 'react';

const ProgressCard = ({ title, progress, totalLessons, completedLessons }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-lg transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-xl text-gray-800 font-semibold">{title}</h4>
        <span className="font-semibold text-indigo-600 text-lg">{progress}%</span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
        <div 
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <div className="text-gray-600 text-sm mb-4">
        {completedLessons} / {totalLessons} レッスン完了
      </div>
      <button className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 px-4 font-medium rounded-lg transition-all duration-200 hover:from-indigo-600 hover:to-purple-700">
        続きを学習
      </button>
    </div>
  );
};

export default ProgressCard; 