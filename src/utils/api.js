// API呼び出し用のユーティリティ関数

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

/**
 * API呼び出しの共通関数
 * @param {string} endpoint - APIエンドポイント
 * @param {Object} options - fetchオプション
 * @returns {Promise} - APIレスポンス
 */
export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
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
    throw error;
  }
};

/**
 * GETリクエスト
 * @param {string} endpoint - APIエンドポイント
 * @returns {Promise} - APIレスポンス
 */
export const apiGet = (endpoint) => {
  // キャッシュを無効にするためにタイムスタンプを追加
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
export const apiPost = (endpoint, data) => apiCall(endpoint, {
  method: 'POST',
  body: JSON.stringify(data),
});

/**
 * PUTリクエスト
 * @param {string} endpoint - APIエンドポイント
 * @param {Object} data - 送信データ
 * @returns {Promise} - APIレスポンス
 */
export const apiPut = (endpoint, data) => apiCall(endpoint, {
  method: 'PUT',
  body: JSON.stringify(data),
});

/**
 * DELETEリクエスト
 * @param {string} endpoint - APIエンドポイント
 * @returns {Promise} - APIレスポンス
 */
export const apiDelete = (endpoint) => apiCall(endpoint, {
  method: 'DELETE',
});

/**
 * 複数拠点情報取得
 * @param {Array} satelliteIds - 拠点IDの配列
 * @returns {Promise} - APIレスポンス
 */
export const getSatellitesByIds = async (satelliteIds) => {
  console.log('getSatellitesByIds 呼び出し:', { satelliteIds, type: typeof satelliteIds });
  
  if (!satelliteIds || satelliteIds.length === 0) {
    console.log('拠点IDが空のため、空配列を返します');
    return { success: true, data: [] };
  }
  
  const idsParam = JSON.stringify(satelliteIds);
  console.log('送信するパラメータ:', { idsParam, encoded: encodeURIComponent(idsParam) });
  
  return apiGet(`/api/satellites/by-ids?ids=${encodeURIComponent(idsParam)}`);
}; 