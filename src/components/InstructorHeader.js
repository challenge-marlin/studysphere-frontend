import React from 'react';

const InstructorHeader = ({ user, onLogout }) => {
  return (
    <header className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-4 shadow-lg">
      <div className="max-w-6xl mx-auto flex justify-between items-center px-8">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold m-0">Study Sphere</h1>
          <span className="bg-white bg-opacity-25 px-3 py-1 rounded-full text-sm font-medium">
            指導員
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-semibold text-base">{user?.name}</span>
          <span className="text-sm opacity-90">{user?.locationName}</span>
          <button 
            onClick={onLogout} 
            className="bg-white bg-opacity-20 border border-white border-opacity-30 text-white px-4 py-2 rounded-md cursor-pointer text-sm transition-all duration-300 hover:bg-opacity-30 hover:-translate-y-0.5"
          >
            ログアウト
          </button>
        </div>
      </div>
    </header>
  );
};

export default InstructorHeader; 