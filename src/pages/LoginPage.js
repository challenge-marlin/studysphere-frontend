import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/contexts/AuthContext';
import { logAdminAccountOperation } from '../utils/adminLogger';
import SanitizedInput from '../components/SanitizedInput';
import { SANITIZE_OPTIONS } from '../utils/sanitizeUtils';
import { addOperationLog } from '../utils/operationLogManager';

const LoginPage = () => {
  const [credentials, setCredentials] = useState({ id: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated, currentUser } = useAuth();

  // 認証済みユーザーがログインページにアクセスした場合のリダイレクト
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      switch (currentUser.role) {
        case 'admin':
          navigate('/admin/dashboard');
          break;
        case 'instructor':
          navigate('/instructor/dashboard');
          break;
        case 'student':
          navigate('/student/dashboard');
          break;
        default:
          // デフォルトはログインページに留まる
          break;
      }
    }
  }, [isAuthenticated, currentUser, navigate]);

  // モックユーザーデータ（指導員のみ）
  const users = {
    instructor1: {
      id: 'instructor001',
      password: 'instructor123',
      role: 'instructor', 
      name: '佐藤指導員',
      locationId: 'location001',
      locationName: '東京本校',
      facilityId: 'facility001',
      facilityName: 'スタディスフィア東京校'
    },
    instructor2: {
      id: 'instructor002',
      password: 'instructor456',
      role: 'instructor', 
      name: '田中指導員',
      locationId: 'location001',
      locationName: '東京本校',
      facilityId: 'facility001',
      facilityName: 'スタディスフィア東京校'
    },
    instructor3: {
      id: 'instructor003',
      password: 'instructor789',
      role: 'instructor', 
      name: '鈴木指導員',
      locationId: 'location002',
      locationName: '大阪支校',
      facilityId: 'facility001',
      facilityName: 'スタディスフィア大阪校'
    },
  };

  // 管理者ログインAPI呼び出し
  const adminLoginAPI = async (username, password) => {
    try {
      console.log('LoginPage: 管理者ログインAPI呼び出し開始');
      
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      console.log('LoginPage: ログインAPI応答', { status: response.status, ok: response.ok });

      const data = await response.json();
      
      if (!response.ok) {
        console.log('LoginPage: ログイン失敗', data);
        throw new Error(data.message || 'ログインに失敗しました');
      }

      console.log('LoginPage: ログイン成功', data);
      return data;
    } catch (error) {
      console.error('LoginPage: Admin login API error:', error);
      throw error;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // エラーをクリア
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // 管理者アカウントの認証（データベース認証）
      if (credentials.id === 'admin001') {
        try {
          const adminData = await adminLoginAPI('admin001', credentials.password);
          
          if (adminData.success) {
            const userData = {
              id: adminData.data.user_id,
              name: adminData.data.user_name,
              email: adminData.data.login_code,
              role: 'admin',
              access_token: adminData.data.access_token,
              refresh_token: adminData.data.refresh_token
            };
            
            // 認証コンテキストを使用してログイン
            login(userData, adminData.data.access_token, adminData.data.refresh_token);
            
            // 操作ログを記録
            await addOperationLog({
              action: 'ログイン',
              details: `管理者「${userData.name}」がログインしました`,
              adminId: userData.id,
              adminName: userData.name
            });
            
            navigate('/admin/dashboard');
          } else {
            setError(adminData.message || 'ログインに失敗しました');
          }
        } catch (apiError) {
          console.error('Login API error:', apiError);
          // 認証エラーの場合は適切なメッセージを表示
          if (apiError.message === 'Authentication failed') {
            setError('ユーザーIDまたはパスワードが正しくありません。');
          } else {
            setError(apiError.message || 'データベース認証に失敗しました');
          }
        }
      } else {
        // 通常のユーザー認証（モックデータ）
        const user = Object.values(users).find(
          u => u.id === credentials.id && u.password === credentials.password
        );

        if (user) {
          // 指導員でログイン（モックログイン）
          login(user);
          
          // 操作ログを記録
          await addOperationLog({
            action: 'ログイン',
            details: `指導員「${user.name}」がログインしました`,
            adminId: user.id,
            adminName: user.name
          });
          
          navigate('/instructor/dashboard');
        } else {
          setError('ユーザーIDまたはパスワードが正しくありません。');
        }
      }
    } catch (error) {
      setError(error.message || 'ログイン処理中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-purple-600 flex items-center justify-center p-5">
      <div className="bg-white rounded-2xl p-8 shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-indigo-600 mb-2">Study Sphere</h1>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">ログイン</h2>
          <p className="text-gray-600">管理者・指導員用ログインページ</p>
        </div>

        <form onSubmit={handleSubmit} className="mb-8">
          <div className="mb-4">
            <label htmlFor="id" className="block text-sm font-medium text-gray-700 mb-2">
              ユーザーID
            </label>
            <SanitizedInput
              type="text"
              id="id"
              name="id"
              value={credentials.id}
              onChange={handleInputChange}
              required
              placeholder="ユーザーIDを入力"
              sanitizeMode={SANITIZE_OPTIONS.LIGHT}
              debounceMs={200}
              className="w-full px-3 py-3 border-2 border-gray-200 rounded-lg text-base transition-colors focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              パスワード
            </label>
            <SanitizedInput
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleInputChange}
              required
              placeholder="パスワードを入力"
              sanitizeMode={SANITIZE_OPTIONS.NONE}
              className="w-full px-3 py-3 border-2 border-gray-200 rounded-lg text-base transition-colors focus:outline-none focus:border-indigo-500"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 px-4 rounded-lg font-medium text-base transition-all duration-200 hover:from-indigo-600 hover:to-purple-700 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>

        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">デモ用アカウント</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-white rounded-lg shadow-sm">
              <h4 className="text-indigo-600 font-medium mb-2">管理者</h4>
              <p className="text-sm text-gray-600 mb-1">ID: admin001</p>
              <p className="text-sm text-gray-600">パスワード: admin123</p>
            </div>
            <div className="p-3 bg-white rounded-lg shadow-sm">
              <h4 className="text-indigo-600 font-medium mb-2">指導員</h4>
              <p className="text-sm text-gray-600 mb-1">ID: instructor001</p>
              <p className="text-sm text-gray-600">パスワード: instructor123</p>
            </div>
          </div>
          
          {/* 管理者アカウント復元ボタン */}
          <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <h4 className="text-orange-800 font-medium mb-2">管理者アカウント復元</h4>
            <p className="text-sm text-orange-700 mb-3">
              データベースが初期化されて管理者アカウントが消えた場合、このボタンで復元できます。
            </p>
            <button 
              onClick={async () => {
                try {
                  console.log('管理者アカウント復元開始');
                  const response = await fetch('http://localhost:5000/restore-admin', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json'
                    }
                  });
                  const data = await response.json();
                  console.log('管理者アカウント復元結果:', data);
                  if (data.success) {
                    alert('管理者アカウントが復元されました。\n\nユーザー名: admin001\nパスワード: admin123\n\n上記の情報でログインしてください。');
                  } else {
                    alert('管理者アカウント復元に失敗しました: ' + data.message);
                  }
                } catch (error) {
                  console.error('管理者アカウント復元エラー:', error);
                  alert('管理者アカウント復元でエラーが発生しました。\nバックエンドサーバーが起動しているか確認してください。');
                }
              }}
              className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg font-medium text-sm transition-colors hover:bg-orange-600"
            >
              🔑 管理者アカウントを復元
            </button>
          </div>
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">生徒用ログイン</h3>
          <p className="text-blue-700 mb-4">生徒は指導員から送られたログインURLでアクセスします</p>
          <div className="space-y-2">
            <p className="font-medium text-blue-800">サンプルURL:</p>
            {['token123', 'token456'].map(token => {
              const url = `${window.location.origin}${process.env.PUBLIC_URL}/#/student/login/${token}`;
              return (
                <a 
                  key={token} 
                  href={url} 
                  className="block text-blue-600 p-2 bg-white border border-blue-200 rounded text-sm transition-colors hover:bg-blue-50"
                >
                  {url}
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 