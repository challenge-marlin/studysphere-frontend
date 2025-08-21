import React, { useState } from 'react';
import { isTeacherManager } from '../utils/locationUtils';

const ManagerSettings = ({ 
  instructors, 
  locationInfo, 
  onUpdateManagerSettings, 
  onCancel, 
  loading 
}) => {
  const [selectedManagers, setSelectedManagers] = useState(() => {
    // 現在の管理者IDを初期値として設定
    const currentManagers = [];
    instructors.forEach(instructor => {
      if (isTeacherManager(instructor.id, instructors, locationInfo)) {
        currentManagers.push(instructor.id);
      }
    });
    return currentManagers;
  });

  const handleManagerToggle = (instructorId) => {
    setSelectedManagers(prev => {
      if (prev.includes(instructorId)) {
        return prev.filter(id => id !== instructorId);
      } else {
        return [...prev, instructorId];
      }
    });
  };

  const handleSubmit = () => {
    onUpdateManagerSettings(selectedManagers);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">管理者設定</h3>
          
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-3">
              管理者として設定する指導者を選択してください
            </p>
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {instructors.map((instructor) => (
                <label key={instructor.id} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedManagers.includes(instructor.id)}
                    onChange={() => handleManagerToggle(instructor.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-900">
                      {instructor.name}
                    </span>
                    <span className="text-xs text-gray-500 block">
                      {instructor.email}
                    </span>
                  </div>
                </label>
              ))}
            </div>
            
            {instructors.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                指導者が登録されていません
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              disabled={loading}
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? '更新中...' : '更新'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerSettings;
