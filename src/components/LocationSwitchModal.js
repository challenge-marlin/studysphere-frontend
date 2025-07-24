import React, { useState, useEffect } from 'react';

const LocationSwitchModal = ({ isOpen, onClose, currentLocation, onLocationSelect }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);

  // モーダルが開かれたときに現在の拠点を選択状態にセット
  useEffect(() => {
    if (isOpen && currentLocation) {
      setSelectedLocation(currentLocation);
    }
  }, [isOpen, currentLocation]);

  if (!isOpen) return null;

  // LocationManagement.jsから拠点データを流用
  const mockLocations = [
    {
      id: 'office001',
      name: '東京教育渋谷校',
      type: '就労移行支援事業所',
      organization: 'スタディスフィア株式会社'
    },
    {
      id: 'office002',
      name: '東京教育新宿校',
      type: '就労継続支援A型事業所',
      organization: 'スタディスフィア株式会社'
    },
    {
      id: 'office003',
      name: '東京教育池袋校',
      type: '学習塾',
      organization: 'スタディスフィア株式会社'
    },
    {
      id: 'office004',
      name: '関西教育大阪校',
      type: '就労継続支援A型事業所',
      organization: '関西教育グループ'
    },
    {
      id: 'office005',
      name: '関西教育難波校',
      type: '就労継続支援B型事業所',
      organization: '関西教育グループ'
    }
  ];

  // 組織でグループ化
  const groupedLocations = mockLocations.reduce((acc, location) => {
    if (!acc[location.organization]) {
      acc[location.organization] = [];
    }
    acc[location.organization].push(location);
    return acc;
  }, {});

  const handleConfirm = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">作業を行う拠点・業態を選択してください</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <div>
              <div className="text-sm text-indigo-700 font-medium">現在作業中の拠点</div>
              <div className="text-lg font-bold text-indigo-900">{currentLocation?.name || '未選択'}</div>
              <div className="text-sm text-indigo-600">{currentLocation?.organization || ''}</div>
            </div>
          </div>
        </div>
        
        <div className="space-y-6 mb-6">
          {Object.entries(groupedLocations).map(([organization, locations]) => (
            <div key={organization} className="space-y-2">
              <h3 className="font-medium text-gray-700 border-b border-gray-200 pb-2">{organization}</h3>
              <div className="grid grid-cols-1 gap-2">
                {locations.map((location) => (
                  <button
                    key={location.id}
                    onClick={() => setSelectedLocation(location)}
                    className={`w-full flex items-center p-4 rounded-lg transition-all duration-200 ${
                      selectedLocation?.id === location.id
                        ? 'bg-indigo-50 border-2 border-indigo-500'
                        : 'bg-gray-50 border-2 border-transparent hover:border-indigo-200'
                    }`}
                  >
                    <div className="flex-1 flex items-center gap-3">
                      <span className="text-2xl">
                        {location.type === '学習塾' ? '📚' : 
                         location.type.includes('就労移行') ? '🏢' :
                         location.type.includes('A型') ? '🏭' :
                         location.type.includes('B型') ? '🏗️' : '🏫'}
                      </span>
                      <div className="text-left">
                        <div className="font-medium text-gray-800">{location.name}</div>
                        <div className="text-sm text-gray-600">{location.type}</div>
                      </div>
                    </div>
                    <div className={`flex items-center justify-center w-6 h-6 rounded-full border-2 ml-4 ${
                      selectedLocation?.id === location.id
                        ? 'border-indigo-500 bg-indigo-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedLocation?.id === location.id && (
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors duration-200"
          >
            キャンセル
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedLocation}
            className={`flex-1 py-3 px-4 font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2
              ${selectedLocation
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
          >
            この拠点で作業を開始する
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationSwitchModal; 