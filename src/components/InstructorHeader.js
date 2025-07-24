import React, { useState } from 'react';
import LocationSwitchModal from './LocationSwitchModal';

const InstructorHeader = ({ user, onLogout, onLocationChange }) => {
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // LocationManagement.jsのデータを基にした初期拠点情報
  const defaultLocation = {
    id: 'office001',
    name: '東京教育渋谷校',
    type: '就労移行支援事業所',
    organization: 'スタディスフィア株式会社'
  };

  // userオブジェクトから拠点情報を取得するか、デフォルト値を使用
  const currentLocation = user?.location || defaultLocation;

  return (
    <header className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white py-4 shadow-lg">
      <div className="max-w-6xl mx-auto flex justify-between items-center px-8">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold m-0">Study Sphere</h1>
          <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
            指導員
          </span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <div className="text-sm text-white/80">{user?.name}指導員</div>
            <div className="flex items-center gap-2">
              <div className="text-xl font-bold">{currentLocation.name}</div>
              <span className="text-sm bg-white/20 px-2 py-0.5 rounded">
                {currentLocation.type === '学習塾' ? '📚' : 
                 currentLocation.type.includes('就労移行') ? '🏢' :
                 currentLocation.type.includes('A型') ? '🏭' :
                 currentLocation.type.includes('B型') ? '🏗️' : '🏫'}
              </span>
            </div>
            <div className="text-sm text-white/80">{currentLocation.organization}</div>
          </div>
          <button 
            onClick={() => setIsLocationModalOpen(true)}
            className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2 rounded-lg cursor-pointer text-sm transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-2 backdrop-blur-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
            拠点切り替え
          </button>
          <button 
            onClick={onLogout} 
            className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2 rounded-lg cursor-pointer text-sm transition-all duration-300 hover:-translate-y-0.5 backdrop-blur-sm"
          >
            ログアウト
          </button>
        </div>
      </div>

      <LocationSwitchModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        currentLocation={currentLocation}
        onLocationSelect={(location) => {
          if (onLocationChange) {
            onLocationChange(location);
          }
        }}
      />
    </header>
  );
};

export default InstructorHeader; 