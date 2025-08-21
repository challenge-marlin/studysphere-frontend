import React from 'react';

const LocationStats = ({ locationInfo }) => {
  // 学習可能状況の判定
  const isOverCapacity = locationInfo.currentStudents > locationInfo.maxStudents;
  const capacityPercentage = locationInfo.maxStudents > 0 ? (locationInfo.currentStudents / locationInfo.maxStudents) * 100 : 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">拠点統計</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 現在の受講生数 */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">現在の受講生数</p>
              <p className="text-2xl font-bold text-blue-800">
                {locationInfo.currentStudents}
              </p>
            </div>
            <div className="text-blue-400">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* 最大受講生数 */}
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">最大受講生数</p>
              <p className="text-2xl font-bold text-green-800">
                {locationInfo.maxStudents}
              </p>
            </div>
            <div className="text-green-400">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        {/* 指導者数 */}
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">指導者数</p>
              <p className="text-2xl font-bold text-purple-800">
                {locationInfo.instructorCount}
              </p>
            </div>
            <div className="text-purple-400">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* 容量使用率 */}
      <div className="mt-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">容量使用率</span>
          <span className={`text-sm font-medium ${isOverCapacity ? 'text-red-600' : 'text-gray-600'}`}>
            {capacityPercentage.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              isOverCapacity 
                ? 'bg-red-500' 
                : capacityPercentage > 80 
                  ? 'bg-yellow-500' 
                  : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(capacityPercentage, 100)}%` }}
          ></div>
        </div>
        {isOverCapacity && (
          <p className="text-sm text-red-600 mt-1">
            容量を超過しています。受講生数の調整を検討してください。
          </p>
        )}
      </div>
    </div>
  );
};

export default LocationStats;
