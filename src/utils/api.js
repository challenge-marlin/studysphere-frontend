// API呼び出し用のユーティリティ関数

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5050';

// 認証エラー検出フラグ
let isAuthErrorHandling = false;

/**
 * API呼び出しの共通関数（再試行機能付き）
 * @param {string} endpoint - APIエンドポイント
 * @param {Object} options - fetchオプション
 * @param {number} retryCount - 現在の再試行回数
 * @returns {Promise} - APIレスポンス
 */
export const apiCall = async (endpoint, options = {}, retryCount = 0) => {
  // 認証エラー処理中は新しいAPI呼び出しをブロック
  if (isAuthErrorHandling) {
    console.log('認証エラー処理中のため、API呼び出しをスキップします');
    throw new Error('Authentication error handling in progress');
  }

  const url = `${API_BASE_URL}${endpoint}`;
  
  // FormDataの場合はContent-Typeを自動設定しない
  const isFormData = options.body instanceof FormData;
  
  // 認証トークンを取得
  const accessToken = localStorage.getItem('accessToken');
  
  const defaultOptions = {
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
      ...options.headers,
    },
  };

  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    console.log(`API呼び出し: ${config.method || 'GET'} ${url}${retryCount > 0 ? ` (再試行 ${retryCount})` : ''}`);
    
    // タイムアウト設定を追加
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15秒タイムアウトに延長
    
    const response = await fetch(url, {
      ...config,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    // 認証エラーの場合
    if (response.status === 401 || response.status === 403) {
      isAuthErrorHandling = true;
      console.warn('認証エラーを検出しました。リダイレクト処理を開始します。');
      
      // グローバルナビゲーション関数を取得
      const { setGlobalNavigate } = await import('./httpInterceptor');
      const { handleTokenInvalid } = await import('./authUtils');
      
      // 即座にリダイレクト処理を実行
      setTimeout(() => {
        handleTokenInvalid(window.navigate || (() => window.location.href = '/studysphere/homepage'), '認証に失敗しました');
        isAuthErrorHandling = false;
      }, 100);
      
      throw new Error('Authentication failed');
    }
    
    if (!response.ok) {
      let errorData;
      try {
        const errorText = await response.text();
        errorData = JSON.parse(errorText);
      } catch (parseError) {
        errorData = { message: await response.text() };
      }
      
      console.error(`APIエラー (${response.status}):`, errorData);
      
      // エラーオブジェクトに詳細情報を追加
      const error = new Error(errorData.message || `API呼び出しに失敗しました (${response.status})`);
      error.status = response.status;
      error.response = { data: errorData };
      throw error;
    }
    
    const data = await response.json();
    console.log(`APIレスポンス:`, data);
    
    return data;
  } catch (error) {
    console.error('API呼び出しエラー:', error);
    
    // 認証エラーの場合は特別な処理
    if (error.message === 'Authentication failed') {
      throw error;
    }
    
    // ネットワークエラーやタイムアウトの場合の再試行
    if ((error.name === 'AbortError' || error.message.includes('Failed to fetch') || error.message.includes('ERR_EMPTY_RESPONSE')) && retryCount < 3) {
      console.warn(`接続エラーが発生しました。${retryCount + 1}回目の再試行を実行します...`);
      
      // 指数バックオフで待機
      const delay = Math.pow(2, retryCount) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // 再試行
      return apiCall(endpoint, options, retryCount + 1);
    }
    
    // ネットワークエラーやタイムアウトの場合（再試行上限に達した場合）
    if (error.name === 'AbortError' || error.message.includes('Failed to fetch') || error.message.includes('ERR_EMPTY_RESPONSE')) {
      console.error('バックエンドサーバーに接続できません。サーバーが起動しているか確認してください。');
      throw new Error('バックエンドサーバーに接続できません。サーバーが起動しているか確認してください。');
    }
    
    // その他のエラーはそのまま投げる
    throw error;
  }
};

/**
 * GETリクエスト
 * @param {string} endpoint - APIエンドポイント
 * @returns {Promise} - APIレスポンス
 */
export const apiGet = (endpoint) => {
  // 認証エラー処理中は呼び出しをスキップ
  if (isAuthErrorHandling) {
    console.log('認証エラー処理中のため、GETリクエストをスキップします');
    throw new Error('Authentication error handling in progress');
  }
  
  // キャッシュを無効にするためにタイムスタンプを追加（認証エラー時は追加しない）
  const separator = endpoint.includes('?') ? '&' : '?';
  const urlWithTimestamp = `${endpoint}${separator}_t=${Date.now()}`;
  return apiCall(urlWithTimestamp);
};

/**
 * POSTリクエスト
 * @param {string} endpoint - APIエンドポイント
 * @param {Object} data - 送信データ
 * @returns {Promise} - APIレスポンス
 */
export const apiPost = (endpoint, data) => {
  if (isAuthErrorHandling) {
    console.log('認証エラー処理中のため、POSTリクエストをスキップします');
    throw new Error('Authentication error handling in progress');
  }
  
  return apiCall(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

/**
 * PUTリクエスト
 * @param {string} endpoint - APIエンドポイント
 * @param {Object} data - 送信データ
 * @returns {Promise} - APIレスポンス
 */
export const apiPut = (endpoint, data) => {
  if (isAuthErrorHandling) {
    console.log('認証エラー処理中のため、PUTリクエストをスキップします');
    throw new Error('Authentication error handling in progress');
  }
  
  return apiCall(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

/**
 * DELETEリクエスト
 * @param {string} endpoint - APIエンドポイント
 * @returns {Promise} - APIレスポンス
 */
export const apiDelete = (endpoint) => {
  if (isAuthErrorHandling) {
    console.log('認証エラー処理中のため、DELETEリクエストをスキップします');
    throw new Error('Authentication error handling in progress');
  }
  
  return apiCall(endpoint, {
    method: 'DELETE',
  });
};

/**
 * バイナリデータ（PDF、ZIP等）をダウンロードするための専用関数
 * @param {string} endpoint - APIエンドポイント
 * @param {Object} options - リクエストオプション
 * @returns {Promise<Blob>} - バイナリデータ
 */
export const apiDownloadBinary = async (endpoint, options = {}) => {
  // 認証エラー処理中は新しいAPI呼び出しをブロック
  if (isAuthErrorHandling) {
    console.log('認証エラー処理中のため、API呼び出しをスキップします');
    throw new Error('Authentication error handling in progress');
  }

  const url = `${API_BASE_URL}${endpoint}`;
  
  // 認証トークンを取得
  const accessToken = localStorage.getItem('accessToken');
  
  const defaultOptions = {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
      ...options.headers,
    },
  };

  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    console.log(`バイナリダウンロードAPI呼び出し: ${config.method || 'GET'} ${url}`);
    
    const response = await fetch(url, config);
    
    // 認証エラーの場合
    if (response.status === 401 || response.status === 403) {
      isAuthErrorHandling = true;
      console.warn('認証エラーを検出しました。リダイレクト処理を開始します。');
      
      // グローバルナビゲーション関数を取得
      const { setGlobalNavigate } = await import('./httpInterceptor');
      const { handleTokenInvalid } = await import('./authUtils');
      
      // 即座にリダイレクト処理を実行
      setTimeout(() => {
        handleTokenInvalid(window.navigate || (() => window.location.href = '/studysphere/homepage'), '認証に失敗しました');
        isAuthErrorHandling = false;
      }, 100);
      
      throw new Error('Authentication failed');
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`APIエラー (${response.status}):`, errorText);
      throw new Error(`API呼び出しに失敗しました (${response.status}): ${errorText}`);
    }
    
    const blob = await response.blob();
    console.log(`バイナリダウンロード完了: ${blob.size} bytes`);
    
    return blob;
  } catch (error) {
    console.error('バイナリダウンロードエラー:', error);
    
    // 認証エラーの場合は特別な処理
    if (error.message === 'Authentication failed') {
      throw error;
    }
    
    // その他のエラーはそのまま投げる
    throw error;
  }
};

/**
 * 複数拠点情報取得
 * @param {Array} satelliteIds - 拠点IDの配列
 * @returns {Promise} - APIレスポンス
 */
export const getSatellitesByIds = async (satelliteIds) => {
  if (isAuthErrorHandling) {
    console.log('認証エラー処理中のため、拠点情報取得をスキップします');
    throw new Error('Authentication error handling in progress');
  }
  
  console.log('getSatellitesByIds 呼び出し:', { satelliteIds, type: typeof satelliteIds });
  
  if (!satelliteIds || satelliteIds.length === 0) {
    console.log('拠点IDが空のため、空配列を返します');
    return { success: true, data: [] };
  }
  
  const idsParam = JSON.stringify(satelliteIds);
  console.log('送信するパラメータ:', { idsParam, encoded: encodeURIComponent(idsParam) });
  
  return apiGet(`/api/satellites/by-ids?ids=${encodeURIComponent(idsParam)}`);
}; 

/**
 * 企業一覧を取得
 */
export const getCompanies = () => {
  return apiGet('/api/companies');
};

/**
 * 拠点一覧を取得
 */
export const getSatellites = () => {
  return apiGet('/api/satellites');
};

/**
 * 現在のユーザーの企業・拠点情報を取得
 */
export const getUserInfo = () => {
  return apiGet('/api/user-info');
};

/**
 * 拠点詳細を取得
 */
export const getSatelliteById = (id) => {
  return apiGet(`/api/satellites/${id}`);
};

/**
 * 拠点情報を更新
 */
export const updateSatellite = (id, data) => {
  return apiPut(`/api/satellites/${id}`, data);
};

/**
 * 拠点の指導員一覧を取得
 */
export const getSatelliteInstructors = (satelliteId) => {
  return apiGet(`/api/satellites/${satelliteId}/instructors`);
};

/**
 * 拠点の利用者一覧を取得
 */
export const getSatelliteUsers = (satelliteId) => {
  if (!satelliteId || satelliteId === 'undefined') {
    console.error('拠点IDが無効です:', satelliteId);
    throw new Error('拠点IDが無効です');
  }
  return apiGet(`/api/satellites/${satelliteId}/users`);
};

/**
 * ユーザー情報を更新
 */
export const updateUser = (userId, data) => {
  return apiPut(`/api/users/${userId}`, data);
}; 

/**
 * 指導員の専門分野一覧を取得
 */
export const getInstructorSpecializations = (userId) => {
  return apiGet(`/api/users/${userId}/specializations`);
};

/**
 * 指導員の専門分野を追加
 */
export const addInstructorSpecialization = (userId, specialization) => {
  return apiPost(`/api/users/${userId}/specializations`, { specialization });
};

/**
 * 指導員の専門分野を更新
 */
export const updateInstructorSpecialization = (userId, specializationId, specialization) => {
  return apiPut(`/api/users/${userId}/specializations/${specializationId}`, { specialization });
};

/**
 * 指導員の専門分野を削除
 */
export const deleteInstructorSpecialization = (userId, specializationId) => {
  return apiDelete(`/api/users/${userId}/specializations/${specializationId}`);
}; 

/**
 * 拠点変更時の再認証
 */
export const reauthenticateForSatellite = (satelliteId) => {
  // 現在のユーザー情報を取得
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const userId = currentUser.user_id || currentUser.id;
  
  return apiPost('/api/reauthenticate-satellite', { 
    userId: userId,
    satelliteId: satelliteId 
  });
};

/**
 * 拠点内の利用者と担当指導員の関係を取得
 */
export const getSatelliteUserInstructorRelations = (satelliteId) => {
  return apiGet(`/api/users/satellite/${satelliteId}/instructor-relations`);
};

/**
 * 拠点内の利用可能な指導員一覧を取得
 */
export const getSatelliteAvailableInstructors = (satelliteId) => {
  return apiGet(`/api/users/satellite/${satelliteId}/available-instructors`);
};

/**
 * 個別利用者の担当指導員を変更
 */
export const updateUserInstructor = (userId, instructorId) => {
  return apiPut(`/api/users/${userId}/instructor`, { instructorId });
};

/**
 * 一括で利用者の担当指導員を変更
 */
export const bulkUpdateUserInstructors = (satelliteId, assignments) => {
  return apiPut(`/api/users/satellite/${satelliteId}/bulk-instructor-assignment`, { assignments });
};

/**
 * 拠点内の全利用者の担当指導員を一括削除
 */
export const bulkRemoveUserInstructors = (satelliteId) => {
  return apiDelete(`/api/users/satellite/${satelliteId}/instructors`);
}; 

/**
 * 拠点内の利用者のコース関連付け一覧を取得
 */
export const getSatelliteUserCourses = (satelliteId) => {
  if (!satelliteId || satelliteId === 'undefined') {
    console.error('拠点IDが無効です:', satelliteId);
    throw new Error('拠点IDが無効です');
  }
  return apiGet(`/api/user-courses/satellite/${satelliteId}/user-courses`);
};

/**
 * 拠点で利用可能なコース一覧を取得
 */
export const getSatelliteAvailableCourses = (satelliteId) => {
  if (!satelliteId || satelliteId === 'undefined') {
    console.error('拠点IDが無効です:', satelliteId);
    throw new Error('拠点IDが無効です');
  }
  return apiGet(`/api/user-courses/satellite/${satelliteId}/available-courses`);
};

/**
 * 拠点で利用可能なカリキュラムパス一覧を取得
 */
export const getSatelliteAvailableCurriculumPaths = (satelliteId) => {
  return apiGet(`/api/user-courses/satellite/${satelliteId}/available-curriculum-paths`);
};

/**
 * 利用者にコースを一括追加
 */
export const bulkAssignCoursesToUsers = (satelliteId, data) => {
  return apiPost(`/api/user-courses/satellite/${satelliteId}/bulk-assign-courses`, data);
};

/**
 * 利用者からコースを一括削除
 */
export const bulkRemoveCoursesFromUsers = (satelliteId, data) => {
  return apiPost(`/api/user-courses/satellite/${satelliteId}/bulk-remove-courses`, data);
};

/**
 * 利用者にカリキュラムパスを一括追加
 */
export const bulkAssignCurriculumPathsToUsers = (satelliteId, data) => {
  return apiPost(`/api/user-courses/satellite/${satelliteId}/bulk-assign-curriculum-paths`, data);
};

// 個別支援計画関連のAPI関数

/**
 * 個別支援計画一覧を取得
 */
export const getSupportPlans = () => {
  return apiGet('/api/support-plans');
};

/**
 * 特定ユーザーの個別支援計画を取得
 */
export const getSupportPlanByUserId = (userId) => {
  return apiGet(`/api/support-plans/user/${userId}`);
};

/**
 * 個別支援計画を作成
 */
export const createSupportPlan = (data) => {
  return apiPost('/api/support-plans', data);
};

/**
 * 個別支援計画を更新
 */
export const updateSupportPlan = (id, data) => {
  return apiPut(`/api/support-plans/${id}`, data);
};

/**
 * 個別支援計画を削除
 */
export const deleteSupportPlan = (id) => {
  return apiDelete(`/api/support-plans/${id}`);
};

/**
 * 個別支援計画を作成または更新（upsert）
 */
export const upsertSupportPlan = (data) => {
  return apiPost('/api/support-plans/upsert', data);
};

// 在宅支援関連のAPI関数

/**
 * 拠点内の通所利用者一覧を取得（在宅支援追加用）
 */
export const getSatelliteUsersForHomeSupport = (satelliteId, instructorIds = null) => {
  const params = instructorIds ? `?instructorIds=${instructorIds.join(',')}` : '';
  return apiGet(`/api/users/satellite/${satelliteId}/home-support-users${params}`);
};

/**
 * 拠点内の在宅支援利用者一覧を取得
 */
export const getSatelliteHomeSupportUsers = (satelliteId, instructorIds = null) => {
  const params = instructorIds ? `?instructorIds=${instructorIds.join(',')}` : '';
  return apiGet(`/api/users/satellite/${satelliteId}/home-support-users-list${params}`);
};

/**
 * 拠点内の指導員一覧を取得（在宅支援用）
 */
export const getSatelliteInstructorsForHomeSupport = (satelliteId) => {
  return apiGet(`/api/users/satellite/${satelliteId}/home-support-instructors`);
};

/**
 * 在宅支援フラグを一括更新
 */
export const bulkUpdateHomeSupportFlag = (userIds, isRemoteUser) => {
  return apiPost('/api/users/bulk-update-home-support', {
    userIds,
    isRemoteUser
  });
};

/**
 * 在宅支援解除（単一利用者）
 */
export const removeHomeSupportFlag = (userId) => {
  return apiPut(`/api/users/${userId}/remove-home-support`);
};

/**
 * 一時パスワード検証
 * @param {string} loginCode - ログインコード
 * @param {string} tempPassword - 一時パスワード
 * @returns {Promise} - 検証結果
 */
export const verifyTemporaryPasswordAPI = async (loginCode, tempPassword) => {
  return apiCall('/api/users/verify-temp-password', {
    method: 'POST',
    body: JSON.stringify({ loginCode, tempPassword })
  });
};

/**
 * 一時パスワード状態確認
 * @param {string} loginCode - ログインコード
 * @returns {Promise} - 状態確認結果
 */
export const checkTempPasswordStatusAPI = async (loginCode) => {
  return apiCall(`/api/temp-passwords/status/${loginCode}`, {
    method: 'GET'
  });
};

/**
 * ログアウト時に一時パスワードを使用済みにマーク
 * @param {number} userId - ユーザーID
 * @returns {Promise} - マーク結果
 */
export const markTempPasswordAsUsedAPI = async (userId) => {
  return apiCall(`/api/users/${userId}/mark-temp-password-used`, {
    method: 'POST'
  });
};

/**
 * 合格証明書データを取得
 * @param {number} userId - ユーザーID
 * @param {number} lessonId - レッスンID
 * @param {number} examResultId - 試験結果ID（オプション）
 * @returns {Promise} - 合格証明書データ
 */
export const getCertificateData = async (userId, lessonId, examResultId = null) => {
  const endpoint = examResultId 
    ? `/api/learning/certificate/${userId}/${lessonId}/${examResultId}`
    : `/api/learning/certificate/${userId}/${lessonId}`;
  return apiGet(endpoint);
};

// 合格承認関連のAPI
export const getPendingApprovals = async (satelliteId) => {
  return apiGet(`/api/test/instructor/pending-approvals?satelliteId=${satelliteId}`);
};

export const approveTest = async (examResultId, studentId, lessonId) => {
  return apiPost('/api/test/instructor/approve-test', {
    examResultId,
    studentId,
    lessonId
  });
};