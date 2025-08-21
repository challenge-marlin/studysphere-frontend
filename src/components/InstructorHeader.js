import React, { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import { logAdminAccountOperation } from '../utils/adminLogger';
import { getUserInfo, reauthenticateForSatellite } from '../utils/api';
import CompanySatelliteSwitchModal from './CompanySatelliteSwitchModal';

const InstructorHeader = ({ user, onLocationChange }) => {
  const [isSwitchModalOpen, setIsSwitchModalOpen] = useState(false);
  const [currentCompany, setCurrentCompany] = useState(null);
  const [currentSatellite, setCurrentSatellite] = useState(null);
  const [userSatellites, setUserSatellites] = useState([]);
  const [loading, setLoading] = useState(false);
  const { logout, updateAuthForSatellite } = useAuth();

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
      9: 'システム管理者',
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
    
    // 管理者（ロール9以上）が指導員ダッシュボードにいる場合は「システム管理者」と表示
    if (numericRoleId >= 9) {
      roleName = 'システム管理者';
      console.log('システム管理者として表示');
    }
    
    console.log('最終的なロール名:', roleName);
    return roleName;
  };

  // ユーザーの実際のロール番号を取得（無限ループ防止版）
  const getActualRoleId = () => {
    // まずJWTトークンからロール情報を取得
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      const decodedToken = decodeJWT(accessToken);
      console.log('JWTトークンデコード結果:', decodedToken);
      if (decodedToken && decodedToken.role) {
        console.log('JWTトークンから取得したロール:', decodedToken.role);
        
        // 拠点管理者判定をチェック
        const isManager = isCurrentSatelliteManager();
        if (decodedToken.role === 4 && isManager) {
          console.log('拠点管理者として判定されたため、ロールを5に更新します');
          // 拠点管理者の場合はロール5として扱う
          return 5;
        }
        
        return decodedToken.role;
      }
    }
    
    // JWTから取得できない場合は、ユーザーオブジェクトのroleを試行
    console.log('ユーザーオブジェクトから取得したロール:', user?.role);
    return user?.role;
  };

  // 現在の拠点で拠点管理者かどうかを判定（無限ループ防止版）
  const isCurrentSatelliteManager = () => {
    if (!currentSatellite) {
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
    
    if (!userId) {
      console.log('拠点管理者判定: ユーザーIDが取得できません');
      return false;
    }
    
    console.log('管理者判定開始:', {
      userId: userId,
      satelliteId: currentSatellite.id,
      satelliteName: currentSatellite.name,
      managerIds: currentSatellite.manager_ids,
      isManager: currentSatellite.is_manager
    });
    
    // APIから返されたis_managerの値を確認
    const apiIsManager = currentSatellite.is_manager === true;
    
    // バックアップ判定: ユーザーIDが拠点の管理者リストに含まれているかチェック
    let backupIsManager = false;
    if (currentSatellite.manager_ids) {
      try {
        // manager_idsが既に配列の場合はそのまま使用、文字列の場合はパース
        let managerIds = currentSatellite.manager_ids;
        if (typeof managerIds === 'string') {
          managerIds = JSON.parse(managerIds);
        }
        
        console.log('管理者ID解析結果:', {
          originalManagerIds: currentSatellite.manager_ids,
          parsedManagerIds: managerIds,
          isArray: Array.isArray(managerIds),
          length: Array.isArray(managerIds) ? managerIds.length : 0
        });
        
        if (Array.isArray(managerIds)) {
          // 数値として比較（より確実な方法）
          const userIdNum = parseInt(userId);
          backupIsManager = managerIds.some(managerId => {
            const managerIdNum = parseInt(managerId);
            const isMatch = managerIdNum === userIdNum;
            
            console.log(`管理者ID比較: ${managerId} (${typeof managerId}) == ${userId} (${typeof userId}) = ${isMatch}`, {
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
    
    console.log('拠点管理者判定最終結果:', {
      userId: userId,
      satelliteName: currentSatellite.name,
      satelliteId: currentSatellite.id,
      apiIsManager: apiIsManager,
      backupIsManager: backupIsManager,
      finalIsManager: finalIsManager,
      managerIds: currentSatellite.manager_ids,
      userRole: user?.role
    });
    
    return finalIsManager;
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
           // ログイン時に選択された拠点を優先して設定
           const selectedSatelliteId = user?.satellite_id;
           let targetSatellite = null;
           
           if (selectedSatelliteId && satellites && satellites.length > 0) {
             const selectedSatellite = satellites.find(s => s.id === selectedSatelliteId);
             if (selectedSatellite) {
               targetSatellite = selectedSatellite;
             } else {
               // 選択された拠点が見つからない場合は最初の拠点を設定
               targetSatellite = satellites[0];
             }
           } else if (satellites && satellites.length > 0) {
             // 拠点情報がない場合は最初の拠点をデフォルトとして設定
             console.log('アドミン用デフォルト拠点を設定:', satellites[0]);
             targetSatellite = satellites[0];
           }
           
           // 拠点が設定された場合、その拠点の企業情報を取得
           if (targetSatellite) {
             // 拠点情報に含まれている企業情報を使用
             if (targetSatellite.company_name) {
               setCurrentCompany({
                 id: targetSatellite.company_id,
                 name: targetSatellite.company_name,
                 address: targetSatellite.company_address || null,
                 phone: targetSatellite.company_phone || null
               });
             } else {
               // 企業情報が見つからない場合はシステム管理者として設定
               setCurrentCompany({
                 id: null,
                 name: 'システム管理者',
                 address: null,
                 phone: null
               });
             }
             
             setCurrentSatellite(targetSatellite);
             
             // 拠点設定後の再認証処理
             try {
               console.log('拠点設定後の再認証API呼び出し開始...');
               const reauthResult = await reauthenticateForSatellite(targetSatellite.id);
               console.log('拠点設定後の再認証結果:', reauthResult);
               
               if (reauthResult.success && reauthResult.data) {
                 // 新しいトークンを保存
                 const { access_token, refresh_token } = reauthResult.data;
                 
                 // ユーザー情報を更新
                 const updatedUser = {
                   ...user,
                   role: reauthResult.data.user.role,
                   company_id: reauthResult.data.user.company_id,
                   company_name: reauthResult.data.user.company_name,
                   satellite_id: reauthResult.data.user.satellite_id,
                   satellite_name: reauthResult.data.user.satellite_name
                 };
                 
                 // 認証コンテキストを更新
                 updateAuthForSatellite(updatedUser, access_token, refresh_token);
                 console.log('拠点設定後のユーザー情報:', updatedUser);
               }
             } catch (reauthError) {
               console.error('拠点設定後の再認証エラー:', reauthError);
             }
           } else {
             // 拠点情報がない場合はシステム管理者として設定
             setCurrentCompany({
               id: null,
               name: 'システム管理者',
               address: null,
               phone: null
             });
           }
           
           setUserSatellites(Array.isArray(satellites) ? satellites : []);
        } else {
          // 通常のユーザー（ロール9未満）の処理
          setCurrentCompany({
            id: userInfo.company_id,
            name: userInfo.company_name,
            address: userInfo.company_address,
            phone: userInfo.company_phone
          });
          
          setUserSatellites(Array.isArray(satellites) ? satellites : []);
          
          // ログイン時に選択された拠点を優先して設定
          const selectedSatelliteId = user?.satellite_id;
          let targetSatellite = null;
          
          if (selectedSatelliteId && satellites && satellites.length > 0) {
            const selectedSatellite = satellites.find(s => s.id === selectedSatelliteId);
            if (selectedSatellite) {
              targetSatellite = selectedSatellite;
            } else {
              // 選択された拠点が見つからない場合は最初の拠点を設定
              targetSatellite = satellites[0];
            }
          } else if (satellites && satellites.length > 0) {
            // 拠点情報がない場合は最初の拠点をデフォルトとして設定
            console.log('通常ユーザー用デフォルト拠点を設定:', satellites[0]);
            targetSatellite = satellites[0];
          }
          
          console.log('targetSatellite設定結果:', {
            selectedSatelliteId: selectedSatelliteId,
            satellitesLength: satellites?.length,
            targetSatellite: targetSatellite
          });
          
          if (targetSatellite) {
            setCurrentSatellite(targetSatellite);
            
            // 拠点設定後の再認証処理
            try {
              console.log('拠点設定後の再認証API呼び出し開始...');
              const reauthResult = await reauthenticateForSatellite(targetSatellite.id);
              console.log('拠点設定後の再認証結果:', reauthResult);
              
                             if (reauthResult.success && reauthResult.data) {
                 // 新しいトークンを保存
                 const { access_token, refresh_token } = reauthResult.data;
                 
                 // ユーザー情報を更新
                 const updatedUser = {
                   ...user,
                   role: reauthResult.data.user.role,
                   company_id: reauthResult.data.user.company_id,
                   company_name: reauthResult.data.user.company_name,
                   satellite_id: reauthResult.data.user.satellite_id,
                   satellite_name: reauthResult.data.user.satellite_name
                 };
                 
                 // 認証コンテキストを更新
                 updateAuthForSatellite(updatedUser, access_token, refresh_token);
                 console.log('拠点設定後のユーザー情報:', updatedUser);
               }
            } catch (reauthError) {
              console.error('拠点設定後の再認証エラー:', reauthError);
            }
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
  }, []); // 依存配列を空にして無限ループを防止

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
          
          // 拠点管理者判定をチェック
          const isManager = isCurrentSatelliteManager();
          const shouldUpdateRole = (decodedToken.role === 4 && isManager) || 
                                  (decodedToken && decodedToken.role !== userInfo.role);
          
          if (shouldUpdateRole) {
            console.log('JWTトークンのロールを更新:', decodedToken.role, '→', isManager ? 5 : userInfo.role);
            
            // 拠点管理者の場合は再認証を実行
            if (decodedToken.role === 4 && isManager && currentSatellite) {
              try {
                console.log('拠点管理者として再認証を実行します');
                const reauthResult = await reauthenticateForSatellite(currentSatellite.id);
                if (reauthResult.success && reauthResult.data) {
                  // 新しいトークンを保存
                  const { access_token, refresh_token } = reauthResult.data;
                  localStorage.setItem('accessToken', access_token);
                  localStorage.setItem('refreshToken', refresh_token);
                  
                  // ユーザー情報を更新
                  const updatedUser = {
                    ...user,
                    role: reauthResult.data.user.role,
                    company_id: reauthResult.data.user.company_id,
                    company_name: reauthResult.data.user.company_name,
                    satellite_id: reauthResult.data.user.satellite_id,
                    satellite_name: reauthResult.data.user.satellite_name
                  };
                  
                  // 認証コンテキストを更新
                  updateAuthForSatellite(updatedUser, access_token, refresh_token);
                  console.log('拠点管理者としてトークンが更新されました');
                  return;
                }
              } catch (reauthError) {
                console.error('拠点管理者再認証エラー:', reauthError);
              }
            }
            
            // 通常のトークン更新処理
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
            currentUser.role = isManager ? 5 : userInfo.role;
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
    console.log('=== 拠点選択処理開始 ===');
    console.log('選択された拠点:', satellite);
    console.log('現在のユーザー:', user);
    
    try {
      // 拠点変更時の再認証を実行
      console.log('拠点変更時再認証API呼び出し開始...');
      const reauthResult = await reauthenticateForSatellite(satellite.id);
      console.log('拠点変更時再認証結果:', reauthResult);
      
      if (reauthResult.success && reauthResult.data) {
        // 新しいトークンを保存
        const { access_token, refresh_token } = reauthResult.data;
        
        // ユーザー情報を更新
        const updatedUser = {
          ...user,
          role: reauthResult.data.user.role,
          company_id: reauthResult.data.user.company_id,
          company_name: reauthResult.data.user.company_name,
          satellite_id: reauthResult.data.user.satellite_id,
          satellite_name: reauthResult.data.user.satellite_name
        };
        
        // 認証コンテキストを更新
        updateAuthForSatellite(updatedUser, access_token, refresh_token);
        console.log('拠点変更後のユーザー情報:', updatedUser);
        
        // 古いselectedSatellite情報をクリア
        sessionStorage.removeItem('selectedSatellite');
        console.log('古いselectedSatellite情報をクリアしました');
        
        // 新しい拠点情報をselectedSatelliteに保存
        sessionStorage.setItem('selectedSatellite', JSON.stringify(satellite));
        console.log('新しい拠点情報をselectedSatelliteに保存:', satellite);
        
        setCurrentSatellite(satellite);
        if (onLocationChange) {
          onLocationChange(satellite);
        }
        
        // 拠点変更時の処理完了
        return;
      } else {
        console.error('拠点変更時再認証に失敗:', reauthResult.message);
        alert('拠点変更に失敗しました: ' + reauthResult.message);
        return;
      }
    } catch (error) {
      console.error('拠点変更時再認証エラー:', error);
      alert('拠点変更中にエラーが発生しました: ' + error.message);
      return;
    }
    
    // 古いselectedSatellite情報をクリア
    sessionStorage.removeItem('selectedSatellite');
    console.log('古いselectedSatellite情報をクリアしました');
    
    // 新しい拠点情報をselectedSatelliteに保存
    sessionStorage.setItem('selectedSatellite', JSON.stringify(satellite));
    console.log('新しい拠点情報をselectedSatelliteに保存:', satellite);
    
    setCurrentSatellite(satellite);
    if (onLocationChange) {
      onLocationChange(satellite);
    }
    
    // 拠点変更時の処理完了
  };

  // ユーザーのロール名を取得
  const actualRoleId = getActualRoleId();
  const userRoleName = getRoleName(actualRoleId);
  
  // 権限チェック
  const canSwitchCompany = actualRoleId >= 9;
  const canSwitchSatellite = Array.isArray(userSatellites) && userSatellites.length > 1;

  return (
    <header className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white py-4 shadow-lg">
      <div className="max-w-7xl mx-auto px-5 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-white m-0">Study Sphere</h1>
        </div>
        <div className="flex items-center gap-4">
                     <div className="flex items-center gap-4">
             <div className="flex items-center gap-2">
               <span className="font-medium text-white">{user?.name}</span>
               <span className="px-2 py-1 rounded-full text-xs font-semibold bg-white bg-opacity-20 text-white">
                 {userRoleName}
               </span>
             </div>
             <div className="flex flex-col items-end">
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