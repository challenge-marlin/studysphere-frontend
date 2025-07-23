import React from 'react';
import { useNavigate } from 'react-router-dom';

const InstructorSidebar = () => {
  const navigate = useNavigate();
  return (
    <div className="fixed top-0 left-0 w-56 h-screen bg-gray-800 text-white flex flex-col z-50 shadow-lg">
      <div className="text-xl font-bold p-6 pb-3 border-b border-gray-700">
        指導員メニュー
      </div>
      <ul className="flex-1">
        <li 
          onClick={() => navigate('/instructor/dashboard')}
          className="px-6 py-4 cursor-pointer text-base border-b border-gray-700 transition-colors duration-200 hover:bg-gray-700"
        >
          🏠 ダッシュボード
        </li>
        <li 
          onClick={() => navigate('/instructor/daily-records')}
          className="px-6 py-4 cursor-pointer text-base border-b border-gray-700 transition-colors duration-200 hover:bg-gray-700"
        >
          📝 日々の記録管理
        </li>
        <li 
          onClick={() => navigate('/instructor/evaluations')}
          className="px-6 py-4 cursor-pointer text-base border-b border-gray-700 transition-colors duration-200 hover:bg-gray-700"
        >
          📊 達成度評価管理
        </li>
      </ul>
    </div>
  );
};

export default InstructorSidebar; 