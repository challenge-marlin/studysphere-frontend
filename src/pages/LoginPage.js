import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logAdminAccountOperation } from '../utils/adminLogger';

const LoginPage = () => {
  const [credentials, setCredentials] = useState({ id: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // モックユーザーデータ
  const users = {
    admin: { 
      id: 'admin001', 
      password: 'admin123', 
      role: 'admin', 
      name: '山田管理者' 
    },
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

    // 管理者アカウントの確認
    const savedAdmins = localStorage.getItem('adminUsers');
    let adminUsers = [];
    if (savedAdmins) {
      adminUsers = JSON.parse(savedAdmins);
    }

    // 管理者アカウントの認証
    const adminUser = adminUsers.find(
      admin => admin.id === credentials.id && 
               admin.password === credentials.password &&
               admin.status === 'active' &&
               new Date(admin.endDate) >= new Date()
    );

    // 通常のユーザー認証
    const user = Object.values(users).find(
      u => u.id === credentials.id && u.password === credentials.password
    );

    setTimeout(() => {
      if (adminUser) {
        // 管理者アカウントでログイン
        const adminData = {
          id: adminUser.id,
          name: adminUser.name,
          email: adminUser.email,
          role: 'admin'
        };
        localStorage.setItem('currentUser', JSON.stringify(adminData));
        
        // 操作ログを記録
        logAdminAccountOperation('login', adminUser);
        
        navigate('/admin/dashboard');
      } else if (user) {
        // 通常のユーザーでログイン
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // ロールに応じてリダイレクト
        if (user.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (user.role === 'instructor') {
          navigate('/instructor/dashboard');
        }
      } else {
        setError('ユーザーIDまたはパスワードが正しくありません。');
      }
      setIsLoading(false);
    }, 1000); // ローディング体験のため
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
            <input
              type="text"
              id="id"
              name="id"
              value={credentials.id}
              onChange={handleInputChange}
              required
              placeholder="ユーザーIDを入力"
              className="w-full px-3 py-3 border-2 border-gray-200 rounded-lg text-base transition-colors focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              パスワード
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleInputChange}
              required
              placeholder="パスワードを入力"
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