import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import InstructorHeader from '../components/InstructorHeader';
import ClassOverview from '../components/ClassOverview';
import StudentManagement from '../components/StudentManagement';
import LocationManagementForInstructor from '../components/LocationManagementForInstructor';
import HomeSupportEvaluationsPage from './HomeSupportEvaluationsPage';

const InstructorDashboard = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showPasswordChangeForm, setShowPasswordChangeForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (!user) {
      navigate('/');
      return;
    }
    
    const userData = JSON.parse(user);
    if (userData.role !== 'instructor' && userData.role !== 'teacher') {
      navigate('/');
      return;
    }

    // 初期の拠点情報を設定
    const initialLocation = {
      id: 'office001',
      name: '東京教育渋谷校',
      type: '就労移行支援事業所',
      organization: 'スタディスフィア株式会社'
    };
    
    setCurrentUser({
      ...userData,
      location: userData.location || initialLocation
    });
    
    // URLパラメータからタブを設定
    const initialTab = location.search.split('tab=')[1];
    if (initialTab && ['overview', 'students', 'location', 'home-support', 'learning-preview', 'settings'].includes(initialTab)) {
      setActiveTab(initialTab);
    }

    // パスワード変更要求があるかチェック
    if (userData.passwordResetRequired) {
      setActiveTab('settings');
      setShowPasswordChangeForm(true);
    }
  }, [navigate, location]);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/');
  };

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) errors.push('8文字以上で入力してください');
    if (!/[A-Z]/.test(password)) errors.push('大文字を含めてください');
    if (!/[a-z]/.test(password)) errors.push('小文字を含めてください');
    if (!/[0-9]/.test(password)) errors.push('数字を含めてください');
    return errors;
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    setPasswordErrors({});

    // バリデーション
    const errors = {};
    
    if (!passwordForm.currentPassword) {
      errors.currentPassword = '現在のパスワードを入力してください';
    }
    
    if (!passwordForm.newPassword) {
      errors.newPassword = '新しいパスワードを入力してください';
    } else {
      const passwordValidation = validatePassword(passwordForm.newPassword);
      if (passwordValidation.length > 0) {
        errors.newPassword = passwordValidation.join(', ');
      }
    }
    
    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = 'パスワードの確認を入力してください';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'パスワードが一致しません';
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    // モック認証 - 実際の実装では API を呼び出します
    if (passwordForm.currentPassword !== 'instructor123' && passwordForm.currentPassword !== 'teacher123') {
      setPasswordErrors({ currentPassword: '現在のパスワードが間違っています' });
      return;
    }

    // パスワード変更成功
    alert('パスワードが正常に変更されました。\n次回ログイン時から新しいパスワードをご利用ください。');
    
    // パスワード変更要求フラグをクリア
    const updatedUser = { ...currentUser, passwordResetRequired: false };
    setCurrentUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    
    // フォームをリセット
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setShowPasswordChangeForm(false);
  };

  const handlePasswordFormChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // エラーをクリア
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleLocationChange = (newLocation) => {
    // 新しい拠点情報でユーザー情報を更新
    const updatedUser = {
      ...currentUser,
      location: newLocation
    };
    setCurrentUser(updatedUser);
    
    // LocalStorageも更新
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
  };

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <InstructorHeader 
        user={currentUser} 
        onLogout={handleLogout} 
        onLocationChange={handleLocationChange}
      />
      
      <div className="flex flex-col flex-1 h-[calc(100vh-80px)] overflow-hidden">
        <aside className="w-full bg-white text-gray-800 flex-shrink-0 overflow-y-auto border-b border-gray-200">
          <nav className="p-4 flex flex-row gap-2 overflow-x-auto">
            <button 
              className={`flex items-center gap-3 px-6 py-4 bg-transparent border-none text-gray-800 cursor-pointer transition-all duration-300 text-center text-sm min-w-[150px] flex-shrink-0 rounded-lg hover:bg-indigo-50 hover:-translate-y-0.5 ${activeTab === 'overview' ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              📊 クラス概要
            </button>
            <button 
              className={`flex items-center gap-3 px-6 py-4 bg-transparent border-none text-gray-800 cursor-pointer transition-all duration-300 text-center text-sm min-w-[150px] flex-shrink-0 rounded-lg hover:bg-indigo-50 hover:-translate-y-0.5 ${activeTab === 'students' ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white' : ''}`}
              onClick={() => setActiveTab('students')}
            >
              👥 生徒管理
            </button>
            <button 
              className={`flex items-center gap-3 px-6 py-4 bg-transparent border-none text-gray-800 cursor-pointer transition-all duration-300 text-center text-sm min-w-[150px] flex-shrink-0 rounded-lg hover:bg-indigo-50 hover:-translate-y-0.5 ${activeTab === 'location' ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white' : ''}`}
              onClick={() => setActiveTab('location')}
            >
              🏢 拠点管理
            </button>
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
                ${currentUser.passwordResetRequired
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white animate-pulse'
                  : activeTab === 'settings'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                    : ''
                }`}
              onClick={() => setActiveTab('settings')}
            >
              ⚙️ 設定
              {currentUser.passwordResetRequired && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs font-bold flex items-center justify-center shadow-lg">
                  !
                </span>
              )}
            </button>
          </nav>
        </aside>

        <main className="flex-1 p-8 overflow-y-auto bg-white">
          {activeTab === 'overview' && <ClassOverview instructorId={currentUser.id} />}
          {activeTab === 'students' && <StudentManagement instructorId={currentUser.id} />}
          {activeTab === 'location' && <LocationManagementForInstructor currentUser={currentUser} />}
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
                      <span className="font-medium">指導員ID:</span>
                      <span>{currentUser.id}</span>
                    </div>
                    <div>
                      <span className="font-medium">名前:</span>
                      <span>{currentUser.name}</span>
                    </div>
                    <div>
                      <span className="font-medium">メールアドレス:</span>
                      <span>{currentUser.email}</span>
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
                    {currentUser.passwordResetRequired && (
                      <div className="flex items-center gap-2 text-red-500 text-sm font-medium">
                        <span className="text-red-500">⚠️</span>
                        パスワードの変更が必要です
                      </div>
                    )}
                  </div>
                  
                  {!showPasswordChangeForm ? (
                    <div className="text-gray-700 mb-4">
                      <p>セキュリティ向上のため、定期的なパスワード変更をお勧めします。</p>
                      <button 
                        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-300"
                        onClick={() => setShowPasswordChangeForm(true)}
                      >
                        パスワードを変更する
                      </button>
                    </div>
                  ) : (
                    <form className="grid grid-cols-1 gap-4" onSubmit={handlePasswordChange}>
                      <div className="flex flex-col">
                        <label htmlFor="currentPassword" className="text-gray-700 font-medium mb-1">現在のパスワード <span className="text-red-500">*</span></label>
                        <input
                          type="password"
                          id="currentPassword"
                          name="currentPassword"
                          value={passwordForm.currentPassword}
                          onChange={handlePasswordFormChange}
                          className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${passwordErrors.currentPassword ? 'border-red-500 focus:ring-red-500' : ''}`}
                        />
                        {passwordErrors.currentPassword && (
                          <p className="text-red-500 text-sm mt-1">{passwordErrors.currentPassword}</p>
                        )}
                      </div>

                      <div className="flex flex-col">
                        <label htmlFor="newPassword" className="text-gray-700 font-medium mb-1">新しいパスワード <span className="text-red-500">*</span></label>
                        <input
                          type="password"
                          id="newPassword"
                          name="newPassword"
                          value={passwordForm.newPassword}
                          onChange={handlePasswordFormChange}
                          className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${passwordErrors.newPassword ? 'border-red-500 focus:ring-red-500' : ''}`}
                        />
                        {passwordErrors.newPassword && (
                          <p className="text-red-500 text-sm mt-1">{passwordErrors.newPassword}</p>
                        )}
                        <div className="text-gray-500 text-sm mt-1">
                          パスワード要件: 8文字以上、大文字・小文字・数字を含む
                        </div>
                      </div>

                      <div className="flex flex-col">
                        <label htmlFor="confirmPassword" className="text-gray-700 font-medium mb-1">新しいパスワード（確認） <span className="text-red-500">*</span></label>
                        <input
                          type="password"
                          id="confirmPassword"
                          name="confirmPassword"
                          value={passwordForm.confirmPassword}
                          onChange={handlePasswordFormChange}
                          className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${passwordErrors.confirmPassword ? 'border-red-500 focus:ring-red-500' : ''}`}
                        />
                        {passwordErrors.confirmPassword && (
                          <p className="text-red-500 text-sm mt-1">{passwordErrors.confirmPassword}</p>
                        )}
                      </div>

                      <div className="flex justify-end gap-3">
                        <button 
                          type="submit" 
                          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-300"
                        >
                          パスワードを変更
                        </button>
                        <button 
                          type="button" 
                          className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors duration-300"
                          onClick={() => {
                            setShowPasswordChangeForm(false);
                            setPasswordForm({
                              currentPassword: '',
                              newPassword: '',
                              confirmPassword: ''
                            });
                            setPasswordErrors({});
                          }}
                        >
                          キャンセル
                        </button>
                      </div>
                    </form>
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
    </div>
  );
};

export default InstructorDashboard; 