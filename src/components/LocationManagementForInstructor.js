import React, { useState, useEffect, useCallback } from 'react';
import { apiGet, apiPost, apiPut, apiDelete, apiCall, reauthenticateForSatellite } from '../utils/api';
import { useAuth } from './contexts/AuthContext';

const LocationManagementForInstructor = ({ currentUser, onLocationChange }) => {
  const { updateAuthForSatellite, currentUser: authUser } = useAuth();
  
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

  // ユーザーの実際のロール番号を取得
  const getActualRoleId = () => {
    // まずJWTトークンからロール情報を取得
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      const decodedToken = decodeJWT(accessToken);
      if (decodedToken && decodedToken.role) {
        // 拠点管理者判定をチェック（簡易版）
        if (decodedToken.role === 4) {
          // 拠点管理者の場合はロール5として扱う
          return 5;
        }
        return decodedToken.role;
      }
    }
    
    // JWTから取得できない場合は、ユーザーオブジェクトのroleを試行
    return authUser?.role;
  };
  
  // 権限チェック（ロール5以上のみアクセス可能）
  const actualRoleId = getActualRoleId();
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
  const [newTeacher, setNewTeacher] = useState({
    name: '',
    username: '',
    email: '',
    department: '',
    password: ''
  });

  const [editLocation, setEditLocation] = useState({
    name: '',
    maxStudents: 0,
    address: '',
    phone: ''
  });

  // 指定された指導者が管理者かどうかをチェック（メモ化版）
  const isTeacherManager = useCallback((teacherId) => {
    console.log(`=== 指導者 ${teacherId} の管理者判定開始 ===`);
    console.log('判定対象指導者ID:', teacherId, '型:', typeof teacherId);
    console.log('現在のinstructors:', instructors);
    console.log('現在のlocationInfo:', locationInfo);
    
    // まず、instructors配列から該当する指導者を検索
    const teacher = instructors.find(t => t.id === teacherId);
    console.log('instructorsから見つかった指導者:', teacher);
    
    if (teacher && teacher.is_manager !== undefined) {
      // APIから返されたis_managerフラグを優先使用
      console.log('APIから返されたis_managerフラグを使用:', teacher.is_manager);
      console.log(`=== 指導者 ${teacherId} の管理者判定完了（APIフラグ） ===`);
      return teacher.is_manager;
    }
    
    // フォールバック: locationInfo.manager_idsを使用
    console.log('APIフラグが未定義、locationInfo.manager_idsを使用');
    if (!locationInfo.manager_ids) {
      console.log('locationInfo.manager_idsが未定義');
      console.log(`=== 指導者 ${teacherId} の管理者判定完了（manager_ids未定義） ===`);
      return false;
    }
    
    try {
      let managerIds = locationInfo.manager_ids;
      console.log('locationInfo.manager_ids生データ:', managerIds, '型:', typeof managerIds);
      
      if (typeof managerIds === 'string') {
        // カンマ区切りの文字列の場合は配列に変換
        if (managerIds.includes(',')) {
          managerIds = managerIds.split(',').map(id => id.trim());
          console.log('カンマ区切り文字列から変換:', managerIds);
        } else {
          managerIds = JSON.parse(managerIds);
          console.log('JSONパース結果:', managerIds);
        }
      }
      
      console.log('処理後のmanagerIds:', managerIds, '型:', typeof managerIds, '配列か:', Array.isArray(managerIds));
      
      let isManager = false;
      if (Array.isArray(managerIds)) {
        console.log('配列として管理者判定を実行:');
        managerIds.forEach((id, index) => {
          const idNum = Number(id);
          const teacherIdNum = Number(teacherId);
          const isMatch = idNum === teacherIdNum;
          console.log(`  比較${index + 1}: ${id} (${typeof id}) == ${teacherId} (${typeof teacherId}) = ${isMatch}`);
          if (isMatch) {
            isManager = true;
          }
        });
      } else {
        const managerIdNum = Number(managerIds);
        const teacherIdNum = Number(teacherId);
        isManager = managerIdNum === teacherIdNum;
        console.log('単一値として管理者判定:', managerIdNum, '==', teacherIdNum, '=', isManager);
      }
      
      console.log(`最終的な管理者判定結果: ${isManager}`);
      console.log(`=== 指導者 ${teacherId} の管理者判定完了（locationInfo使用） ===`);
      return isManager;
    } catch (e) {
      console.error('管理者IDチェックエラー:', e);
      console.log(`=== 指導者 ${teacherId} の管理者判定完了（エラー） ===`);
      return false;
    }
  }, [instructors, locationInfo.manager_ids]);

  // 現在のユーザーの拠点IDを取得
  const getCurrentUserSatelliteId = () => {
    console.log('現在のユーザー情報:', currentUser);
    console.log('satellite_ids:', currentUser?.satellite_ids);
    
    // 1. ユーザーのsatellite_idsから取得（最優先）
    if (currentUser && currentUser.satellite_ids && currentUser.satellite_ids.length > 0) {
      const satelliteId = currentUser.satellite_ids[0];
      console.log('ユーザーから取得した拠点ID:', satelliteId);
      
      // 拠点IDが取得できた場合、sessionStorageを同期
      const sessionSelectedSatellite = sessionStorage.getItem('selectedSatellite');
      if (sessionSelectedSatellite) {
        try {
          const parsedSatellite = JSON.parse(sessionSelectedSatellite);
          if (parsedSatellite.id !== satelliteId) {
            console.log('拠点IDが一致しません。sessionStorageのselectedSatelliteをクリアします');
            sessionStorage.removeItem('selectedSatellite');
          }
        } catch (error) {
          console.error('sessionStorageのselectedSatelliteパースエラー:', error);
          sessionStorage.removeItem('selectedSatellite');
        }
      }
      
      return satelliteId;
    }
    
    // 2. 管理者の場合、ログイン時選択した拠点を確認
    if (currentUser && currentUser.role >= 9 && currentUser.satellite_id) {
      console.log('管理者用: ログイン時選択拠点IDを使用:', currentUser.satellite_id);
      return currentUser.satellite_id;
    }
    
    // 3. localStorageから拠点情報を取得
    try {
      const storedUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      console.log('localStorageのユーザー情報:', storedUser);
      
      if (storedUser.satellite_ids && storedUser.satellite_ids.length > 0) {
        const satelliteId = storedUser.satellite_ids[0];
        console.log('localStorageから取得した拠点ID:', satelliteId);
        return satelliteId;
      }
    } catch (error) {
      console.error('localStorageの読み込みエラー:', error);
    }
    
    // 4. 選択中の拠点情報を取得（フォールバック）
    try {
      const selectedSatellite = sessionStorage.getItem('selectedSatellite');
      if (selectedSatellite) {
        const satellite = JSON.parse(selectedSatellite);
        console.log('選択中の拠点情報:', satellite);
        return satellite.id;
      }
    } catch (error) {
      console.error('選択中拠点の読み込みエラー:', error);
    }
    
    console.log('拠点IDが見つかりません');
    return null;
  };

  // 拠点情報と統計を取得
  const fetchLocationData = async () => {
    let satelliteId = getCurrentUserSatelliteId();
    
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

      // 編集用の状態も更新
      setEditLocation({
        name: satelliteData.name || '',
        maxStudents: satelliteData.max_users || 10,
        address: satelliteData.address || '',
        phone: satelliteData.phone || ''
      });

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
    let satelliteId = getCurrentUserSatelliteId();
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
        const currentSatelliteId = getCurrentUserSatelliteId();
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

  // 学習可能状況の判定
  const isOverCapacity = locationInfo.currentStudents > locationInfo.maxStudents;
  const capacityPercentage = locationInfo.maxStudents > 0 ? (locationInfo.currentStudents / locationInfo.maxStudents) * 100 : 0;
  
  // 拠点情報が取得できているかチェック
  const hasLocationInfo = locationInfo.id && locationInfo.name !== '未設定';

  // エラー表示の改善
  const renderError = () => {
    if (error) {
      return (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-red-500 mr-2">⚠️</span>
              <span className="text-red-700 font-medium">{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        </div>
      );
    }
    return null;
  };

  // データを手動でリフレッシュする関数
  const refreshData = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchLocationData(),
        fetchInstructors()
      ]);
    } catch (error) {
      console.error('データリフレッシュエラー:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    
    // バリデーション
    if (!newTeacher.username) {
      alert('ログインIDを入力してください。');
      return;
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(newTeacher.username)) {
      alert('ログインIDは半角英数字とアンダースコアのみ使用可能です。');
      return;
    }
    
    try {
      // 新しい指導者を追加するAPI呼び出し
      const response = await apiPost('/api/users', {
        name: newTeacher.name,
        username: newTeacher.username,
        password: newTeacher.password,
        role: 4, // 指導員ロール
        status: 1,
        login_code: (() => {
          // XXXX-XXXX-XXXX形式（英数大文字小文字交じり）
          const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
          const generatePart = () => {
            let result = '';
            for (let i = 0; i < 4; i++) {
              result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return result;
          };
          return `${generatePart()}-${generatePart()}-${generatePart()}`;
        })(),
        company_id: currentUser.company_id,
        satellite_ids: [getCurrentUserSatelliteId()],
        department: newTeacher.department
      });

      if (response.success) {
        // 指導者一覧を再取得
        await fetchInstructors();
        
        setNewTeacher({ name: '', username: '', email: '', department: '', password: '' });
        setShowAddTeacherForm(false);
        
        alert(`指導員が追加されました！\nログイン情報:\nログインID: ${newTeacher.username}\nパスワード: ${newTeacher.password}`);
      } else {
        throw new Error(response.message || '指導員の追加に失敗しました');
      }
    } catch (error) {
      console.error('指導員追加エラー:', error);
      alert(`指導員の追加に失敗しました: ${error.message}`);
    }
  };

  const handleLocationUpdate = async (e) => {
    e.preventDefault();
    
    const satelliteId = getCurrentUserSatelliteId();
    if (!satelliteId) return;

    try {
      const response = await apiPut(`/api/satellites/${satelliteId}`, {
        name: editLocation.name,
        max_users: parseInt(editLocation.maxStudents),
        address: editLocation.address,
        phone: editLocation.phone
      });

      if (response.success) {
        // 拠点情報を再取得
        await fetchLocationData();
        setShowEditLocationForm(false);
        alert('拠点情報が更新されました。');
      } else {
        throw new Error(response.message || '拠点情報の更新に失敗しました');
      }
    } catch (error) {
      console.error('拠点更新エラー:', error);
      alert(`拠点情報の更新に失敗しました: ${error.message}`);
    }
  };

  const toggleTeacherStatus = async (teacherId) => {
    try {
      const response = await apiPut(`/api/users/${teacherId}`, {
        status: instructors.find(t => t.id === teacherId)?.status === 1 ? 0 : 1
      });

      if (response.success) {
        // 指導者一覧を再取得
        await fetchInstructors();
      } else {
        throw new Error(response.message || '指導員ステータスの更新に失敗しました');
      }
    } catch (error) {
      console.error('指導員ステータス更新エラー:', error);
      alert(`指導員ステータスの更新に失敗しました: ${error.message}`);
    }
  };

  const toggleManagerStatus = async (teacherId, isCurrentlyManager) => {
    try {
      const satelliteId = getCurrentUserSatelliteId();
      if (!satelliteId) {
        throw new Error('拠点IDが取得できません');
      }

      // 現在の拠点の管理者情報を最新の状態で取得
      const satelliteResponse = await apiGet(`/api/satellites/${satelliteId}`);
      if (!satelliteResponse.success) {
        throw new Error('拠点情報の取得に失敗しました');
      }

      const satellite = satelliteResponse.data;
      let currentManagerIds = [];
      
      if (satellite.manager_ids) {
        // データの型と内容をログ出力
        console.log('manager_ids の生データ:', satellite.manager_ids);
        console.log('manager_ids の型:', typeof satellite.manager_ids);
        console.log('manager_ids が配列か:', Array.isArray(satellite.manager_ids));
        
        // 既に配列の場合はそのまま使用
        if (Array.isArray(satellite.manager_ids)) {
          currentManagerIds = satellite.manager_ids;
          console.log('既に配列形式です:', currentManagerIds);
        } else if (typeof satellite.manager_ids === 'string') {
          // 文字列の場合はJSONパースを試行
          try {
            const parsed = JSON.parse(satellite.manager_ids);
            // パース結果が配列の場合はそのまま、そうでなければ配列に変換
            currentManagerIds = Array.isArray(parsed) ? parsed : [parsed];
            console.log('文字列からパース成功:', currentManagerIds);
          } catch (e) {
            console.error('管理者IDのパースエラー:', e);
            console.error('パースに失敗したデータ:', satellite.manager_ids);
            currentManagerIds = [];
          }
        } else if (satellite.manager_ids !== null && satellite.manager_ids !== undefined) {
          // その他の型（数値、オブジェクトなど）の場合は配列に変換
          currentManagerIds = [satellite.manager_ids];
          console.log('その他の型を配列に変換:', currentManagerIds);
        } else {
          // null や undefined の場合は空配列
          currentManagerIds = [];
          console.log('null/undefinedのため空配列に設定');
        }
      }

      // 現在の管理者状態を正確に判定（IDの型を統一）
      const actualIsManager = currentManagerIds.some(id => Number(id) === Number(teacherId));
      
      console.log('管理者状態の比較:', {
        teacherId,
        teacherIdType: typeof teacherId,
        isCurrentlyManager,
        actualIsManager,
        currentManagerIds,
        currentManagerIdsType: typeof currentManagerIds,
        currentManagerIdsIsArray: Array.isArray(currentManagerIds)
      });

      // 実際の管理者状態に基づいてAPIエンドポイントを選択
      let response;
      if (actualIsManager) {
        // 実際に管理者の場合は削除
        response = await apiDelete(`/api/satellites/${satelliteId}/managers/${teacherId}`);
      } else {
        // 実際に管理者でない場合は設定
        response = await apiPost(`/api/instructors/${teacherId}/set-manager/${satelliteId}`);
      }

      if (response.success) {
        // 拠点情報を再取得
        await fetchLocationData();
        // 指導者一覧を再取得
        await fetchInstructors();
        alert(isCurrentlyManager ? '管理者を解除しました' : '管理者に設定しました');
      } else {
        throw new Error(response.message || '管理者ステータスの更新に失敗しました');
      }
    } catch (error) {
      console.error('管理者ステータス更新エラー:', error);
      alert(`管理者ステータスの更新に失敗しました: ${error.message}`);
    }
  };

  // 指導員削除機能
  const handleDeleteTeacher = async (teacherId) => {
    if (!window.confirm('この指導員を削除しますか？\nこの操作は取り消せません。')) {
      return;
    }

    try {
      const satelliteId = getCurrentUserSatelliteId();
      if (!satelliteId) {
        alert('拠点情報が取得できません');
        return;
      }

      // 指導員を削除
      const result = await apiCall(`/api/users/${teacherId}`, {
        method: 'DELETE'
      });
      
      if (result.success) {
        // 拠点情報を再取得
        await fetchLocationData();
        // 指導者一覧を再取得
        await fetchInstructors();
        alert('指導員を削除しました。');
      } else {
        alert(`指導員の削除に失敗しました: ${result.message}`);
      }
    } catch (error) {
      console.error('指導員削除エラー:', error);
      alert(`指導員の削除に失敗しました: ${error.message}`);
    }
  };

  const contactManagement = () => {
    alert(`運営に連絡しました。\n\n内容:\n拠点: ${locationInfo.name}\n現在の生徒数: ${locationInfo.currentStudents}名\n最大受入数: ${locationInfo.maxStudents}名\n\n至急、生徒数の調整をお願いします。`);
  };

  // ローディング状態
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">データを読み込み中...</p>
        </div>
      </div>
    );
  }

  // エラー状態（エラーがあってもUIを表示し、エラーメッセージを上部に表示）
  if (error && !hasLocationInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">エラーが発生しました</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="text-sm text-gray-500 mb-4">
            <p>現在のユーザー情報:</p>
            <p>名前: {currentUser?.name || '未設定'}</p>
            <p>ロール: {currentUser?.role || '未設定'}</p>
            <p>拠点ID: {currentUser?.satellite_ids ? JSON.stringify(currentUser.satellite_ids) : '未設定'}</p>
          </div>
                     <button 
             onClick={refreshData}
             className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
           >
             データを再取得
           </button>
        </div>
      </div>
    );
  }

  // 権限チェック
  if (!hasPermission) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <h2 className="text-2xl font-bold mb-4">閲覧権限がありません</h2>
            <p className="text-gray-600">拠点情報は拠点管理者のみ閲覧できます。</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-6">
      {/* エラーメッセージ表示 */}
      {renderError()}
      
      {/* ヘッダー部分 */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              🏢 拠点管理 - {hasLocationInfo ? locationInfo.name : '拠点情報を読み込み中...'}
            </h2>
            <p className="text-lg text-gray-600">{hasLocationInfo ? locationInfo.facilityName : '情報を取得中...'}</p>
          </div>
        </div>
      </div>

             {/* 拠点情報が取得できない場合のメッセージ */}
       {!hasLocationInfo && !loading && (
         <div className="bg-gradient-to-r from-yellow-50 to-orange-100 border border-yellow-200 rounded-2xl p-6 mb-6">
           <div className="flex items-center gap-3 mb-4">
             <span className="text-2xl">ℹ️</span>
             <h3 className="text-xl font-bold text-yellow-800">拠点情報の確認</h3>
           </div>
           <p className="text-yellow-700 mb-4">
             拠点情報が正しく取得できていません。以下の点を確認してください：
           </p>
           <ul className="text-yellow-700 list-disc pl-5 mb-4">
             <li>ユーザーに拠点が正しく割り当てられているか</li>
             <li>データベースに拠点情報が存在するか</li>
             <li>APIサーバーが正常に動作しているか</li>
           </ul>
           <div className="text-sm text-gray-600">
             <p><strong>現在のユーザー情報:</strong></p>
             <p>名前: {currentUser?.name || '未設定'}</p>
             <p>ロール: {currentUser?.role || '未設定'}</p>
             <p>拠点ID: {currentUser?.satellite_ids ? JSON.stringify(currentUser.satellite_ids) : '未設定'}</p>
             <p>企業ID: {currentUser?.company_id || '未設定'}</p>
             <p>ユーザーID: {currentUser?.id || '未設定'}</p>
           </div>
           <div className="mt-4 p-3 bg-gray-100 rounded-lg">
             <p className="text-sm font-medium text-gray-700 mb-2">デバッグ情報:</p>
             <p className="text-xs text-gray-600">localStorage currentUser: {localStorage.getItem('currentUser') ? '存在' : 'なし'}</p>
             <p className="text-xs text-gray-600">localStorage selectedSatellite: {localStorage.getItem('selectedSatellite') ? '存在' : 'なし'}</p>
             <button 
               onClick={refreshData}
               className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
             >
               データを再取得
             </button>
           </div>
         </div>
       )}

      {/* 容量警告 */}
      {isOverCapacity && (
        <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">⚠️</span>
            <h3 className="text-xl font-bold text-red-800">生徒数超過警告</h3>
          </div>
          <p className="text-red-700 mb-4">
            現在の生徒数（{locationInfo.currentStudents}名）が最大受入数（{locationInfo.maxStudents}名）を超過しています。
          </p>
          <p className="text-red-700 mb-4">学習システムが正常に動作しない可能性があります。</p>
          <button 
            className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            onClick={contactManagement}
          >
            🚨 運営に連絡
          </button>
        </div>
      )}

      {/* 容量近接警告 */}
      {!isOverCapacity && capacityPercentage >= 80 && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-100 border border-yellow-200 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">⚠️</span>
            <h3 className="text-xl font-bold text-yellow-800">容量警告</h3>
          </div>
          <p className="text-yellow-700 mb-4">
            生徒数が最大受入数の{Math.round(capacityPercentage)}%に達しています。
          </p>
          <p className="text-yellow-700">新規生徒の受入れを調整してください。</p>
        </div>
      )}

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">現在の生徒数</h3>
          <p className={`text-3xl font-bold mb-2 ${isOverCapacity ? 'text-red-600' : 'text-indigo-600'}`}>
            {locationInfo.currentStudents}名
          </p>
          <small className="text-gray-500">最大 {locationInfo.maxStudents}名</small>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">指導員数</h3>
          <p className="text-3xl font-bold text-indigo-600 mb-2">
            {locationInfo.instructorCount > 0 ? locationInfo.instructorCount : instructors.filter(t => t.status === 1).length}名
          </p>
          <small className="text-gray-500">責任者含む</small>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">容量使用率</h3>
          <p className={`text-3xl font-bold mb-2 ${
            capacityPercentage >= 100 
              ? 'text-red-600' 
              : capacityPercentage >= 80 
                ? 'text-yellow-600' 
                : 'text-indigo-600'
          }`}>
            {Math.round(capacityPercentage)}%
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                capacityPercentage >= 100 
                  ? 'bg-gradient-to-r from-red-400 to-red-600' 
                  : capacityPercentage >= 80 
                    ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' 
                    : 'bg-gradient-to-r from-indigo-400 to-indigo-600'
              }`}
              style={{ width: `${Math.min(capacityPercentage, 100)}%` }}
            />
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">拠点責任者</h3>
            <button 
              className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
              onClick={() => setShowManagerSettings(true)}
            >
              設定
            </button>
          </div>
          <div className="space-y-2">
            {(() => {
              // 管理者IDから管理者名を取得
              const managerNames = [];
              if (locationInfo.manager_ids && Array.isArray(locationInfo.manager_ids)) {
                locationInfo.manager_ids.forEach(managerId => {
                  const manager = instructors.find(instructor => instructor.id === managerId);
                  if (manager) {
                    managerNames.push(manager.name);
                  }
                });
              }
              
              if (managerNames.length > 0) {
                return managerNames.map((name, index) => (
                  <p key={index} className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                    <span className="text-yellow-500 text-lg">👑</span>
                    {name}
                  </p>
                ));
              } else {
                return <p className="text-gray-500">拠点責任者が設定されていません</p>;
              }
            })()}
          </div>
        </div>
      </div>

      {/* 管理セクション */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 拠点情報 */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">拠点情報</h3>
            <button 
              className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
              onClick={() => setShowEditLocationForm(true)}
            >
              編集
            </button>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-lg">🏢</span>
              <div>
                <p className="font-semibold text-gray-800">拠点名</p>
                <p className="text-gray-600">{locationInfo.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-lg">📍</span>
              <div>
                <p className="font-semibold text-gray-800">住所</p>
                <p className="text-gray-600">{locationInfo.address}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-lg">📞</span>
              <div>
                <p className="font-semibold text-gray-800">電話</p>
                <p className="text-gray-600">{locationInfo.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-lg">👥</span>
              <div>
                <p className="font-semibold text-gray-800">最大生徒数</p>
                <p className="text-gray-600">{locationInfo.maxStudents}名</p>
              </div>
            </div>
          </div>
        </div>

        {/* 指導員一覧 */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">拠点内指導員一覧</h3>
            <button 
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
              onClick={() => setShowAddTeacherForm(true)}
            >
              + 指導員を追加
            </button>
          </div>
          <div className="space-y-4">
            {instructors.length === 0 ? (
              <p className="text-gray-500 text-center py-8">指導員が登録されていません</p>
            ) : (
              instructors.map(teacher => (
                <div key={teacher.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {isTeacherManager(teacher.id) && <span className="text-yellow-500 text-lg">👑</span>}
                        <h4 className="font-semibold text-gray-800">{teacher.name}</h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        ロール: {isTeacherManager(teacher.id) ? '拠点管理者' : '指導員'}
                      </p>
                      {teacher.specializations && teacher.specializations.length > 0 && (
                        <p className="text-sm text-gray-600 mb-1">
                          専門分野: {teacher.specializations.map(s => s.specialization).join(', ')}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        teacher.status === 1 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {teacher.status === 1 ? 'アクティブ' : '非アクティブ'}
                      </span>
                      <div className="flex gap-2">
                        <button 
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                            teacher.status === 1 
                              ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                          onClick={() => toggleTeacherStatus(teacher.id)}
                        >
                          {teacher.status === 1 ? '無効化' : '有効化'}
                        </button>
                        <button 
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                            isTeacherManager(teacher.id)
                              ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                              : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                          }`}
                          onClick={() => toggleManagerStatus(teacher.id, isTeacherManager(teacher.id))}
                        >
                          {isTeacherManager(teacher.id) ? '管理者解除' : '管理者設定'}
                        </button>
                        <button 
                          className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-red-600"
                          onClick={() => handleDeleteTeacher(teacher.id)}
                          title="削除"
                        >
                          🗑️ 削除
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 拠点編集モーダル */}
      {showEditLocationForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800">拠点情報の編集</h3>
                <button 
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all duration-200"
                  onClick={() => setShowEditLocationForm(false)}
                >
                  ×
                </button>
              </div>
            </div>
            <form onSubmit={handleLocationUpdate} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">拠点名</label>
                <input
                  type="text"
                  value={editLocation.name}
                  onChange={(e) => setEditLocation({...editLocation, name: e.target.value})}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">最大生徒数</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={editLocation.maxStudents}
                  onChange={(e) => setEditLocation({...editLocation, maxStudents: e.target.value})}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                />
                <small className="text-gray-500">現在の生徒数: {locationInfo.currentStudents}名</small>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">住所</label>
                <input
                  type="text"
                  value={editLocation.address}
                  onChange={(e) => setEditLocation({...editLocation, address: e.target.value})}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">電話番号</label>
                <input
                  type="text"
                  value={editLocation.phone}
                  onChange={(e) => setEditLocation({...editLocation, phone: e.target.value})}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <button 
                  type="button" 
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200"
                  onClick={() => setShowEditLocationForm(false)}
                >
                  キャンセル
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  更新
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 先生追加モーダル */}
      {showAddTeacherForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800">新しい指導員を追加</h3>
                <button 
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all duration-200"
                  onClick={() => setShowAddTeacherForm(false)}
                >
                  ×
                </button>
              </div>
            </div>
            <form onSubmit={handleAddTeacher} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">名前</label>
                <input
                  type="text"
                  value={newTeacher.name}
                  onChange={(e) => setNewTeacher({...newTeacher, name: e.target.value})}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">ログインID</label>
                <input
                  type="text"
                  value={newTeacher.username}
                  onChange={(e) => setNewTeacher({...newTeacher, username: e.target.value})}
                  placeholder="半角英数字とアンダースコアのみ使用可能"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">メールアドレス</label>
                <input
                  type="email"
                  value={newTeacher.email}
                  onChange={(e) => setNewTeacher({...newTeacher, email: e.target.value})}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">専門分野</label>
                <input
                  type="text"
                  value={newTeacher.department}
                  onChange={(e) => setNewTeacher({...newTeacher, department: e.target.value})}
                  placeholder="例：プログラミング、Web開発、データサイエンスなど"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">初期パスワード</label>
                <input
                  type="password"
                  value={newTeacher.password}
                  onChange={(e) => setNewTeacher({...newTeacher, password: e.target.value})}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <button 
                  type="button" 
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200"
                  onClick={() => setShowAddTeacherForm(false)}
                >
                  キャンセル
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  追加
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 拠点責任者設定モーダル */}
      {showManagerSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800">拠点責任者の設定</h3>
                <button 
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all duration-200"
                  onClick={() => setShowManagerSettings(false)}
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  拠点責任者として設定する指導員を選択してください。複数選択可能です。
                </p>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {instructors.map(instructor => (
                    <label key={instructor.id} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={locationInfo.manager_ids && locationInfo.manager_ids.includes(instructor.id)}
                        onChange={(e) => {
                          const currentManagerIds = locationInfo.manager_ids || [];
                          let newManagerIds;
                          
                          if (e.target.checked) {
                            // チェックされた場合、追加
                            newManagerIds = [...currentManagerIds, instructor.id];
                          } else {
                            // チェックが外された場合、削除
                            newManagerIds = currentManagerIds.filter(id => id !== instructor.id);
                          }
                          
                          setLocationInfo(prev => ({
                            ...prev,
                            manager_ids: newManagerIds
                          }));
                        }}
                        className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                      />
                      <div className="flex items-center space-x-2">
                        <span className="text-yellow-500 text-lg">👑</span>
                        <span className="font-medium text-gray-800">{instructor.name}</span>
                        <span className="text-sm text-gray-500">({instructor.username})</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <button 
                  type="button" 
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200"
                  onClick={() => setShowManagerSettings(false)}
                >
                  キャンセル
                </button>
                <button 
                  type="button" 
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                  onClick={async () => {
                    try {
                      const satelliteId = getCurrentUserSatelliteId();
                      if (!satelliteId) return;

                      const response = await apiPut(`/api/satellites/${satelliteId}`, {
                        manager_ids: locationInfo.manager_ids
                      });

                      if (response.success) {
                        await fetchLocationData();
                        setShowManagerSettings(false);
                        alert('拠点責任者が更新されました。');
                      } else {
                        throw new Error(response.message || '拠点責任者の更新に失敗しました');
                      }
                    } catch (error) {
                      console.error('拠点責任者更新エラー:', error);
                      alert(`拠点責任者の更新に失敗しました: ${error.message}`);
                    }
                  }}
                >
                  更新
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationManagementForInstructor; 