// JWTトークンをデコードする関数
export const decodeJWT = (token) => {
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
export const getActualRoleId = (authUser) => {
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

// 現在のユーザーの拠点IDを取得
export const getCurrentUserSatelliteId = (currentUser) => {
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

// 指定された指導者が管理者かどうかをチェック
export const isTeacherManager = (teacherId, instructors, locationInfo) => {
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
};
