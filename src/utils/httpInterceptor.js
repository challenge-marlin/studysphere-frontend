// HTTPリクエストインターセプター
import { getStoredTokens, handleTokenInvalid } from './authUtils';

// グローバルなナビゲーション関数を保持
let globalNavigate = null;

// ナビゲーション関数を設定
export const setGlobalNavigate = (navigate) => {
  globalNavigate = navigate;
};

// カスタムfetch関数（トークン無効検出付き）
export const authenticatedFetch = async (url, options = {}) => {
  try {
    const { accessToken } = getStoredTokens();
    
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
      console.warn('Authentication failed, redirecting to login');
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
      const { accessToken } = getStoredTokens();
      
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
        console.warn('Authentication failed, redirecting to login');
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