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
      5: '拠点管理者',
      9: 'アドミンユーザ',
      10: 'マスターユーザ'
    };
    
    const numericRoleId = parseInt(roleId, 10);
    let roleName = roleMap[numericRoleId] || '指導員';
    
    const isManager = isCurrentSatelliteManager();
    
    console.log('ロール名判定:', {
      roleId: roleId,
      numericRoleId: numericRoleId,
      baseRoleName: roleName,
      isManager: isManager,
      currentSatellite: currentSatellite
    });
    
    // ロール4（指導員）で現在の拠点の管理者の場合は「拠点管理者」と表示
    if (numericRoleId === 4 && isManager) {
      roleName = '拠点管理者';
      console.log('拠点管理者として表示に変更');
    }
    

    
    // デバッグ用: 一時的にロール4のユーザーを管理者として表示
    // if (numericRoleId === 4) {
    //   roleName = '拠点管理者';
    //   console.log('デバッグ用: 強制的に拠点管理者として表示');
    // }
    
    console.log('最終的なロール名:', roleName);
    return roleName;
  };

  // ユーザーの実際のロール番号を取得
  const getActualRoleId = () => {
    // まずJWTトークンからロール情報を取得
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      const decodedToken = decodeJWT(accessToken);
      if (decodedToken && decodedToken.role) {
        console.log('JWTトークンから取得したロール:', decodedToken.role);
        return decodedToken.role;
      }
    }
    
    // JWTから取得できない場合は、ユーザーオブジェクトのroleを試行
    console.log('ユーザーオブジェクトから取得したロール:', user?.role);
    return user?.role;
  };

  // 現在の拠点で拠点管理者かどうかを判定
  const isCurrentSatelliteManager = () => {
    if (!currentSatellite || !userSatellites) {
      console.log('拠点管理者判定: 拠点情報が不足');
      return false;
    }
    
    // ユーザーIDを取得
    const accessToken = localStorage.getItem('accessToken');
    let userId = null;
    if (accessToken) {
      const decodedToken = decodeJWT(accessToken);
      userId = decodedToken?.user_id;
    }
    
    // APIから返されたis_managerの値を確認
    const apiIsManager = currentSatellite.is_manager === true;
    
    // バックアップ判定: ユーザーIDが拠点の管理者リストに含まれているかチェック
    let backupIsManager = false;
    if (userId && currentSatellite.manager_ids) {
      try {
        // manager_idsが既に配列の場合はそのまま使用、文字列の場合はパース
        let managerIds = currentSatellite.manager_ids;
        if (typeof managerIds === 'string') {
          managerIds = JSON.parse(managerIds);
        }
        
        console.log('フロントエンド管理者判定詳細:', {
          userId: userId,
          userIdType: typeof userId,
          managerIds: managerIds,
          managerIdsType: typeof managerIds,
          isArray: Array.isArray(managerIds)
        });
        
        if (Array.isArray(managerIds)) {
          // 数値として比較（より確実な方法）
          const userIdNum = parseInt(userId);
          backupIsManager = managerIds.some(managerId => {
            const managerIdNum = parseInt(managerId);
            const isMatch = managerIdNum === userIdNum;
            
            console.log(`フロントエンド管理者ID比較: ${managerId} (${typeof managerId}) == ${userId} (${typeof userId})`, {
              managerIdNum,
              userIdNum,
              isMatch
            });
            
            return isMatch;
          });
        }
      } catch (error) {
        console.error('manager_ids parse error:', error);
      }
    }
    
    const finalIsManager = apiIsManager || backupIsManager;
    
    console.log('拠点管理者判定詳細:', {
      userId: userId,
      satelliteName: currentSatellite.name,
      satelliteId: currentSatellite.id,
      apiIsManager: apiIsManager,
      backupIsManager: backupIsManager,
      finalIsManager: finalIsManager,
      managerIds: currentSatellite.manager_ids,
      satelliteData: currentSatellite
    });
    
    return finalIsManager;
  };

  // 管理者設定を実行する関数
  const setCurrentUserAsManager = async () => {
    if (!currentSatellite) {
      console.log('拠点が選択されていません');
      return;
    }
    
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      console.log('アクセストークンがありません');
      return;
    }
    
    const decodedToken = decodeJWT(accessToken);
    const userId = decodedToken?.user_id;
    
    if (!userId) {
      console.log('ユーザーIDが取得できません');
      return;
    }
    
    try {
      console.log('管理者設定を実行中...', {
        satelliteId: currentSatellite.id,
        userId: userId
      });
      
      const response = await fetch('http://localhost:5000/api/set-satellite-manager', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          satelliteId: currentSatellite.id,
          userId: userId
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('管理者設定が完了しました:', result.message);
        // ユーザー情報を再取得
        await loadUserInfo();
      } else {
        console.error('管理者設定に失敗しました:', result.message);
      }
    } catch (error) {
      console.error('管理者設定エラー:', error);
    }
  };

  // ユーザー情報を取得
  const loadUserInfo = async () => {
    setLoading(true);
    try {
      const result = await getUserInfo();
      if (result.success && result.data) {
        const { user: userInfo, satellites, companies } = result.data;
        
        console.log('APIから取得したユーザー情報:', userInfo);
        console.log('APIから取得したロール:', userInfo.role);
        console.log('APIから取得した拠点情報:', satellites);
        console.log('APIから取得した企業情報:', companies);
        
        // アドミン権限（ロール9以上）の場合の特別処理
        if (userInfo.role >= 9) {
          // アドミンは全企業・拠点にアクセス可能
          setCurrentCompany({
            id: null,
            name: 'システム管理者',
            address: null,
            phone: null
          });
          
          // ログイン時に選択された拠点を優先して設定
          const selectedSatelliteId = user?.satellite_id;
          if (selectedSatelliteId && satellites && satellites.length > 0) {
            const selectedSatellite = satellites.find(s => s.id === selectedSatelliteId);
            if (selectedSatellite) {
              setCurrentSatellite(selectedSatellite);
            } else {
              // 選択された拠点が見つからない場合は最初の拠点を設定
              setCurrentSatellite(satellites[0]);
            }
          } else if (satellites && satellites.length > 0) {
            // 拠点情報がない場合は最初の拠点をデフォルトとして設定
            console.log('アドミン用デフォルト拠点を設定:', satellites[0]);
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
          
          // ログイン時に選択された拠点を優先して設定
          const selectedSatelliteId = user?.satellite_id;
          if (selectedSatelliteId && satellites && satellites.length > 0) {
            const selectedSatellite = satellites.find(s => s.id === selectedSatelliteId);
            if (selectedSatellite) {
              setCurrentSatellite(selectedSatellite);
            } else {
              // 選択された拠点が見つからない場合は最初の拠点を設定
              setCurrentSatellite(satellites[0]);
            }
          } else if (satellites && satellites.length > 0) {
            // 拠点情報がない場合は最初の拠点をデフォルトとして設定
            console.log('通常ユーザー用デフォルト拠点を設定:', satellites[0]);
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
    // 初期化時にロール情報を更新
    updateRoleInfo();
  }, []);

  // ロール情報を更新する関数
  const updateRoleInfo = async () => {
    try {
      const result = await getUserInfo();
      if (result.success && result.data) {
        const { user: userInfo } = result.data;
        console.log('ロール情報更新:', userInfo.role);
        
        // JWTトークンを更新
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
          const decodedToken = decodeJWT(accessToken);
          if (decodedToken && decodedToken.role !== userInfo.role) {
            console.log('JWTトークンのロールを更新:', decodedToken.role, '→', userInfo.role);
            
            // 新しいトークンを生成（バックエンドから取得）
            try {
              const refreshResponse = await fetch('http://localhost:5000/api/refresh', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  refresh_token: localStorage.getItem('refreshToken')
                })
              });
              
              if (refreshResponse.ok) {
                const refreshData = await refreshResponse.json();
                if (refreshData.success && refreshData.data) {
                  // 新しいトークンを保存
                  localStorage.setItem('accessToken', refreshData.data.access_token);
                  localStorage.setItem('refreshToken', refreshData.data.refresh_token);
                  console.log('トークンが更新されました');
                }
              }
            } catch (refreshError) {
              console.error('トークン更新エラー:', refreshError);
            }
            
            // ローカルストレージのユーザー情報も更新
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            currentUser.role = userInfo.role;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
          }
        }
      }
    } catch (error) {
      console.error('ロール情報更新エラー:', error);
    }
  };

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

  const handleSatelliteSelect = async (satellite) => {
    console.log('拠点選択:', satellite);
    setCurrentSatellite(satellite);
    if (onLocationChange) {
      onLocationChange(satellite);
    }
    
    // 拠点変更時にロール情報を更新
    await updateRoleInfo();
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