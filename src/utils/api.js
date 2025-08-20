// API呼び出し用のユーティリティ関数

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// 認証エラー検出フラグ
let isAuthErrorHandling = false;

/**
 * API呼び出しの共通関数
 * @param {string} endpoint - APIエンドポイント
 * @param {Object} options - fetchオプション
 * @returns {Promise} - APIレスポンス
 */
export const apiCall = async (endpoint, options = {}) => {
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
    console.log(`API呼び出し: ${config.method || 'GET'} ${url}`);
    
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
        handleTokenInvalid(window.navigate || (() => window.location.href = '/'), '認証に失敗しました');
        isAuthErrorHandling = false;
      }, 100);
      
      throw new Error('Authentication failed');
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`APIエラー (${response.status}):`, errorText);
      throw new Error(`API呼び出しに失敗しました (${response.status}): ${errorText}`);
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
        handleTokenInvalid(window.navigate || (() => window.location.href = '/'), '認証に失敗しました');
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
  return apiGet(`/api/satellites/${satelliteId}/users`);
};

/**
 * ユーザー情報を更新
 */
export const updateUser = (userId, data) => {
  return apiPut(`/api/users/${userId}`, data);
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