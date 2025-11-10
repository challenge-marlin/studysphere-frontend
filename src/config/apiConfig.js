// StudySphere API設定
// 本番環境と開発環境を自動判定してAPI URLを設定

// デバッグ情報を出力
console.log('=== API Config Debug ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
console.log('window.location.hostname:', window.location.hostname);

// 本番環境判定
const isProduction = process.env.NODE_ENV === 'production' || 
  window.location.hostname.includes('conoha') || 
  window.location.hostname.includes('studysphere') ||
  window.location.hostname.includes('ayatori-inc.co.jp');

console.log('isProduction:', isProduction);

// API URL設定
// 開発環境では127.0.0.1:5050を使用（バックエンドのデータベース接続と統一）
// 開発環境（localhost:3000）では、環境変数が設定されていても開発バックエンドを使用
const isDevelopmentHost = window.location.hostname === 'localhost' || 
                          window.location.hostname === '127.0.0.1' ||
                          (window.location.hostname === 'localhost' && window.location.port === '3000');

let API_BASE_URL;
if (isProduction) {
  // 本番環境
  API_BASE_URL = process.env.REACT_APP_API_URL || 'https://backend.studysphere.ayatori-inc.co.jp';
} else if (isDevelopmentHost) {
  // 開発環境（localhost:3000）では強制的に開発バックエンドを使用
  API_BASE_URL = 'http://127.0.0.1:5050';
  if (process.env.REACT_APP_API_URL && process.env.REACT_APP_API_URL !== 'http://127.0.0.1:5050') {
    console.warn('⚠️ 開発環境では環境変数REACT_APP_API_URLを無視し、http://127.0.0.1:5050を使用します');
  }
} else {
  // その他の環境（環境変数があればそれを使用、なければ開発バックエンド）
  API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5050';
}

console.log('API_BASE_URL:', API_BASE_URL);
console.log('========================');

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
