// StudySphere API設定
// 本番環境と開発環境を自動判定してAPI URLを設定

// 本番環境判定
const isProduction = process.env.NODE_ENV === 'production' || 
  window.location.hostname.includes('conoha') || 
  window.location.hostname.includes('studysphere') ||
  window.location.hostname.includes('ayatori-inc.co.jp');

// API URL設定
const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (isProduction 
    ? 'https://backend.studysphere.ayatori-inc.co.jp' 
    : 'http://localhost:5050');

// 設定オブジェクト
const config = {
  API_BASE_URL,
  isProduction,
  
  // 本番環境特有の設定
  production: {
    // API呼び出し時のタイムアウト
    apiTimeout: 30000,
    
    // リトライ設定
    maxRetries: 3,
    retryDelay: 1000,
  }
};

export { API_BASE_URL, isProduction };
export default config;
