import React from 'react';

const LocationInfoDisplay = ({ locationInfo, onEditClick, hasPermission }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">拠点情報</h3>
        {hasPermission && (
          <button
            onClick={onEditClick}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            編集
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-md font-medium text-gray-700 mb-3">基本情報</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-600">拠点名</label>
              <p className="text-gray-900">{locationInfo.name || '未設定'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">施設名</label>
              <p className="text-gray-900">{locationInfo.facilityName || '未設定'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">管理者</label>
              <p className="text-gray-900">
                {locationInfo.managers && locationInfo.managers.length > 0 
                  ? locationInfo.managers.join(', ') 
                  : locationInfo.manager || '未設定'}
              </p>
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="text-md font-medium text-gray-700 mb-3">連絡先情報</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-600">住所</label>
              <p className="text-gray-900">{locationInfo.address || '未設定'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">電話番号</label>
              <p className="text-gray-900">{locationInfo.phone || '未設定'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationInfoDisplay;
