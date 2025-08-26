import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStudentGuard } from '../utils/hooks/useAuthGuard';
import { useAuth } from '../components/contexts/AuthContext';
import { verifyTemporaryPasswordAPI } from '../utils/api';
import Dashboard from './Dashboard';
import LessonList from './LessonList';
import AnnouncementList from '../components/AnnouncementList';

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser } = useStudentGuard();
  const { login, logout } = useAuth();
  const [isAutoLoggingIn, setIsAutoLoggingIn] = useState(false);
  const [authError, setAuthError] = useState('');

  // クエリパラメータからの自動認証処理
  useEffect(() => {
    const handleAutoLogin = async () => {
      // 既に認証済みの場合はスキップ
      if (currentUser) {
        return;
      }

      // クエリパラメータからトークンと一時パスワードを取得
      const token = searchParams.get('token');
      const tempPassword = searchParams.get('tempPassword');
      const loginCode = searchParams.get('code');

      console.log('クエリパラメータ確認:', { token, tempPassword: tempPassword ? '***' : 'なし', loginCode });

      // 一時パスワードとログインコードが必要（トークンはオプション）
      if (tempPassword && loginCode) {
        console.log('クエリパラメータから認証情報を検出');
        setIsAutoLoggingIn(true);
        setAuthError('');

        try {
          console.log('一時パスワード認証を開始:', { loginCode, tempPassword: '***' });
          // 一時パスワード認証を実行
          const result = await verifyTemporaryPasswordAPI(loginCode, tempPassword);
          
          if (result.success) {
            console.log('認証成功:', result.data);
            // ログイン成功
            const userData = {
              id: result.data.userId,
              name: result.data.userName,
              role: 'student',
              login_code: loginCode,
              instructorName: result.data.instructorName
            };
            
            // 認証処理を実行（トークンなしでログイン）
            login(userData);
            
            console.log('自動ログイン成功:', userData);
            
            // クエリパラメータをクリア
            const newUrl = new URL(window.location);
            newUrl.searchParams.delete('token');
            newUrl.searchParams.delete('tempPassword');
            newUrl.searchParams.delete('code');
            window.history.replaceState({}, '', newUrl);
            
          } else {
            setAuthError(result.message || '認証に失敗しました');
            console.error('認証失敗:', result.message);
          }
        } catch (error) {
          console.error('自動ログインエラー:', error);
          const errorMessage = error.message || '認証処理中にエラーが発生しました';
          setAuthError(errorMessage);
        } finally {
          setIsAutoLoggingIn(false);
        }
      } else {
        // 従来のlocalStorageからの自動ログイン処理
        const autoLoginCode = localStorage.getItem('autoLoginCode');
        const autoLoginUser = localStorage.getItem('autoLoginUser');
        const autoLoginTarget = localStorage.getItem('autoLoginTarget');

        if (autoLoginCode && autoLoginUser && autoLoginTarget && !currentUser) {
          console.log('自動ログイン情報を検出:', { autoLoginCode, autoLoginUser, autoLoginTarget });
          setIsAutoLoggingIn(true);
          
          // 自動ログイン情報をクリア
          localStorage.removeItem('autoLoginCode');
          localStorage.removeItem('autoLoginUser');
          localStorage.removeItem('autoLoginTarget');
          
          // 一時パスワードが設定されている場合は自動ログインを試行
          // 注意: セキュリティ上の理由から、一時パスワードは自動入力せず、
          // ユーザーに手動で入力してもらう必要があります
          console.log('自動ログインコードが検出されました。一時パスワードを入力してください。');
          setIsAutoLoggingIn(false);
        }
      }
    };

    handleAutoLogin();
  }, [currentUser, login, navigate, searchParams]);

  const handleLogout = () => {
    // ログアウト確認ダイアログ
    if (window.confirm('ログアウトしますか？')) {
      console.log('ログアウト処理を開始');
      
      // ログアウト処理を実行
      logout();
      
      console.log('ログアウト完了');
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-blue-600 text-xl font-semibold mb-4">
            {isAutoLoggingIn ? '自動ログイン中...' : '認証中...'}
          </div>
          {isAutoLoggingIn && (
            <div className="text-gray-600 text-sm">
              一時パスワードを入力してログインを完了してください
            </div>
          )}
          {authError && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-red-700 font-medium mb-2">認証エラー</div>
              <div className="text-red-600 text-sm">{authError}</div>
              <button 
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                onClick={() => navigate('/student/login')}
              >
                ログインページに戻る
              </button>
            </div>
          )}
        </div>
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
                  利用者
                </span>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="flex items-center gap-3">
                <span className="font-medium text-white">
                  {currentUser.name}さん
                  {currentUser.instructorName && (
                    <span className="text-blue-100 text-sm ml-2">
                      （担当：{currentUser.instructorName}指導員）
                    </span>
                  )}
                  {!currentUser.instructorName && (
                    <span className="text-blue-100 text-sm ml-2">
                      （担当：未設定）
                    </span>
                  )}
                </span>
                <button 
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 border border-red-400 rounded-lg transition-all duration-200 font-medium text-white shadow-sm hover:shadow-md"
                  onClick={handleLogout}
                  title="ログアウト"
                >
                  🚪 ログアウト
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
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'announcements'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700'
              }`}
              onClick={() => setActiveTab('announcements')}
            >
              📢 お知らせ
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
          {activeTab === 'announcements' && (
            <div className="student-content">
              <AnnouncementList />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard; 