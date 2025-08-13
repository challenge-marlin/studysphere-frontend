// HTTPリクエストインターセプター
import { getStoredTokens, isRefreshTokenExpired, handleTokenInvalid } from './authUtils';

let globalNavigate = null;
let isAuthErrorHandling = false;

// グローバルナビゲーション関数を設定
export const setGlobalNavigate = (navigate) => {
  globalNavigate = navigate;
};

// 認証が必要なエンドポイントかどうかを判定
const isAuthRequiredEndpoint = (url) => {
  // 認証が不要なエンドポイントのリスト
  const authExcludedEndpoints = [
    '/login',
    '/instructor-login',
    '/refresh',
    '/register',
    '/forgot-password'
  ];
  
  // URLに認証不要エンドポイントが含まれているかチェック
  return !authExcludedEndpoints.some(endpoint => url.includes(endpoint));
};

// ログインエンドポイントかどうかを判定
const isLoginEndpoint = (url) => {
  return url.includes('/login') || url.endsWith('/login') || url.includes('/instructor-login');
};

// 既存のfetchを拡張するためのプロキシ
export const setupFetchInterceptor = () => {
  const originalFetch = window.fetch;
  
  window.fetch = async (url, options = {}) => {
    console.log('Fetchインターセプター: リクエスト開始', { url, method: options.method });
    
    // ログインエンドポイントの場合は、認証エラー処理を完全にスキップ
    if (isLoginEndpoint(url)) {
      console.log('Fetchインターセプター: ログインエンドポイントのため、認証処理をスキップ');
      return originalFetch(url, options);
    }
    
    // 認証エラー処理中は新しいリクエストをブロック
    if (isAuthErrorHandling) {
      console.log('Fetchインターセプター: 認証エラー処理中のため、リクエストをスキップします');
      throw new Error('Authentication error handling in progress');
    }

    try {
      const { accessToken, refreshToken } = getStoredTokens();
      
      // 認証が必要なエンドポイントの場合のみAuthorizationヘッダーを追加
      if (isAuthRequiredEndpoint(url) && accessToken && !options.headers?.['Authorization']) {
        options.headers = {
          ...options.headers,
          'Authorization': `Bearer ${accessToken}`
        };
        console.log('Fetchインターセプター: Authorizationヘッダーを追加');
      }

      const response = await originalFetch(url, options);
      
      // 401 Unauthorized または 403 Forbidden の場合
      if (response.status === 401 || response.status === 403) {
        console.warn('Fetchインターセプター: 認証エラーを検出', { url, status: response.status });
        
        // ログインエンドポイントの場合は処理をスキップ
        if (isLoginEndpoint(url)) {
          console.log('Fetchインターセプター: ログインエンドポイントのため、認証エラー処理をスキップ');
          return response;
        }
        
        // 認証が不要なエンドポイントの場合は処理をスキップ
        if (!isAuthRequiredEndpoint(url)) {
          console.log('Fetchインターセプター: 認証不要エンドポイントのため、認証エラー処理をスキップ');
          return response;
        }
        
        // 認証エラー処理フラグを設定
        isAuthErrorHandling = true;
        
        console.log('Fetchインターセプター: 認証エラー処理を開始します');
        
        // リフレッシュトークンの有効期限をチェック
        if (refreshToken && isRefreshTokenExpired(refreshToken)) {
          console.error('Fetchインターセプター: リフレッシュトークンの有効期限が切れています');
          if (globalNavigate) {
            handleTokenInvalid(globalNavigate, 'セッションが期限切れです。再度ログインしてください。');
          }
          throw new Error('Refresh token expired');
        }
        
        // 認証エラーの場合はログインページにリダイレクト
        console.warn('Fetchインターセプター: Authentication failed, redirecting to login');
        if (globalNavigate) {
          handleTokenInvalid(globalNavigate, '認証に失敗しました。再度ログインしてください。');
        }
        throw new Error('Authentication failed');
      }
      
      return response;
    } catch (error) {
      // 認証エラーの場合はリダイレクト
      if (error.message === 'Authentication failed' || error.message === 'Refresh token expired') {
        throw error;
      }
      
      // その他のエラーはそのまま投げる
      throw error;
    } finally {
      // 認証エラー処理フラグをリセット
      setTimeout(() => {
        isAuthErrorHandling = false;
      }, 1000);
    }
  };
};

// 認証付きfetch関数（既存のコードとの互換性のため）
export const authenticatedFetch = async (url, options = {}) => {
  return window.fetch(url, options);
}; 