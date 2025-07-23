import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminHeader from '../components/AdminHeader';
import LocationManagement from '../components/LocationManagement';
import InstructorManagement from '../components/InstructorManagement';
import CourseManagement from '../components/CourseManagement';
import LessonManagement from '../components/LessonManagement';
import CurriculumPathManagement from '../components/CurriculumPathManagement';
import AdminManagement from '../components/AdminManagement';
import { logAdminAccountOperation } from '../utils/adminLogger';

const AdminDashboard = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('locations');
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (!user) {
      navigate('/');
      return;
    }
    
    const userData = JSON.parse(user);
    if (userData.role !== 'admin') {
      navigate('/');
      return;
    }
    
    setCurrentUser(userData);
  }, [navigate]);

  const handleLogout = () => {
    // ログアウト時の操作ログを記録
    if (currentUser) {
      logAdminAccountOperation('logout', currentUser);
    }
    localStorage.removeItem('currentUser');
    navigate('/');
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600 text-lg">Loading...</div>
      </div>
    );
  }

  const navItems = [
    { id: 'locations', label: '🏢 事業所(拠点)管理', component: <LocationManagement /> },
    { id: 'instructors', label: '👨‍🏫 指導員管理', component: <InstructorManagement /> },
    { id: 'courses', label: '📚 コース管理', component: <CourseManagement /> },
    { id: 'lessons', label: '📖 レッスン管理', component: <LessonManagement /> },
    { id: 'paths', label: '🎯 カリキュラムパス管理', component: <CurriculumPathManagement /> },
    { id: 'admins', label: '👥 管理者管理', component: <AdminManagement /> },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <AdminHeader user={currentUser} onLogout={handleLogout} />
      
      <div className="flex flex-col flex-1 h-[calc(100vh-80px)] overflow-hidden">
        <aside className="w-full bg-white border-b border-gray-200 flex-shrink-0">
          <nav className="p-4 flex flex-row gap-2 overflow-x-auto">
            {navItems.map((item) => (
              <button 
                key={item.id}
                className={`flex items-center gap-3 px-6 py-4 bg-transparent border-none text-gray-700 cursor-pointer transition-all duration-300 text-center text-sm min-w-[150px] flex-shrink-0 rounded-lg hover:bg-red-50 hover:-translate-y-0.5 ${
                  activeTab === item.id 
                    ? 'bg-gradient-to-r from-red-500 to-red-400 text-white shadow-lg' 
                    : ''
                }`}
                onClick={() => setActiveTab(item.id)}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-8 overflow-y-auto bg-white">
          {navItems.find(item => item.id === activeTab)?.component}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard; 