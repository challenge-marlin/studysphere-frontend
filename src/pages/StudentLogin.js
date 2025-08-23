import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../components/contexts/AuthContext';
import { verifyTemporaryPasswordAPI } from '../utils/api';

const StudentLogin = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, isAuthenticated, currentUser } = useAuth();
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');
  const [loginCode, setLoginCode] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // URLパラメータからログインコードを取得
  useEffect(() => {
    const codeFromUrl = searchParams.get('code');
    if (codeFromUrl) {
      setLoginCode(codeFromUrl);
    }
  }, [searchParams]);

  // 認証済みユーザーが生徒ログインページにアクセスした場合のリダイレクト
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
          // デフォルトは生徒ログインページに留まる
          break;
      }
    }
  }, [isAuthenticated, currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!loginCode || !tempPassword) {
      setError('ログインコードと一時パスワードを入力してください。');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const result = await verifyTemporaryPasswordAPI(loginCode, tempPassword);
      
      if (result.success) {
        // ログイン成功
        const userData = {
          id: result.data.userId,
          name: result.data.userName,
          role: 'student',
          login_code: loginCode
        };
        
        login(userData);
        navigate('/student/dashboard');
      } else {
        setError(result.message || 'ログインに失敗しました。');
      }
    } catch (error) {
      console.error('ログインエラー:', error);
      setError('ログイン処理中にエラーが発生しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-cyan-400 to-blue-500 flex items-center justify-center p-5">
      <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">利用者ログイン</h1>
          <p className="text-gray-600">ログインコードと一時パスワードを入力してください</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="loginCode" className="block text-sm font-medium text-gray-700 mb-2">
              ログインコード
            </label>
            <input
              type="text"
              id="loginCode"
              value={loginCode}
              onChange={(e) => setLoginCode(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="ログインコードを入力"
              required
            />
          </div>

          <div>
            <label htmlFor="tempPassword" className="block text-sm font-medium text-gray-700 mb-2">
              一時パスワード
            </label>
            <input
              type="password"
              id="tempPassword"
              value={tempPassword}
              onChange={(e) => setTempPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="一時パスワードを入力"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 px-6 rounded-lg font-medium transition-all duration-200 hover:from-blue-600 hover:to-cyan-600 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                ログイン中...
              </div>
            ) : (
              'ログイン'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            支援アプリから送られてきたログインコードと一時パスワードをご利用ください
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentLogin; 