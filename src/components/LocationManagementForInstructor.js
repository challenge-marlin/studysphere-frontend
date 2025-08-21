import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './contexts/AuthContext';
import { getActualRoleId, getCurrentUserSatelliteId } from '../utils/locationUtils';
import { apiGet, apiPost, apiPut, apiDelete, reauthenticateForSatellite, updateUser } from '../utils/api';
import LocationStats from './LocationStats';
import LocationInfoDisplay from './LocationInfoDisplay';
import InstructorList from './InstructorList';
import AddInstructorForm from './AddInstructorForm';
import EditLocationForm from './EditLocationForm';
import ManagerSettings from './ManagerSettings';
import UserInstructorAssignment from './UserInstructorAssignment';

const LocationManagementForInstructor = ({ currentUser, onLocationChange }) => {
  const { updateAuthForSatellite, currentUser: authUser } = useAuth();
  
  // 権限チェック（ロール5以上のみアクセス可能）
  const actualRoleId = getActualRoleId(authUser);
  const hasPermission = actualRoleId >= 5;
  
  const [locationInfo, setLocationInfo] = useState({
    id: null,
    name: '',
    facilityName: '',
    maxStudents: 0,
    currentStudents: 0,
    instructorCount: 0,
    address: '',
    phone: '',
    manager: ''
  });

  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showAddTeacherForm, setShowAddTeacherForm] = useState(false);
  const [showEditLocationForm, setShowEditLocationForm] = useState(false);
  const [showManagerSettings, setShowManagerSettings] = useState(false);
  const [showUserInstructorAssignment, setShowUserInstructorAssignment] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  // 拠点情報と統計を取得
  const fetchLocationData = async () => {
    let satelliteId = getCurrentUserSatelliteId(currentUser);
    
    // 拠点IDが見つからない場合の処理
    if (!satelliteId) {
      try {
        console.log('拠点IDが見つからないため、ユーザー情報を更新して再試行...');
        
        // ユーザー情報を最新の状態に更新
        const userInfoResponse = await apiGet('/api/user-info');
        if (userInfoResponse && userInfoResponse.satellite_ids && userInfoResponse.satellite_ids.length > 0) {
          satelliteId = userInfoResponse.satellite_ids[0];
          console.log('更新されたユーザー情報から拠点IDを取得:', satelliteId);
        } else {
          // 管理者の場合、ログイン時選択した拠点を確認
          if (currentUser && currentUser.role >= 9 && currentUser.satellite_id) {
            satelliteId = currentUser.satellite_id;
            console.log('管理者用: ログイン時選択拠点IDを使用:', satelliteId);
          } else {
            // 拠点一覧からユーザーの拠点を特定
            console.log('拠点IDが見つからないため、拠点一覧から特定を試行...');
            const satellitesResponse = await apiGet('/api/satellites');
            console.log('拠点一覧:', satellitesResponse);
            
            // APIレスポンスの形式を確認（success/data形式）
            const satellitesData = satellitesResponse.success ? satellitesResponse.data : [];
            
            if (satellitesData && satellitesData.length > 0) {
              // 最初の拠点を使用（または適切な拠点を選択）
              satelliteId = satellitesData[0].id;
              console.log('フォールバック拠点ID:', satelliteId);
            } else {
              setError('利用可能な拠点が見つかりません。拠点を選択してください。');
              setLoading(false);
              return;
            }
          }
        }
      } catch (error) {
        console.error('拠点一覧取得エラー:', error);
        setError('拠点情報の取得に失敗しました。拠点を選択してください。');
        setLoading(false);
        return;
      }
    }

    // 拠点IDが取得できた場合、selectedSatelliteを更新
    if (satelliteId) {
      try {
        const satelliteResponse = await apiGet(`/api/satellites/${satelliteId}`);
        const satelliteData = satelliteResponse.success ? satelliteResponse.data : null;
        
        if (satelliteData && satelliteData.id) {
          // 現在の拠点情報をselectedSatelliteに保存
          sessionStorage.setItem('selectedSatellite', JSON.stringify(satelliteData));
          console.log('selectedSatelliteを更新:', satelliteData);
          
          // 拠点変更時の再認証を実行（管理者の場合のみ）
          if (currentUser && currentUser.role >= 9) {
            try {
              console.log('管理者用: 拠点変更時再認証API呼び出し開始...');
              const reauthResult = await reauthenticateForSatellite(satelliteId);
              console.log('拠点変更時再認証結果:', reauthResult);
              
              if (reauthResult.success && reauthResult.data) {
                // 新しいトークンを保存
                const { access_token, refresh_token } = reauthResult.data;
                
                // ユーザー情報を更新
                const updatedUser = {
                  ...currentUser,
                  role: reauthResult.data.user.role,
                  company_id: reauthResult.data.user.company_id,
                  company_name: reauthResult.data.user.company_name,
                  satellite_id: reauthResult.data.user.satellite_id,
                  satellite_name: reauthResult.data.user.satellite_name
                };
                
                // 認証コンテキストを更新
                updateAuthForSatellite(updatedUser, access_token, refresh_token);
                console.log('拠点変更後のユーザー情報:', updatedUser);
              }
            } catch (reauthError) {
              console.error('拠点変更時再認証エラー:', reauthError);
            }
          }
        }
      } catch (error) {
        console.error('拠点情報の取得エラー（selectedSatellite更新用）:', error);
      }
    }

    try {
      console.log('拠点情報を取得中...', satelliteId);
      
      // 拠点詳細情報を取得
      const satelliteResponse = await apiGet(`/api/satellites/${satelliteId}`);
      console.log('拠点データ:', satelliteResponse);
      
      // APIレスポンスの形式を確認（success/data形式）
      const satelliteData = satelliteResponse.success ? satelliteResponse.data : null;
      
      if (!satelliteData || !satelliteData.id) {
        throw new Error('拠点データの取得に失敗しました');
      }

      // 拠点統計情報を取得
      let statsData = { stats: { current_students: 0, instructor_count: 0 } };
      try {
        const statsResponse = await apiGet(`/api/satellites/${satelliteId}/stats`);
        console.log('統計データ:', statsResponse);
        // APIレスポンスの形式を確認
        const statsResponseData = statsResponse.success ? statsResponse.data : null;
        console.log('統計データ（処理後）:', statsResponseData);
        if (statsResponseData && statsResponseData.stats) {
          statsData = statsResponseData;
          console.log('統計データ設定完了:', statsData);
        } else {
          console.warn('統計データの形式が不正です:', statsResponseData);
          // フォールバック: 指導者一覧から数を計算
          try {
            const instructorsResponse = await apiGet(`/api/satellites/${satelliteId}/instructors`);
            const instructorsData = instructorsResponse.success ? instructorsResponse.data : [];
            const activeInstructors = Array.isArray(instructorsData) ? instructorsData.filter(i => i.status === 1).length : 0;
            statsData = { stats: { current_students: 0, instructor_count: activeInstructors } };
            console.log('フォールバック統計データ:', statsData);
          } catch (fallbackError) {
            console.warn('フォールバック統計データ取得にも失敗:', fallbackError);
          }
        }
      } catch (statsError) {
        console.warn('統計データの取得に失敗しました:', statsError);
        // フォールバック: 指導者一覧から数を計算
        try {
          const instructorsResponse = await apiGet(`/api/satellites/${satelliteId}/instructors`);
          const instructorsData = instructorsResponse.success ? instructorsResponse.data : [];
          const activeInstructors = Array.isArray(instructorsData) ? instructorsData.filter(i => i.status === 1).length : 0;
          statsData = { stats: { current_students: 0, instructor_count: activeInstructors } };
          console.log('フォールバック統計データ:', statsData);
        } catch (fallbackError) {
          console.warn('フォールバック統計データ取得にも失敗:', fallbackError);
        }
      }

      // 拠点情報を更新
      console.log('=== 拠点情報更新開始 ===');
      console.log('取得した拠点データ:', satelliteData);
      console.log('拠点データのmanager_ids:', satelliteData.manager_ids, '型:', typeof satelliteData.manager_ids);
      
      // 管理者名を取得
      let managers = [];
      if (satelliteData.manager_ids) {
        try {
          let managerIds = satelliteData.manager_ids;
          if (typeof managerIds === 'string') {
            if (managerIds.includes(',')) {
              managerIds = managerIds.split(',').map(id => id.trim());
            } else {
              managerIds = JSON.parse(managerIds);
            }
          }
          
          if (Array.isArray(managerIds)) {
            // 指導者一覧から管理者名を取得
            const instructorsResponse = await apiGet(`/api/satellites/${satelliteId}/instructors`);
            const instructorsData = instructorsResponse.success ? instructorsResponse.data : [];
            
            managerIds.forEach(managerId => {
              const manager = instructorsData.find(instructor => instructor.id === Number(managerId));
              if (manager) {
                managers.push(manager.name);
              }
            });
          }
        } catch (error) {
          console.error('管理者名取得エラー:', error);
        }
      }
      
      const updatedLocationInfo = {
        id: satelliteData.id,
        name: satelliteData.name || '未設定',
        facilityName: satelliteData.company_name || '未設定',
        maxStudents: satelliteData.max_users || 10,
        currentStudents: statsData.stats?.current_students || 0,
        instructorCount: statsData.stats?.instructor_count || 0,
        address: satelliteData.address || '未設定',
        phone: satelliteData.phone || '未設定',
        manager: currentUser?.name || '未設定',
        managers: managers,
        manager_ids: satelliteData.manager_ids || null
      };
      
      console.log('更新される拠点情報:', updatedLocationInfo);
      console.log('拠点情報のmanager_ids詳細:', {
        value: updatedLocationInfo.manager_ids,
        type: typeof updatedLocationInfo.manager_ids,
        isNull: updatedLocationInfo.manager_ids === null,
        isUndefined: updatedLocationInfo.manager_ids === undefined
      });
      console.log('統計データ詳細:', {
        statsData: statsData,
        currentStudents: statsData.stats?.current_students,
        instructorCount: statsData.stats?.instructor_count
      });
      console.log('=== 拠点情報更新完了 ===');
      
      setLocationInfo(updatedLocationInfo);
      
      // 親コンポーネントに拠点情報の更新を通知（初回のみ）
      if (onLocationChange && !locationInfo.id) {
        onLocationChange({
          id: satelliteData.id,
          name: satelliteData.name,
          company_name: satelliteData.company_name,
          max_users: satelliteData.max_users,
          address: satelliteData.address,
          phone: satelliteData.phone
        });
      }

    } catch (error) {
      console.error('拠点情報取得エラー:', error);
      console.error('エラー詳細:', {
        satelliteId,
        currentUser: currentUser?.id,
        errorMessage: error.message,
        errorStack: error.stack
      });
      setError(`拠点情報の取得に失敗しました: ${error.message}`);
    }
  };

  // 指導者一覧を取得
  const fetchInstructors = async () => {
    let satelliteId = getCurrentUserSatelliteId(currentUser);
    if (!satelliteId) {
      // 拠点IDが見つからない場合、拠点一覧から取得
      try {
        const satellitesResponse = await apiGet('/api/satellites');
        // APIレスポンスの形式を確認（success/data形式または直接データ形式）
        const satellitesData = satellitesResponse.success ? satellitesResponse.data : satellitesResponse;
        if (satellitesData && satellitesData.length > 0) {
          satelliteId = satellitesData[0].id;
        } else {
          return;
        }
      } catch (error) {
        console.error('拠点一覧取得エラー:', error);
        return;
      }
    }

    try {
      console.log('指導者一覧を取得中...', satelliteId);
      const response = await apiGet(`/api/satellites/${satelliteId}/instructors`);
      console.log('指導者データ:', response);

      // APIレスポンスの形式を確認（success/data形式または直接データ形式）
      let instructorsData;
      if (response.success && response.data) {
        instructorsData = response.data;
      } else if (Array.isArray(response)) {
        instructorsData = response;
      } else {
        instructorsData = [];
      }
      
      console.log('処理後の指導者データ:', instructorsData);
      setInstructors(instructorsData);
    } catch (error) {
      console.error('指導者一覧取得エラー:', error);
      // 指導者一覧の取得に失敗しても拠点情報は表示する
      setInstructors([]);
    }
  };

  // 初期データ読み込み
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // 現在のユーザー情報を確認
        console.log('コンポーネント初期化 - 現在のユーザー:', currentUser);
        
        if (!currentUser) {
          setError('ユーザー情報が取得できません');
          setLoading(false);
          return;
        }
        
        // 拠点情報と指導者一覧を並行して取得
        await Promise.all([
          fetchLocationData(),
          fetchInstructors()
        ]);
      } catch (error) {
        console.error('データ読み込みエラー:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    // 初回実行
    loadData();
  }, []); // 空の依存配列で初回のみ実行

  // ユーザー情報または選択中の拠点が変更された場合にデータを再読み込み
  useEffect(() => {
    const loadData = async () => {
      if (!currentUser) return;
      
      console.log('ユーザー情報または拠点選択が変更されました - データを再読み込み');
      
      // 拠点情報が変更された場合、古いselectedSatellite情報をクリア
      if (currentUser.satellite_ids && currentUser.satellite_ids.length > 0) {
        const currentSatelliteId = currentUser.satellite_ids[0];
        const selectedSatellite = sessionStorage.getItem('selectedSatellite');
        
        if (selectedSatellite) {
          try {
            const parsedSatellite = JSON.parse(selectedSatellite);
            if (parsedSatellite.id !== currentSatelliteId) {
              console.log('拠点情報が変更されました。古いselectedSatellite情報をクリアします。');
              sessionStorage.removeItem('selectedSatellite');
            }
          } catch (error) {
            console.error('selectedSatelliteのパースエラー:', error);
            sessionStorage.removeItem('selectedSatellite');
          }
        }
      }
      
      setLoading(true);
      setError(null);
      
      try {
        // 拠点情報と指導者一覧を並行して取得
        await Promise.all([
          fetchLocationData(),
          fetchInstructors()
        ]);
      } catch (error) {
        console.error('データ再読み込みエラー:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    // 初回以外で実行（無限ループを防ぐため、前回の値と比較）
    if (currentUser) {
      loadData();
    }
  }, [currentUser?.id]); // ユーザーIDのみを依存配列に含める（satellite_idsは削除）

  // localStorageの変更を監視（企業切り替えや拠点選択の変更を検知）
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'currentUser' || e.key === 'selectedSatellite') {
        console.log('localStorageが変更されました:', e.key);
        
        // 無限ループを防ぐため、現在の状態と比較
        const currentSatelliteId = getCurrentUserSatelliteId(currentUser);
        const currentLocationId = locationInfo.id;
        
        // 拠点IDが実際に変更された場合のみ再読み込み
        if (currentSatelliteId && currentSatelliteId !== currentLocationId) {
          console.log('拠点IDが変更されました。データを再読み込みします。');
          setTimeout(() => {
            const loadData = async () => {
              if (!currentUser) return;
              
              console.log('localStorage変更によりデータを再読み込み');
              setLoading(true);
              setError(null);
              
              try {
                await Promise.all([
                  fetchLocationData(),
                  fetchInstructors()
                ]);
              } catch (error) {
                console.error('localStorage変更後のデータ再読み込みエラー:', error);
                setError(error.message);
              } finally {
                setLoading(false);
              }
            };
            
            loadData();
          }, 100);
        } else {
          console.log('拠点IDに変更がないため、再読み込みをスキップします。');
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // クリーンアップ
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [currentUser, locationInfo.id]); // locationInfo.idを依存配列に追加

  // ユーザー情報を最新の状態に更新
  const updateUserInfo = async () => {
    try {
      console.log('ユーザー情報を最新の状態に更新中...');
      const response = await apiGet('/api/user-info');
      console.log('最新のユーザー情報:', response);
      
      // APIレスポンスの形式を確認（success/data形式または直接データ形式）
      const userData = response.success ? response.data : response;
      
      if (userData && userData.id) {
        // localStorageを更新（無限ループを避けるため、現在のユーザー情報と比較）
        const currentStoredUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        if (JSON.stringify(currentStoredUser) !== JSON.stringify(userData)) {
          localStorage.setItem('currentUser', JSON.stringify(userData));
          console.log('ユーザー情報を更新しました');
        } else {
          console.log('ユーザー情報は既に最新です');
        }
        return userData;
      } else {
        console.warn('ユーザー情報の形式が不正です:', response);
        return null;
      }
    } catch (error) {
      console.error('ユーザー情報更新エラー:', error);
      console.error('エラー詳細:', {
        errorMessage: error.message,
        errorStack: error.stack
      });
      // エラーが発生しても処理を継続
      return null;
    }
  };

  // 指導者追加処理
  const handleAddInstructor = async (instructorData) => {
    setFormLoading(true);
    try {
      const satelliteId = getCurrentUserSatelliteId(currentUser);
      const response = await apiPost(`/api/satellites/${satelliteId}/instructors`, instructorData);
      
      if (response.success) {
        console.log('指導者追加成功:', response);
        setShowAddTeacherForm(false);
        // 指導者一覧を再取得
        await fetchInstructors();
        // 拠点統計も更新
        await fetchLocationData();
      } else {
        console.error('指導者追加失敗:', response);
        alert('指導者の追加に失敗しました: ' + (response.message || '不明なエラー'));
      }
    } catch (error) {
      console.error('指導者追加エラー:', error);
      alert('指導者の追加に失敗しました: ' + error.message);
    } finally {
      setFormLoading(false);
    }
  };

  // 指導者削除処理
  const handleDeleteInstructor = async (instructorId) => {
    if (!window.confirm('この指導者を削除しますか？')) {
      return;
    }

    try {
      const satelliteId = getCurrentUserSatelliteId(currentUser);
      const response = await apiDelete(`/api/satellites/${satelliteId}/instructors/${instructorId}`);
      
      if (response.success) {
        console.log('指導者削除成功:', response);
        // 指導者一覧を再取得
        await fetchInstructors();
        // 拠点統計も更新
        await fetchLocationData();
      } else {
        console.error('指導者削除失敗:', response);
        alert('指導者の削除に失敗しました: ' + (response.message || '不明なエラー'));
      }
    } catch (error) {
      console.error('指導者削除エラー:', error);
      alert('指導者の削除に失敗しました: ' + error.message);
    }
  };

  // 管理者設定切り替え処理
  const handleToggleManager = async (instructorId, isManager) => {
    try {
      const satelliteId = getCurrentUserSatelliteId(currentUser);
      const response = await apiPut(`/api/satellites/${satelliteId}/instructors/${instructorId}/manager`, {
        is_manager: isManager
      });
      
      if (response.success) {
        console.log('管理者設定変更成功:', response);
        // 指導者一覧を再取得
        await fetchInstructors();
        // 拠点情報も更新（manager_idsが変更される可能性があるため）
        await fetchLocationData();
      } else {
        console.error('管理者設定変更失敗:', response);
        alert('管理者設定の変更に失敗しました: ' + (response.message || '不明なエラー'));
      }
    } catch (error) {
      console.error('管理者設定変更エラー:', error);
      alert('管理者設定の変更に失敗しました: ' + error.message);
    }
  };

  // 拠点情報更新処理
  const handleUpdateLocation = async (locationData) => {
    setFormLoading(true);
    try {
      const satelliteId = getCurrentUserSatelliteId(currentUser);
      // 最大利用者数は管理者ダッシュボードでの操作のため除外
      const { maxStudents, ...updateData } = locationData;
      const response = await apiPut(`/api/satellites/${satelliteId}`, updateData);
      
      if (response.success) {
        console.log('拠点情報更新成功:', response);
        setShowEditLocationForm(false);
        // 拠点情報を再取得
        await fetchLocationData();
      } else {
        console.error('拠点情報更新失敗:', response);
        alert('拠点情報の更新に失敗しました: ' + (response.message || '不明なエラー'));
      }
    } catch (error) {
      console.error('拠点情報更新エラー:', error);
      alert('拠点情報の更新に失敗しました: ' + error.message);
    } finally {
      setFormLoading(false);
    }
  };

  // 管理者設定更新処理
  const handleUpdateManagerSettings = async (managerIds) => {
    setFormLoading(true);
    try {
      const satelliteId = getCurrentUserSatelliteId(currentUser);
      const response = await apiPut(`/api/satellites/${satelliteId}/managers`, {
        manager_ids: managerIds
      });
      
      if (response.success) {
        console.log('管理者設定更新成功:', response);
        setShowManagerSettings(false);
        // 拠点情報を再取得（manager_idsが変更されるため）
        await fetchLocationData();
        // 指導者一覧も再取得
        await fetchInstructors();
      } else {
        console.error('管理者設定更新失敗:', response);
        alert('管理者設定の更新に失敗しました: ' + (response.message || '不明なエラー'));
      }
    } catch (error) {
      console.error('管理者設定更新エラー:', error);
      alert('管理者設定の更新に失敗しました: ' + error.message);
    } finally {
      setFormLoading(false);
    }
  };

  // 指導者編集処理
  const handleEditInstructor = async (instructorId, instructorData) => {
    setFormLoading(true);
    try {
      const response = await updateUser(instructorId, instructorData);
      
      if (response.success) {
        console.log('指導者編集成功:', response);
        alert('指導者情報を更新しました');
        // 指導者一覧を再取得
        await fetchInstructors();
      } else {
        console.error('指導者編集失敗:', response);
        alert('指導者の編集に失敗しました: ' + (response.message || '不明なエラー'));
      }
    } catch (error) {
      console.error('指導者編集エラー:', error);
      alert('指導者の編集に失敗しました: ' + error.message);
    } finally {
      setFormLoading(false);
    }
  };

  // 権限がない場合の表示
  if (!hasPermission) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">アクセス権限がありません</h3>
          <p className="text-gray-600">
            この機能にアクセスするには、拠点管理者以上の権限が必要です。
          </p>
        </div>
      </div>
    );
  }

  // ローディング中の表示
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">データを読み込み中...</p>
        </div>
      </div>
    );
  }

  // エラー時の表示
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-red-800 mb-2">エラーが発生しました</h3>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            再読み込み
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 拠点統計 */}
      <LocationStats locationInfo={locationInfo} />
      
      {/* 拠点情報 */}
      <LocationInfoDisplay
        locationInfo={locationInfo}
        onEditClick={() => setShowEditLocationForm(true)}
        hasPermission={hasPermission}
      />
      
      {/* 指導者一覧 */}
      <InstructorList
        instructors={instructors}
        locationInfo={locationInfo}
        onAddInstructor={() => setShowAddTeacherForm(true)}
        onToggleManager={handleToggleManager}
        onDeleteInstructor={handleDeleteInstructor}
        onEditInstructor={handleEditInstructor}
        hasPermission={hasPermission}
        loading={formLoading}
      />
      
      {/* 管理者設定ボタン */}
      {hasPermission && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex space-x-4">
            <button
              onClick={() => setShowManagerSettings(true)}
              className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              管理者設定
            </button>
            <button
              onClick={() => setShowUserInstructorAssignment(true)}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              利用者担当指導員管理
            </button>
          </div>
        </div>
      )}

      {/* モーダル */}
      {showAddTeacherForm && (
        <AddInstructorForm
          onSubmit={handleAddInstructor}
          onCancel={() => setShowAddTeacherForm(false)}
          loading={formLoading}
        />
      )}

      {showEditLocationForm && (
        <EditLocationForm
          locationInfo={locationInfo}
          onSubmit={handleUpdateLocation}
          onCancel={() => setShowEditLocationForm(false)}
          loading={formLoading}
        />
      )}

      {showManagerSettings && (
        <ManagerSettings
          instructors={instructors}
          locationInfo={locationInfo}
          onUpdateManagerSettings={handleUpdateManagerSettings}
          onCancel={() => setShowManagerSettings(false)}
          loading={formLoading}
        />
      )}

      {showUserInstructorAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-11/12 max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">利用者担当指導員管理</h2>
              <button
                onClick={() => setShowUserInstructorAssignment(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <UserInstructorAssignment
              satelliteId={locationInfo.id}
              onUpdate={() => {
                // 必要に応じて親コンポーネントの更新処理を呼び出す
                fetchLocationData();
                fetchInstructors();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationManagementForInstructor;
