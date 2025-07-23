import React from 'react';

const AdminHeader = ({ user, onLogout }) => {
  return (
    <header className="bg-gradient-to-r from-red-500 to-red-400 text-white py-4 shadow-lg">
      <div className="max-w-7xl mx-auto px-5 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-white m-0">Study Sphere</h1>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white bg-opacity-20 text-white">
            管理者
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-medium text-white">{user.name}</span>
          <button 
            className="bg-white bg-opacity-10 text-white border-2 border-white border-opacity-30 px-4 py-2 rounded-md cursor-pointer transition-all duration-200 hover:bg-opacity-20 hover:border-opacity-50"
            onClick={onLogout}
          >
            ログアウト
          </button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader; 