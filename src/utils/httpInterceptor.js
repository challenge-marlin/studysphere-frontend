// HTTPリクエストインターセプター
import { getStoredTokens, handleTokenInvalid, refreshTokenAPI, storeTokens } from './authUtils';

// グローバルなナビゲーション関数を保持
let globalNavigate = null;

// ナビゲーション関数を設定
export const setGlobalNavigate = (navigate) => {
  globalNavigate = navigate;
};

// カスタムfetch関数（トークン無効検出付き）
export const authenticatedFetch = async (url, options = {}) => {
  try {
    const { accessToken, refreshToken } = getStoredTokens();
    
    // アクセストークンがある場合はヘッダーに追加
    if (accessToken) {
      options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${accessToken}`
      };
    }

    const response = await fetch(url, options);
    
    // 401 Unauthorized または 403 Forbidden の場合
    if (response.status === 401 || response.status === 403) {
      // リフレッシュトークンがある場合は更新を試行
      if (refreshToken) {
        try {
          console.log('HTTPインターセプター: トークン更新を試行中...');
          const refreshResponse = await refreshTokenAPI(refreshToken);
          
          if (refreshResponse.success) {
            const { access_token, refresh_token } = refreshResponse.data;
            storeTokens(access_token, refresh_token);
            console.log('HTTPインターセプター: トークン更新成功');
            
            // 新しいトークンでリクエストを再実行
            const newOptions = {
              ...options,
              headers: {
                ...options.headers,
                'Authorization': `Bearer ${access_token}`
              }
            };
            
            return await fetch(url, newOptions);
          } else {
            console.error('HTTPインターセプター: トークン更新APIが失敗:', refreshResponse);
          }
        } catch (refreshError) {
          console.error('HTTPインターセプター: トークン更新に失敗:', refreshError);
        }
      }
      
      // トークン更新に失敗した場合はログインページにリダイレクト
      console.warn('HTTPインターセプター: Authentication failed, redirecting to login');
      if (globalNavigate) {
        handleTokenInvalid(globalNavigate, '認証に失敗しました');
      }
      throw new Error('Authentication failed');
    }
    
    return response;
  } catch (error) {
    // ネットワークエラーやその他のエラーの場合
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.error('Network error:', error);
      // ネットワークエラーの場合はリダイレクトしない
      throw error;
    }
    
    // 認証エラーの場合はリダイレクト
    if (error.message === 'Authentication failed') {
      throw error;
    }
    
    // その他のエラーはそのまま投げる
    throw error;
  }
};

// 既存のfetchを拡張するためのプロキシ
export const setupFetchInterceptor = () => {
  const originalFetch = window.fetch;
  
  window.fetch = async (url, options = {}) => {
    try {
      const { accessToken, refreshToken } = getStoredTokens();
      
      // アクセストークンがある場合はヘッダーに追加
      if (accessToken && !options.headers?.['Authorization']) {
        options.headers = {
          ...options.headers,
          'Authorization': `Bearer ${accessToken}`
        };
      }

      const response = await originalFetch(url, options);
      
      // 401 Unauthorized または 403 Forbidden の場合
      if (response.status === 401 || response.status === 403) {
        // リフレッシュトークンがある場合は更新を試行
        if (refreshToken) {
          try {
            console.log('Fetchインターセプター: トークン更新を試行中...');
            const refreshResponse = await refreshTokenAPI(refreshToken);
            
            if (refreshResponse.success) {
              const { access_token, refresh_token } = refreshResponse.data;
              storeTokens(access_token, refresh_token);
              console.log('Fetchインターセプター: トークン更新成功');
              
              // 新しいトークンでリクエストを再実行
              const newOptions = {
                ...options,
                headers: {
                  ...options.headers,
                  'Authorization': `Bearer ${access_token}`
                }
              };
              
              return await originalFetch(url, newOptions);
            } else {
              console.error('Fetchインターセプター: トークン更新APIが失敗:', refreshResponse);
            }
          } catch (refreshError) {
            console.error('Fetchインターセプター: トークン更新に失敗:', refreshError);
          }
        }
        
        // トークン更新に失敗した場合はログインページにリダイレクト
        console.warn('Fetchインターセプター: Authentication failed, redirecting to login');
        if (globalNavigate) {
          handleTokenInvalid(globalNavigate, '認証に失敗しました');
        }
        throw new Error('Authentication failed');
      }
      
      return response;
    } catch (error) {
      // 認証エラーの場合はリダイレクト
      if (error.message === 'Authentication failed') {
        throw error;
      }
      
      // その他のエラーはそのまま投げる
      throw error;
    }
  };
}; 