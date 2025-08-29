import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminGuard } from '../utils/hooks/useAuthGuard';
import AdminHeader from '../components/AdminHeader';
import LocationManagement from '../components/LocationManagement';
import InstructorManagement from '../components/InstructorManagement';
import CourseManagement from '../components/CourseManagement';
import LessonManagement from '../components/LessonManagement';
import CurriculumPathManagement from '../components/CurriculumPathManagement';
import AdminManagement from '../components/AdminManagement';
import TempPasswordManagement from '../components/TempPasswordManagement';
import AdminPasswordChangeModal from '../components/AdminPasswordChangeModal';

const AdminDashboard = () => {
  // 保存されたタブ状態を取得、デフォルトは'locations'
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = sessionStorage.getItem('adminDashboardActiveTab');
    return savedTab || 'locations';
  });
  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAdminGuard();

  // パスワード変更要求があるかチェック
  useEffect(() => {
    if (currentUser?.passwordResetRequired) {
      setShowPasswordChangeModal(true);
    }
  }, [currentUser]);

  const handlePasswordChange = async (currentPassword, newPassword) => {
    try {
      const token = localStorage.getItem('accessToken');
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE_URL}/api/users/${currentUser.id}/change-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert('パスワードが正常に変更されました。');
        // パスワード変更要求フラグをクリア
        const updatedUser = { ...currentUser, passwordResetRequired: false };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        window.location.reload(); // ページをリロードして状態を更新
      } else {
        throw new Error(data.message || 'パスワード変更に失敗しました');
      }
    } catch (error) {
      console.error('パスワード変更に失敗:', error);
      alert(`パスワード変更に失敗しました: ${error.message}`);
      throw error;
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600 text-lg">認証中...</div>
      </div>
    );
  }

  // デバッグ情報を表示（開発環境のみ）
  if (process.env.NODE_ENV === 'development') {
    console.log('AdminDashboard Debug Info:', {
      currentUser,
      role: currentUser.role,
      roleType: typeof currentUser.role,
      isAuthenticated: !!currentUser
    });
  }

  const navItems = [
    { id: 'locations', label: '🏢 事業所(拠点)管理', component: <LocationManagement /> },
    { id: 'instructors', label: '👨‍🏫 指導員管理', component: <InstructorManagement /> },
    { id: 'courses', label: '📚 コース管理', component: <CourseManagement /> },
    { id: 'lessons', label: '📖 レッスン管理', component: <LessonManagement /> },
    { id: 'paths', label: '🎯 カリキュラムパス管理', component: <CurriculumPathManagement /> },
    { id: 'temp-passwords', label: '🔑 一時パスワード管理', component: <TempPasswordManagement /> },
    { id: 'admins', label: '👥 管理者管理', component: <AdminManagement /> },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className={showPasswordChangeModal ? 'pointer-events-none opacity-50' : ''}>
        <AdminHeader user={currentUser} />
      </div>
      
      <div className="flex flex-col flex-1 h-[calc(100vh-80px)] overflow-hidden">
        <aside className="w-full bg-white border-b border-gray-200 flex-shrink-0">
          <nav className={`p-4 flex flex-row gap-2 overflow-x-auto ${showPasswordChangeModal ? 'pointer-events-none opacity-50' : ''}`}>
            {navItems.map((item) => (
              <button 
                key={item.id}
                className={`flex items-center gap-3 px-6 py-4 bg-transparent border-none text-gray-700 cursor-pointer transition-all duration-300 text-center text-sm min-w-[150px] flex-shrink-0 rounded-lg hover:bg-red-50 hover:-translate-y-0.5 ${
                  activeTab === item.id 
                    ? 'bg-gradient-to-r from-red-500 to-red-400 text-white shadow-lg' 
                    : ''
                }`}
                onClick={() => {
                  setActiveTab(item.id);
                  // タブ状態をsessionStorageに保存
                  sessionStorage.setItem('adminDashboardActiveTab', item.id);
                }}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-8 overflow-y-auto bg-white">
          {/* パスワード変更モーダルが表示されている場合はダッシュボード内容を非表示 */}
          {showPasswordChangeModal ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
                <p className="text-gray-600">パスワード変更画面を読み込み中...</p>
              </div>
            </div>
          ) : (
            navItems.find(item => item.id === activeTab)?.component
          )}
        </main>
      </div>

      {/* パスワード変更モーダル */}
      <AdminPasswordChangeModal
        isOpen={showPasswordChangeModal}
        onClose={() => setShowPasswordChangeModal(false)}
        onPasswordChange={handlePasswordChange}
        user={currentUser}
      />
    </div>
  );
};

export default AdminDashboard; 