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
  const [showDashboardSelection, setShowDashboardSelection] = useState(false);
  const [showCompanySelection, setShowCompanySelection] = useState(false);
  const [showSatelliteSelection, setShowSatelliteSelection] = useState(false);
  const [userData, setUserData] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [satellites, setSatellites] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedSatellite, setSelectedSatellite] = useState('');
  const navigate = useNavigate();
  const { login, isAuthenticated, currentUser } = useAuth();

  // キャッシュクリア機能
  const clearCache = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

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

  // 管理者ログインAPI呼び出し
  const adminLoginAPI = async (username, password) => {
    try {
      console.log('LoginPage: 管理者ログインAPI呼び出し開始');
      
      const response = await fetch('http://localhost:5000/api/login', {
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

  // 企業・拠点情報取得API
  const getUserCompaniesAPI = async (username) => {
    try {
      console.log('=== getUserCompaniesAPI Debug ===');
      console.log('Username:', username);
      console.log('API URL:', `http://localhost:5000/api/user-companies/${username}`);
      
      const response = await fetch(`http://localhost:5000/api/user-companies/${username}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      const data = await response.json();
      console.log('Response data:', data);
      
      if (!response.ok) {
        throw new Error(data.message || '企業・拠点情報の取得に失敗しました');
      }

      return data;
    } catch (error) {
      console.error('LoginPage: Get user companies API error:', error);
      throw error;
    }
  };

  // 指導員ログインAPI
  const instructorLoginAPI = async (username, password, companyId, satelliteId) => {
    try {
      const response = await fetch('http://localhost:5000/api/instructor-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, companyId, satelliteId }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || '指導員ログインに失敗しました');
      }

      return data;
    } catch (error) {
      console.error('LoginPage: Instructor login API error:', error);
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
      // 管理者ログインの試行
      const adminData = await adminLoginAPI(credentials.id, credentials.password);
      
      if (adminData.success && adminData.data) {
        console.log('=== Login Success Debug ===');
        console.log('Full adminData:', adminData);
        console.log('adminData.data:', adminData.data);
        
        const user = adminData.data;
        console.log('User data:', user);
        console.log('User role:', user.role);
        console.log('Role >= 9:', user.role >= 9);
        console.log('Role >= 4:', user.role >= 4);
        
        // ロール9以上（システム管理者）の場合はダッシュボード選択を表示
        if (user.role >= 9) {
          console.log('Showing dashboard selection for role 9+');
          setUserData(user);
          setShowDashboardSelection(true);
          setIsLoading(false);
          return;
        }
        
        // ロール4-5（指導者）の場合は拠点選択を表示
        if (user.role >= 4 && user.role <= 5) {
          console.log('Showing satellite selection for instructor (role 4-5)');
          setUserData(user);
          
          // 企業・拠点情報を取得
          console.log('Fetching companies data for user:', credentials.id);
          const companiesData = await getUserCompaniesAPI(credentials.id);
          console.log('Companies data response:', companiesData);
          
          if (companiesData.success && companiesData.data.companies.length > 0) {
            console.log('Companies found:', companiesData.data.companies.length);
            // 指導者は所属企業をまたがないので、最初の企業の拠点のみを表示
            const firstCompany = companiesData.data.companies[0];
            setSatellites(firstCompany.satellites || []);
            setSelectedCompany(firstCompany.id.toString());
            setShowSatelliteSelection(true);
            setIsLoading(false);
            return;
          } else {
            console.log('No companies found, proceeding to instructor dashboard');
            // 企業・拠点が割り当てられていない場合は直接指導員ダッシュボードへ
            const instructorData = {
              id: user.user_id,
              name: user.user_name,
              email: user.email || '',
              login_code: user.login_code,
              role: 'instructor',
              access_token: user.access_token,
              refresh_token: user.refresh_token
            };
            
            login(instructorData, user.access_token, user.refresh_token);
            
            await addOperationLog({
              action: 'ログイン',
              details: `指導員「${user.user_name}」がログインしました`,
              adminId: user.user_id,
              adminName: user.user_name
            });
            
            navigate('/instructor/dashboard');
            return;
          }
        }
        
        // ロール6-8（一般管理者）の場合は企業・拠点選択を表示
        if (user.role >= 6) {
          console.log('Showing company selection for admin (role 6-8)');
          setUserData(user);
          
          // 企業・拠点情報を取得
          console.log('Fetching companies data for user:', credentials.id);
          const companiesData = await getUserCompaniesAPI(credentials.id);
          console.log('Companies data response:', companiesData);
          
          if (companiesData.success && companiesData.data.companies.length > 0) {
            console.log('Companies found:', companiesData.data.companies.length);
            setCompanies(companiesData.data.companies);
            setShowCompanySelection(true);
            setIsLoading(false);
            return;
          } else {
            console.log('No companies found, proceeding to admin dashboard');
            // 企業・拠点が割り当てられていない場合は直接管理者ダッシュボードへ
            const adminUserData = {
              id: user.user_id,
              name: user.user_name,
              email: user.email || '',
              login_code: user.login_code,
              role: 'admin',
              access_token: user.access_token,
              refresh_token: user.refresh_token
            };
            
            login(adminUserData, user.access_token, user.refresh_token);
            
            await addOperationLog({
              action: 'ログイン',
              details: `管理者「${user.user_name}」がログインしました`,
              adminId: user.user_id,
              adminName: user.user_name
            });
            
            navigate('/admin/dashboard');
            return;
          }
        }
        
        console.log('Proceeding to admin dashboard for other roles');
        // その他のロールの場合は管理者ダッシュボードへ
        const adminUserData = {
          id: user.user_id,
          name: user.user_name,
          email: user.email || '',
          login_code: user.login_code,
          role: 'admin',
          access_token: user.access_token,
          refresh_token: user.refresh_token
        };
        
        login(adminUserData, user.access_token, user.refresh_token);
        
        await addOperationLog({
          action: 'ログイン',
          details: `管理者「${user.user_name}」がログインしました`,
          adminId: user.user_id,
          adminName: user.user_name
        });
        
        navigate('/admin/dashboard');
      } else {
        throw new Error(adminData.message || '管理者ログインに失敗しました');
      }
    } catch (error) {
      const errorMessage = error.message || 'ログイン処理中にエラーが発生しました';
      if (errorMessage.includes('ユーザー名またはパスワードが正しくありません')) {
        setError(`${errorMessage}\n\n※ キャッシュの問題の可能性があります。「キャッシュをクリアして再ログイン」ボタンを試してください。`);
      } else {
        setError(errorMessage);
      }
      setIsLoading(false);
    }
  };

  const handleDashboardSelection = async (dashboardType) => {
    if (dashboardType === 'admin') {
      const adminUserData = {
        id: userData.user_id,
        name: userData.user_name,
        email: userData.email || '',
        login_code: userData.login_code,
        role: 'admin',
        access_token: userData.access_token,
        refresh_token: userData.refresh_token
      };
      
      login(adminUserData, userData.access_token, userData.refresh_token);
      
      addOperationLog({
        action: 'ログイン',
        details: `管理者「${userData.user_name}」が管理者ダッシュボードでログインしました`,
        adminId: userData.user_id,
        adminName: userData.user_name
      });
      
      navigate('/admin/dashboard');
    } else if (dashboardType === 'instructor') {
      console.log('=== Instructor Dashboard Selection Debug ===');
      console.log('User data for instructor selection:', userData);
      
      // 企業・拠点情報を取得
      console.log('Fetching companies data for instructor dashboard selection');
      const companiesData = await getUserCompaniesAPI(credentials.id);
      console.log('Companies data response for instructor selection:', companiesData);
      
      if (companiesData.success && companiesData.data.companies.length > 0) {
        console.log('Companies found for instructor selection:', companiesData.data.companies.length);
        setCompanies(companiesData.data.companies);
        setShowDashboardSelection(false);
        setShowCompanySelection(true);
      } else {
        console.log('No companies found for instructor selection, proceeding to instructor dashboard');
        // 企業・拠点が割り当てられていない場合は直接指導員ダッシュボードへ
        const instructorData = {
          id: userData.user_id,
          name: userData.user_name,
          email: userData.email || '',
          login_code: userData.login_code,
          role: 'instructor',
          access_token: userData.access_token,
          refresh_token: userData.refresh_token
        };
        
        login(instructorData, userData.access_token, userData.refresh_token);
        
        addOperationLog({
          action: 'ログイン',
          details: `指導員「${userData.user_name}」がログインしました`,
          adminId: userData.user_id,
          adminName: userData.user_name
        });
        
        navigate('/instructor/dashboard');
      }
    }
  };

  const handleCompanySelection = async () => {
    if (!selectedCompany || !selectedSatellite) {
      setError('企業と拠点を選択してください');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const instructorData = await instructorLoginAPI(
        credentials.id, 
        credentials.password, 
        selectedCompany, 
        selectedSatellite
      );

      if (instructorData.success && instructorData.data) {
        const user = instructorData.data;
        const userData = {
          id: user.user_id,
          name: user.user_name,
          email: user.email || '',
          login_code: user.login_code,
          role: 'instructor',
          company_id: user.company_id,
          company_name: user.company_name,
          satellite_id: user.satellite_id,
          satellite_name: user.satellite_name,
          access_token: user.access_token,
          refresh_token: user.refresh_token
        };
        
        login(userData, user.access_token, user.refresh_token);
        
        await addOperationLog({
          action: 'ログイン',
          details: `指導員「${user.user_name}」が${user.company_name}の${user.satellite_name}でログインしました`,
          adminId: user.user_id,
          adminName: user.user_name
        });
        
        navigate('/instructor/dashboard');
      } else {
        throw new Error(instructorData.message || '指導員ログインに失敗しました');
      }
    } catch (error) {
      setError(error.message || '指導員ログイン処理中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSatelliteSelection = async () => {
    if (!selectedSatellite) {
      setError('拠点を選択してください');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // 指導者の場合は所属企業のIDを使用
      const companyId = selectedCompany || (userData && userData.company_id);
      console.log('=== Satellite Selection Debug ===');
      console.log('selectedSatellite:', selectedSatellite);
      console.log('companyId:', companyId);
      console.log('userData:', userData);
      
      const instructorData = await instructorLoginAPI(
        credentials.id, 
        credentials.password, 
        companyId, 
        selectedSatellite
      );

      if (instructorData.success && instructorData.data) {
        const user = instructorData.data;
        const userData = {
          id: user.user_id,
          name: user.user_name,
          email: user.email || '',
          login_code: user.login_code,
          role: 'instructor',
          company_id: user.company_id,
          company_name: user.company_name,
          satellite_id: user.satellite_id,
          satellite_name: user.satellite_name,
          access_token: user.access_token,
          refresh_token: user.refresh_token
        };
        
        login(userData, user.access_token, user.refresh_token);
        
        await addOperationLog({
          action: 'ログイン',
          details: `指導員「${user.user_name}」が${user.company_name}の${user.satellite_name}でログインしました`,
          adminId: user.user_id,
          adminName: user.user_name
        });
        
        navigate('/instructor/dashboard');
      } else {
        throw new Error(instructorData.message || '指導員ログインに失敗しました');
      }
    } catch (error) {
      setError(error.message || '指導員ログイン処理中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setShowDashboardSelection(false);
    setShowCompanySelection(false);
    setShowSatelliteSelection(false);
    setUserData(null);
    setCompanies([]);
    setSelectedCompany('');
    setSelectedSatellite('');
    setError('');
  };

  // ダッシュボード選択画面
  if (showDashboardSelection) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-purple-600 flex items-center justify-center p-5">
        <div className="bg-white rounded-2xl p-8 shadow-2xl w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-indigo-600 mb-2">Study Sphere</h1>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">ダッシュボード選択</h2>
            <p className="text-gray-600">ログインするダッシュボードを選択してください</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => handleDashboardSelection('admin')}
              className="w-full bg-gradient-to-r from-red-500 to-red-400 text-white py-3 px-4 rounded-lg hover:from-red-600 hover:to-red-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              🏢 管理者ダッシュボード
            </button>
            <button
              onClick={() => handleDashboardSelection('instructor')}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-700 text-white py-3 px-4 rounded-lg hover:from-indigo-700 hover:to-purple-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              👨‍🏫 指導員ダッシュボード
            </button>
            <button
              onClick={handleBackToLogin}
              className="w-full bg-gray-500 text-white py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors"
            >
              ← 戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 拠点選択画面（指導者用）
  if (showSatelliteSelection) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-purple-600 flex items-center justify-center p-5">
        <div className="bg-white rounded-2xl p-8 shadow-2xl w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-indigo-600 mb-2">Study Sphere</h1>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">拠点選択</h2>
            <p className="text-gray-600">ログインする拠点を選択してください</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                拠点
              </label>
              <select
                value={selectedSatellite}
                onChange={(e) => setSelectedSatellite(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">拠点を選択してください</option>
                {satellites.map(satellite => (
                  <option key={satellite.id} value={satellite.id}>
                    {satellite.name} {satellite.isManager ? '(管理者)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleSatelliteSelection}
              disabled={isLoading || !selectedSatellite}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-700 text-white py-3 px-4 rounded-lg hover:from-indigo-700 hover:to-purple-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'ログイン中...' : 'ログイン'}
            </button>

            <button
              onClick={handleBackToLogin}
              className="w-full bg-gray-500 text-white py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors"
            >
              ← 戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 企業・拠点選択画面（管理者用）
  if (showCompanySelection) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-purple-600 flex items-center justify-center p-5">
        <div className="bg-white rounded-2xl p-8 shadow-2xl w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-indigo-600 mb-2">Study Sphere</h1>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">企業・拠点選択</h2>
            <p className="text-gray-600">ログインする企業と拠点を選択してください（管理者用）</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              <div style={{ whiteSpace: 'pre-line' }}>
                {error}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                企業
              </label>
              <select
                value={selectedCompany}
                onChange={(e) => {
                  setSelectedCompany(e.target.value);
                  setSelectedSatellite('');
                }}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">企業を選択してください</option>
                {companies.map(company => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                拠点
              </label>
              <select
                value={selectedSatellite}
                onChange={(e) => setSelectedSatellite(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                disabled={!selectedCompany}
              >
                <option value="">拠点を選択してください</option>
                {selectedCompany && companies
                  .find(c => c.id === parseInt(selectedCompany))
                  ?.satellites.map(satellite => (
                    <option key={satellite.id} value={satellite.id}>
                      {satellite.name} {satellite.isManager ? '(管理者)' : ''}
                    </option>
                  ))}
              </select>
            </div>

            <button
              onClick={handleCompanySelection}
              disabled={isLoading || !selectedCompany || !selectedSatellite}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'ログイン中...' : 'ログイン'}
            </button>

            <button
              onClick={handleBackToLogin}
              className="w-full bg-gray-500 text-white py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors"
            >
              ← 戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 通常のログイン画面
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
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="ユーザーIDを入力"
              options={SANITIZE_OPTIONS}
            />
          </div>

          <div className="mb-6">
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
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="パスワードを入力"
              options={SANITIZE_OPTIONS}
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              <div style={{ whiteSpace: 'pre-line' }}>
                {error}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>

        <div className="text-center mt-4">
          <button
            onClick={clearCache}
            className="text-sm text-gray-600 hover:underline"
          >
            キャッシュをクリアして再ログイン
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 