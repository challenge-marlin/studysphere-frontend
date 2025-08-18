import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useInstructorGuard } from '../utils/hooks/useAuthGuard';
import InstructorHeader from '../components/InstructorHeader';
import VoiceCareSystem from '../components/VoiceCareSystem';
import StudentManagement from '../components/StudentManagement';
import LocationManagementForInstructor from '../components/LocationManagementForInstructor';
import SatelliteManagement from '../components/SatelliteManagement';
import HomeSupportEvaluationsPage from './HomeSupportEvaluationsPage';
import SanitizedInput from '../components/SanitizedInput';
import { SANITIZE_OPTIONS } from '../utils/sanitizeUtils';
import InstructorPasswordChangeModal from '../components/InstructorPasswordChangeModal';

const InstructorDashboard = () => {
  console.log('=== InstructorDashboard Component Mounted ===');
  console.log('Current location:', window.location.href);
  console.log('Current pathname:', window.location.pathname);
  console.log('Current hash:', window.location.hash);
  
  const [activeTab, setActiveTab] = useState('overview');
  const [showPasswordChangeForm, setShowPasswordChangeForm] = useState(false);
  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false);
  const [authError, setAuthError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useInstructorGuard();
  const [localUser, setLocalUser] = useState(null);

  useEffect(() => {
    if (!currentUser) return;

    // 生徒のデータが混入している場合は警告
    const storedUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (storedUser.name === '末吉　元気' || storedUser.email === 'FSLE-P1WP-D2C5') {
      console.warn('⚠️ 生徒のデータが混入しています。ログアウトして正しい指導員アカウントでログインし直してください。');
    }

    // 初期の拠点情報を設定
    const initialLocation = {
      id: 'office001',
      name: '東京教育渋谷校',
      type: '就労移行支援事業所',
      organization: 'スタディスフィア株式会社'
    };
    
    // ローカルユーザー状態を設定
    setLocalUser({
      ...currentUser,
      location: currentUser.location || initialLocation
    });
    
    // URLパラメータからタブを設定
    const initialTab = location.search.split('tab=')[1];
    if (initialTab && ['overview', 'students', 'location', 'home-support', 'learning-preview', 'settings'].includes(initialTab)) {
      setActiveTab(initialTab);
    }

    // パスワード変更要求があるかチェック
    if (currentUser.passwordResetRequired) {
      setShowPasswordChangeModal(true);
    }

    // パスワード変更申請一覧を取得
    // fetchPasswordRequests(); // この関数は削除されたため、ここでは呼び出さない
  }, [currentUser, location]);





  // パスワード変更
  const handlePasswordChange = async (currentPassword, newPassword) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/users/${currentUser.id}/change-password`, {
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
        setShowPasswordChangeForm(false);
        // パスワード変更要求フラグをクリア
        if (localUser) {
          setLocalUser(prev => ({
            ...prev,
            passwordResetRequired: false
          }));
        }
        // LocalStorageも更新
        const updatedUser = { ...currentUser, passwordResetRequired: false };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      } else {
        throw new Error(data.message || 'パスワード変更に失敗しました');
      }
    } catch (error) {
      console.error('パスワード変更に失敗:', error);
      alert(`パスワード変更に失敗しました: ${error.message}`);
      throw error;
    }
  };



  const handleLocationChange = (newLocation) => {
    console.log('拠点情報が変更されました:', newLocation);
    
    // LocationManagementForInstructorからの拠点情報更新の場合
    if (newLocation.id && newLocation.name) {
      // 拠点情報をlocalStorageに保存
      localStorage.setItem('selectedSatellite', JSON.stringify(newLocation));
      
      // ユーザー情報のsatellite_idsを更新
      const updatedUser = {
        ...localUser,
        satellite_ids: [newLocation.id]
      };
      setLocalUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    } else {
      // 従来の拠点情報更新の場合
      const updatedUser = {
        ...localUser,
        location: newLocation
      };
      setLocalUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
  };

  if (!currentUser || !localUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className={showPasswordChangeModal ? 'pointer-events-none opacity-50' : ''}>
        <InstructorHeader 
          user={localUser} 
          onLocationChange={handleLocationChange}
        />
      </div>
      
      <div className="flex flex-col flex-1 h-[calc(100vh-80px)] overflow-hidden">
        <aside className="w-full bg-white text-gray-800 flex-shrink-0 overflow-y-auto border-b border-gray-200">
          <nav className={`p-4 flex flex-row gap-2 overflow-x-auto ${showPasswordChangeModal ? 'pointer-events-none opacity-50' : ''}`}>
            <button 
              className={`flex items-center gap-3 px-6 py-4 bg-transparent border-none text-gray-800 cursor-pointer transition-all duration-300 text-center text-sm min-w-[150px] flex-shrink-0 rounded-lg hover:bg-indigo-50 hover:-translate-y-0.5 ${activeTab === 'overview' ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              💬 声かけ
            </button>
            <button 
              className={`flex items-center gap-3 px-6 py-4 bg-transparent border-none text-gray-800 cursor-pointer transition-all duration-300 text-center text-sm min-w-[150px] flex-shrink-0 rounded-lg hover:bg-indigo-50 hover:-translate-y-0.5 ${activeTab === 'students' ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white' : ''}`}
              onClick={() => setActiveTab('students')}
            >
              👥 利用者一覧
            </button>
            <button 
              className={`flex items-center gap-3 px-6 py-4 bg-transparent border-none text-gray-800 cursor-pointer transition-all duration-300 text-center text-sm min-w-[150px] flex-shrink-0 rounded-lg hover:bg-indigo-50 hover:-translate-y-0.5 ${activeTab === 'location' ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white' : ''}`}
              onClick={() => setActiveTab('location')}
            >
              🏢 拠点情報
            </button>
            {localUser.role >= 5 && (
              <button 
                className={`flex items-center gap-3 px-6 py-4 bg-transparent border-none text-gray-800 cursor-pointer transition-all duration-300 text-center text-sm min-w-[150px] flex-shrink-0 rounded-lg hover:bg-indigo-50 hover:-translate-y-0.5 ${activeTab === 'satellite-management' ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white' : ''}`}
                onClick={() => setActiveTab('satellite-management')}
              >
                🏢 拠点管理
              </button>
            )}
            <button 
              className={`flex items-center gap-3 px-6 py-4 bg-transparent border-none text-gray-800 cursor-pointer transition-all duration-300 text-center text-sm min-w-[150px] flex-shrink-0 rounded-lg hover:bg-indigo-50 hover:-translate-y-0.5 ${activeTab === 'home-support' ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white' : ''}`}
              onClick={() => setActiveTab('home-support')}
            >
              🏠 在宅支援
            </button>
            <button 
              className={`flex items-center gap-3 px-6 py-4 bg-transparent border-none text-gray-800 cursor-pointer transition-all duration-300 text-center text-sm min-w-[150px] flex-shrink-0 rounded-lg hover:bg-indigo-50 hover:-translate-y-0.5 ${activeTab === 'learning-preview' ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white' : ''}`}
              onClick={() => setActiveTab('learning-preview')}
            >
              🎓 学習画面プレビュー
            </button>
            <button 
              className={`relative flex items-center gap-3 px-6 py-4 bg-transparent border-none text-gray-800 cursor-pointer transition-all duration-300 text-center text-sm min-w-[150px] flex-shrink-0 rounded-lg hover:bg-indigo-50 hover:-translate-y-0.5
                ${localUser.passwordResetRequired
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white animate-pulse'
                  : activeTab === 'settings'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                    : ''
                }`}
              onClick={() => setActiveTab('settings')}
            >
              ⚙️ 設定
              {localUser.passwordResetRequired && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs font-bold flex items-center justify-center shadow-lg">
                  !
                </span>
              )}
            </button>
          </nav>
        </aside>

        <main className="flex-1 p-8 overflow-y-auto bg-white">
          {/* 認証エラーメッセージ */}
          {authError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-red-500 mr-2">⚠️</span>
                  <span className="text-red-700 font-medium">{authError}</span>
                </div>
                <button
                  onClick={() => setAuthError(null)}
                  className="text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
          
          {activeTab === 'overview' && <VoiceCareSystem instructorId={localUser.id} />}
          {activeTab === 'students' && <StudentManagement instructorId={localUser.id} />}
          {activeTab === 'location' && <LocationManagementForInstructor currentUser={localUser} onLocationChange={handleLocationChange} />}
          {activeTab === 'satellite-management' && <SatelliteManagement currentUser={localUser} />}
          {activeTab === 'home-support' && <HomeSupportEvaluationsPage />}
          {activeTab === 'learning-preview' && (
            <div className="p-8 bg-white rounded-lg shadow-lg text-center text-gray-600">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">🎓 学習画面プレビュー</h2>
              <p className="mb-6">生徒が実際に見る学習画面のプレビューです。</p>
              <div className="text-left max-w-2xl mx-auto p-6 bg-gray-50 rounded-lg border-l-4 border-indigo-500">
                <p className="mb-4"><strong>📝 実装予定:</strong></p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>生徒ダッシュボードのプレビュー</li>
                  <li>コース一覧・学習画面の確認</li>
                  <li>進捗管理・課題提出画面の確認</li>
                  <li>生徒の視点での操作確認</li>
                </ul>
                <p className="mt-4 text-gray-600">生徒画面のモックアップが完成次第、ここに統合予定です。</p>
              </div>
            </div>
          )}
          
          {activeTab === 'settings' && (
            <div className="p-8 bg-white rounded-lg shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">個人設定</h2>
                <p className="text-lg text-gray-600">アカウント情報とセキュリティ設定を管理できます。</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* アカウント情報 */}
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">🏷️ アカウント情報</h3>
                  <div className="grid grid-cols-2 gap-3 text-gray-700">
                    <div>
                      <span className="font-medium">個人トークン:</span>
                      <span>{localUser.login_code || localUser.id || '未設定'}</span>
                    </div>
                    <div>
                      <span className="font-medium">名前:</span>
                      <span>{localUser.name}</span>
                    </div>
                    <div>
                      <span className="font-medium">メールアドレス:</span>
                      <span>{localUser.email}</span>
                    </div>
                    <div>
                      <span className="font-medium">最終ログイン:</span>
                      <span>{new Date().toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* パスワード変更セクション */}
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">🔐 パスワード変更</h3>
                    {localUser.passwordResetRequired && (
                      <div className="flex items-center gap-2 text-red-500 text-sm font-medium">
                        <span className="text-red-500">⚠️</span>
                        パスワードの変更が必要です
                      </div>
                    )}
                  </div>
                  
                  {!showPasswordChangeForm ? (
                    <div className="text-gray-700 mb-4">
                      <p>指導員は自身のパスワードをいつでも変更できます。</p>
                      <button 
                        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-300"
                        onClick={() => setShowPasswordChangeForm(true)}
                      >
                        パスワードを変更する
                      </button>
                    </div>
                  ) : (
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <h4 className="text-lg font-medium text-gray-800 mb-4">パスワード変更</h4>
                      <p className="text-gray-600 mb-4">新しいパスワードを設定してください。</p>
                      <button 
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-300"
                        onClick={() => setShowPasswordChangeModal(true)}
                      >
                        パスワード変更モーダルを開く
                      </button>
                      <button 
                        className="ml-2 px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors duration-300"
                        onClick={() => setShowPasswordChangeForm(false)}
                      >
                        キャンセル
                      </button>
                    </div>
                  )}
                </div>

                {/* セキュリティ情報 */}
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">🛡️ セキュリティ情報</h3>
                  <div className="text-gray-700">
                    <h4 className="text-lg font-medium text-gray-800 mb-3">パスワードセキュリティのヒント:</h4>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>定期的にパスワードを変更してください</li>
                      <li>他のサービスと同じパスワードを使用しないでください</li>
                      <li>パスワードを他人と共有しないでください</li>
                      <li>セッション終了時は必ずログアウトしてください</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* パスワード変更モーダル */}
      <InstructorPasswordChangeModal
        isOpen={showPasswordChangeModal}
        onClose={() => setShowPasswordChangeModal(false)}
        onPasswordChange={handlePasswordChange}
        user={currentUser}
      />
    </div>
  );
};

export default InstructorDashboard; 