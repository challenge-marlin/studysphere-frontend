import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Dashboard from './Dashboard';
import LessonList from './LessonList';

const StudentDashboard = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (!user) {
      navigate('/');
      return;
    }
    
    const userData = JSON.parse(user);
    if (userData.role !== 'student') {
      navigate('/');
      return;
    }
    
    setCurrentUser(userData);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/');
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-blue-600 text-xl font-semibold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex flex-col">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-white">Study Sphere</h1>
                <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm font-semibold">
                  生徒
                </span>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="text-center md:text-right">
                <span className="text-blue-100 font-medium">
                  担当: {currentUser.instructorName || currentUser.teacherName}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-medium text-white">{currentUser.name}さん</span>
                <button 
                  className="px-4 py-2 bg-white bg-opacity-10 border border-white border-opacity-30 rounded-lg hover:bg-opacity-20 transition-all duration-200 font-medium"
                  onClick={handleLogout}
                >
                  ログアウト
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ナビゲーション */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap gap-3">
            <button 
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'dashboard'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700'
              }`}
              onClick={() => setActiveTab('dashboard')}
            >
              📊 ダッシュボード
            </button>
            <button 
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'lessons'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700'
              }`}
              onClick={() => setActiveTab('lessons')}
            >
              📚 レッスン一覧
            </button>
            <button 
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
              onClick={() => navigate('/student/learning')}
            >
              🎓 学習画面
            </button>
            <button 
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
              onClick={() => navigate('/student/enhanced-learning')}
            >
              🚀 改善版学習画面
            </button>
            <button 
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
              onClick={() => navigate('/student/advanced-learning')}
            >
              ⭐ 高度な学習画面
            </button>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 min-h-[600px]">
          {activeTab === 'dashboard' && (
            <div className="student-content">
              <Dashboard />
            </div>
          )}
          {activeTab === 'lessons' && (
            <div className="student-content">
              <LessonList />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard; 