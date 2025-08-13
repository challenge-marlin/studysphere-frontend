import React, { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import { logAdminAccountOperation } from '../utils/adminLogger';
import { getUserInfo } from '../utils/api';
import CompanySatelliteSwitchModal from './CompanySatelliteSwitchModal';

const InstructorHeader = ({ user, onLocationChange }) => {
  const [isSwitchModalOpen, setIsSwitchModalOpen] = useState(false);
  const [currentCompany, setCurrentCompany] = useState(null);
  const [currentSatellite, setCurrentSatellite] = useState(null);
  const [userSatellites, setUserSatellites] = useState([]);
  const [loading, setLoading] = useState(false);
  const { logout } = useAuth();

  // JWTトークンをデコードする関数
  const decodeJWT = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('JWTデコードエラー:', error);
      return null;
    }
  };

  // ロール番号からロール名を取得する関数
  const getRoleName = (roleId) => {
    const roleMap = {
      4: '指導員',
      5: '管理者',
      9: 'アドミンユーザ',
      10: 'マスターユーザ'
    };
    
    const numericRoleId = parseInt(roleId, 10);
    return roleMap[numericRoleId] || '指導員';
  };

  // ユーザーの実際のロール番号を取得
  const getActualRoleId = () => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      const decodedToken = decodeJWT(accessToken);
      if (decodedToken && decodedToken.role) {
        return decodedToken.role;
      }
    }
    return user?.role;
  };

  // ユーザー情報を取得
  const loadUserInfo = async () => {
    setLoading(true);
    try {
      const result = await getUserInfo();
      if (result.success && result.data) {
        const { user: userInfo, satellites, companies } = result.data;
        
        // アドミン権限（ロール9以上）の場合の特別処理
        if (userInfo.role >= 9) {
          // アドミンは全企業・拠点にアクセス可能
          setCurrentCompany({
            id: null,
            name: 'システム管理者',
            address: null,
            phone: null
          });
          
          // 最初の拠点をデフォルトとして設定
          if (satellites && satellites.length > 0) {
            setCurrentSatellite(satellites[0]);
          }
          
          setUserSatellites(satellites || []);
        } else {
          // 通常のユーザー（ロール9未満）の処理
          setCurrentCompany({
            id: userInfo.company_id,
            name: userInfo.company_name,
            address: userInfo.company_address,
            phone: userInfo.company_phone
          });
          
          setUserSatellites(satellites || []);
          
          // 現在の拠点を設定（最初の拠点をデフォルトとする）
          if (satellites && satellites.length > 0) {
            setCurrentSatellite(satellites[0]);
          }
        }
      }
    } catch (error) {
      console.error('ユーザー情報取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserInfo();
  }, []);

  const handleLogout = () => {
    if (window.confirm('ログアウトしますか？')) {
      if (user && user.role === 'instructor') {
        logAdminAccountOperation('logout', user);
      }
      logout();
    }
  };

  const handleCompanySelect = (company) => {
    setCurrentCompany(company);
    // 企業が変更された場合、その企業の最初の拠点を選択
    const companySatellites = userSatellites.filter(s => s.company_id === company.id);
    if (companySatellites.length > 0) {
      setCurrentSatellite(companySatellites[0]);
    }
  };

  const handleSatelliteSelect = (satellite) => {
    setCurrentSatellite(satellite);
    if (onLocationChange) {
      onLocationChange(satellite);
    }
  };

  // ユーザーのロール名を取得
  const actualRoleId = getActualRoleId();
  const userRoleName = getRoleName(actualRoleId);
  
  // 権限チェック
  const canSwitchCompany = actualRoleId >= 9;
  const canSwitchSatellite = userSatellites.length > 1;

  return (
    <header className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white py-4 shadow-lg">
      <div className="max-w-7xl mx-auto px-5 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-white m-0">Study Sphere</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-white">{user?.name}</span>
              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-white bg-opacity-20 text-white">
                {userRoleName}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-lg font-bold">
                {currentSatellite?.name || '拠点未選択'}
              </div>
              <span className="text-sm bg-white/20 px-2 py-0.5 rounded">
                {currentSatellite?.office_type_name?.includes('学習塾') ? '📚' : 
                 currentSatellite?.office_type_name?.includes('就労移行') ? '🏢' :
                 currentSatellite?.office_type_name?.includes('A型') ? '🏭' :
                 currentSatellite?.office_type_name?.includes('B型') ? '🏗️' : '🏫'}
              </span>
            </div>
            <div className="text-sm text-white/80">
              {currentCompany?.name || '企業未選択'}
            </div>
          </div>
          <button 
            onClick={() => setIsSwitchModalOpen(true)}
            className="bg-white bg-opacity-10 text-white border-2 border-white border-opacity-30 px-4 py-2 rounded-md cursor-pointer transition-all duration-200 hover:bg-opacity-20 hover:border-opacity-50 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
            企業・拠点切り替え
          </button>
          <button 
            className="bg-white bg-opacity-10 text-white border-2 border-white border-opacity-30 px-4 py-2 rounded-md cursor-pointer transition-all duration-200 hover:bg-opacity-20 hover:border-opacity-50"
            onClick={handleLogout}
          >
            ログアウト
          </button>
        </div>
      </div>

      <CompanySatelliteSwitchModal
        isOpen={isSwitchModalOpen}
        onClose={() => setIsSwitchModalOpen(false)}
        currentCompany={currentCompany}
        currentSatellite={currentSatellite}
        onCompanySelect={handleCompanySelect}
        onSatelliteSelect={handleSatelliteSelect}
        userRole={actualRoleId}
        userSatellites={userSatellites}
      />
    </header>
  );
};

export default InstructorHeader; 