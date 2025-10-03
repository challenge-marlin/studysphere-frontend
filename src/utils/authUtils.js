/**
 * 認証情報管理ユーティリティ
 */

const AUTH_KEYS = {
  LOGIN_CODE: 'loginCode',
  TEMP_PASSWORD: 'tempPassword',
  CURRENT_USER: 'currentUser',
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  TEMP_PASSWORD_EXPIRY: 'tempPasswordExpiry'
};

/**
 * 一時パスワード認証情報を保存
 */
export const saveTempPasswordAuth = (loginCode, tempPassword, userData = null, expiryDate = null) => {
  try {
    // 一時パスワード認証情報を保存
    localStorage.setItem(AUTH_KEYS.LOGIN_CODE, loginCode);
    localStorage.setItem(AUTH_KEYS.TEMP_PASSWORD, tempPassword);
    
    // ユーザー情報を保存
    if (userData) {
      localStorage.setItem(AUTH_KEYS.CURRENT_USER, JSON.stringify(userData));
    }
    
    // 一時パスワードの有効期限を保存（指定がない場合は24時間後）
    if (expiryDate) {
      localStorage.setItem(AUTH_KEYS.TEMP_PASSWORD_EXPIRY, expiryDate);
    } else {
      const defaultExpiry = new Date();
      defaultExpiry.setHours(defaultExpiry.getHours() + 24);
      localStorage.setItem(AUTH_KEYS.TEMP_PASSWORD_EXPIRY, defaultExpiry.toISOString());
    }
    
    console.log('一時パスワード認証情報を保存しました:', { 
      loginCode: '***', 
      tempPassword: '***',
      expiry: expiryDate || '24時間後'
    });
  } catch (error) {
    console.error('一時パスワード認証情報の保存に失敗しました:', error);
  }
};

/**
 * 一時パスワード認証情報を取得
 */
export const getTempPasswordAuth = () => {
  try {
    const loginCode = localStorage.getItem(AUTH_KEYS.LOGIN_CODE);
    const tempPassword = localStorage.getItem(AUTH_KEYS.TEMP_PASSWORD);
    const currentUserStr = localStorage.getItem(AUTH_KEYS.CURRENT_USER);
    const tempPasswordExpiry = localStorage.getItem(AUTH_KEYS.TEMP_PASSWORD_EXPIRY);
    
    // 一時パスワード認証情報が存在しない場合
    if (!loginCode || !tempPassword) {
      return null;
    }
    
    // 一時パスワードの期限切れの場合
    if (tempPasswordExpiry && new Date(tempPasswordExpiry) < new Date()) {
      console.log('一時パスワードの有効期限が切れています');
      clearTempPasswordAuth();
      return null;
    }
    
    let currentUser = null;
    if (currentUserStr) {
      try {
        currentUser = JSON.parse(currentUserStr);
      } catch (e) {
        console.error('currentUserのパースに失敗:', e);
      }
    }
    
    return {
      loginCode,
      tempPassword,
      currentUser
    };
  } catch (error) {
    console.error('一時パスワード認証情報の取得に失敗しました:', error);
    return null;
  }
};

/**
 * 一時パスワード認証情報をクリア
 */
export const clearTempPasswordAuth = () => {
  try {
    localStorage.removeItem(AUTH_KEYS.LOGIN_CODE);
    localStorage.removeItem(AUTH_KEYS.TEMP_PASSWORD);
    localStorage.removeItem(AUTH_KEYS.CURRENT_USER);
    localStorage.removeItem(AUTH_KEYS.TEMP_PASSWORD_EXPIRY);
    console.log('一時パスワード認証情報をクリアしました');
  } catch (error) {
    console.error('一時パスワード認証情報のクリアに失敗しました:', error);
  }
};

/**
 * 一時パスワード認証が有効かチェック
 */
export const isTempPasswordAuthValid = () => {
  const authInfo = getTempPasswordAuth();
  return authInfo !== null;
};

/**
 * ユーザー情報を更新
 */
export const updateUserInfo = (userData) => {
  try {
    if (userData) {
      localStorage.setItem(AUTH_KEYS.CURRENT_USER, JSON.stringify(userData));
      console.log('ユーザー情報を更新しました');
    }
  } catch (error) {
    console.error('ユーザー情報の更新に失敗しました:', error);
  }
};

/**
 * アクセストークンが有効かチェック
 */
export const isAccessTokenValid = () => {
  try {
    const accessToken = localStorage.getItem(AUTH_KEYS.ACCESS_TOKEN);
    if (!accessToken) return false;
    
    // JWTトークンの有効期限をチェック
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp > currentTime;
    } catch (e) {
      console.error('JWTトークンの解析に失敗:', e);
      return false;
    }
  } catch (error) {
    console.error('アクセストークンの確認に失敗しました:', error);
    return false;
  }
};

/**
 * アクセストークンを取得
 */
export const getAccessToken = () => {
  return localStorage.getItem(AUTH_KEYS.ACCESS_TOKEN);
};

/**
 * アクセストークンを保存
 */
export const saveAccessToken = (accessToken, refreshToken = null) => {
  try {
    if (accessToken) {
      localStorage.setItem(AUTH_KEYS.ACCESS_TOKEN, accessToken);
    }
    if (refreshToken) {
      localStorage.setItem(AUTH_KEYS.REFRESH_TOKEN, refreshToken);
    }
    console.log('アクセストークンを保存しました');
  } catch (error) {
    console.error('アクセストークンの保存に失敗しました:', error);
  }
};

/**
 * アクセストークンをクリア
 */
export const clearAccessToken = () => {
  try {
    localStorage.removeItem(AUTH_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(AUTH_KEYS.REFRESH_TOKEN);
    console.log('アクセストークンをクリアしました');
  } catch (error) {
    console.error('アクセストークンのクリアに失敗しました:', error);
  }
};

// JWT認証用ユーティリティ関数

// JWTペイロードを安全にデコードする関数
const decodeJWTPayload = (token) => {
  try {
    if (!token || typeof token !== 'string') {
      return null;
    }
    
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    
    // Base64URLをBase64に変換し、パディングを追加
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const paddedBase64 = base64 + '='.repeat((4 - base64.length % 4) % 4);
    
    // デコードしてJSONパース
    const decoded = atob(paddedBase64);
    return JSON.parse(decoded);
  } catch (error) {
    console.error('JWT decode error:', error);
    return null;
  }
};

// トークンの有効期限をチェック（秒単位で残り時間を返す）
export const getTokenExpiryTime = (token) => {
  if (!token) return 0;
  
  // トークンの形式をチェック
  if (!token.includes('.') || token.split('.').length !== 3) {
    console.error('Invalid token format:', {
      token: token ? token.substring(0, 50) + '...' : 'null',
      fullToken: token, // 完全なトークンを表示
      length: token ? token.length : 0,
      containsDots: token ? token.includes('.') : false,
      dotCount: token ? (token.match(/\./g) || []).length : 0
    });
    return 0;
  }
  
  try {
    const payload = decodeJWTPayload(token);
    if (!payload || !payload.exp) {
      console.error('Invalid token payload or missing exp field');
      return 0;
    }
    
    const expiryTime = payload.exp * 1000; // JWTのexpは秒単位なのでミリ秒に変換
    const currentTime = Date.now();
    const remainingTime = Math.floor((expiryTime - currentTime) / 1000); // 秒単位で返す
    
    return Math.max(0, remainingTime);
  } catch (error) {
    console.error('Token expiry check error:', {
      error: error.message,
      token: token ? token.substring(0, 50) + '...' : 'null',
      fullToken: token, // 完全なトークンを表示
      tokenLength: token ? token.length : 0
    });
    return 0;
  }
};

// リフレッシュトークンの有効期限をチェック（JWTのexpフィールドを使用）
export const isRefreshTokenExpired = (refreshToken) => {
  if (!refreshToken) return true;
  
  try {
    // JWTの形式をチェック
    if (!refreshToken.includes('.') || refreshToken.split('.').length !== 3) {
      console.error('Invalid refresh token format:', {
        token: refreshToken ? refreshToken.substring(0, 50) + '...' : 'null',
        length: refreshToken ? refreshToken.length : 0
      });
      return true;
    }
    
    // JWTのペイロードをデコード
    const payload = decodeJWTPayload(refreshToken);
    if (!payload) {
      console.error('Failed to decode refresh token payload');
      return true;
    }
    
    // expフィールドが存在しない場合は無効
    if (!payload.exp) {
      console.error('Refresh token missing exp field');
      return true;
    }
    
    // 現在時刻と比較（JWTのexpは秒単位）
    // JWTのexpはUTC時間なので、ローカル時間で比較する
    const currentTime = Math.floor(Date.now() / 1000);
    const isExpired = currentTime >= payload.exp;
    
    const remainingTime = Math.max(0, payload.exp - currentTime);
    console.log('リフレッシュトークン有効期限チェック:', {
      currentTime,
      expiryTime: payload.exp,
      isExpired,
      remainingTime,
      remainingMinutes: Math.floor(remainingTime / 60),
      currentDate: new Date(currentTime * 1000).toISOString(),
      expiryDate: new Date(payload.exp * 1000).toISOString()
    });
    
    return isExpired;
  } catch (error) {
    console.error('Refresh token expiry check error:', error);
    return true;
  }
};

// トークンが有効かどうかをチェック
export const isTokenValid = (token) => {
  return getTokenExpiryTime(token) > 0;
};

// ローカルストレージからトークンを取得
export const getStoredTokens = () => {
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  return { accessToken, refreshToken };
};

// ローカルストレージにトークンを保存
export const storeTokens = (accessToken, refreshToken) => {
  if (accessToken) localStorage.setItem('accessToken', accessToken);
  if (refreshToken) {
    localStorage.setItem('refreshToken', refreshToken);
    console.log('リフレッシュトークンを保存しました');
  }
};

// ローカルストレージからトークンを削除
export const clearStoredTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('refreshTokenCreated');
  
  // 一時パスワード認証関連の情報もクリア
  localStorage.removeItem('autoLoginCode');
  localStorage.removeItem('tempPassword');
  localStorage.removeItem('loginCode');
  localStorage.removeItem('temp_password');
  localStorage.removeItem('code');
  localStorage.removeItem('password');
  
  console.log('トークンと一時パスワード認証データをクリアしました');
};

// トークン更新APIを呼び出し
export const refreshTokenAPI = async (refreshToken) => {
  try {
    console.log('トークン更新API呼び出し開始:', { refreshToken: refreshToken ? '存在' : 'なし' });
    
    const API_BASE_URL = process.env.REACT_APP_API_URL || 
      (window.location.hostname === 'studysphere.ayatori-inc.co.jp' 
        ? 'https://backend.studysphere.ayatori-inc.co.jp' 
        : 'http://localhost:5050');
    const response = await fetch(`${API_BASE_URL}/api/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    console.log('トークン更新API応答:', { status: response.status, ok: response.ok });
    
    const data = await response.json();
    console.log('トークン更新API応答データ:', data);
    
    if (!response.ok) {
      console.error('トークン更新API失敗:', { status: response.status, data });
      throw new Error(data.message || 'トークン更新に失敗しました');
    }

    if (!data.success) {
      console.error('トークン更新API成功フラグがfalse:', data);
      throw new Error(data.message || 'トークン更新に失敗しました');
    }

    console.log('トークン更新API成功:', data);
    return data;
  } catch (error) {
    console.error('Token refresh API error:', error);
    throw error;
  }
};



// 認証が必要なページかどうかを判定
export const isAuthRequiredPage = (pathname) => {
  const authNotRequiredPaths = ['/', '/student/login', '/login'];
  return !authNotRequiredPaths.some(path => pathname.startsWith(path));
};

// ログアウト処理
export const handleLogout = (navigate) => {
  console.log('=== handleLogout 実行 ===');
  
  // ユーザーデータを取得（ロール判定用）
  const userData = localStorage.getItem('currentUser');
  let userRoleId = null;
  
  if (userData) {
    try {
      const user = JSON.parse(userData);
      userRoleId = user.role;
    } catch (error) {
      console.error('ユーザー情報の解析に失敗しました:', error);
    }
  }
  
  // トークンをクリア
  clearStoredTokens();
  
  // ユーザーデータをクリア
  localStorage.removeItem('currentUser');
  
  // 追加のクリア処理（確実性のため）
  localStorage.clear();
  sessionStorage.clear();
  
  console.log('LocalStorageとSessionStorageを完全にクリアしました');
  
  // ロールに応じてナビゲーション先を変更
  if (userRoleId === 1) {
    // 利用者（ロール1）の場合
    console.log('利用者のため、利用者ログインページにリダイレクトします');
    navigate('/student-login/');
  } else if (userRoleId >= 4) {
    // 管理者・指導員（ロール4以上）の場合
    console.log('管理者・指導員のため、管理者・指導員ログインページにリダイレクトします');
    navigate('/admin-instructor-login');
  } else {
    // 不明なロールの場合、ホームページにリダイレクト
    console.log('不明なロールのため、ホームページにリダイレクトします');
    navigate('/homepage');
  }
};

// トークン無効時の即座リダイレクト処理
export const handleTokenInvalid = (navigate, reason = 'トークンが無効になりました') => {
  console.warn('Token invalid, redirecting to login:', reason);
  
  // 既にリダイレクト処理中の場合はスキップ
  if (window.isRedirecting) {
    console.log('既にリダイレクト処理中のため、重複処理をスキップします');
    return;
  }
  
  window.isRedirecting = true;
  
  // ユーザーデータを取得（ロール判定用）
  const userData = localStorage.getItem('currentUser');
  let userRoleId = null;
  
  if (userData) {
    try {
      const user = JSON.parse(userData);
      userRoleId = user.role;
    } catch (error) {
      console.error('ユーザー情報の解析に失敗しました:', error);
    }
  }
  
  clearStoredTokens();
  localStorage.removeItem('currentUser');
  
  // 追加のクリア処理（確実性のため）
  localStorage.clear();
  sessionStorage.clear();
  
  // 現在のパスを取得
  const currentPath = window.location.pathname;
  
  // ログインページまたは利用者ログインページの場合はアラートを表示しない
  const isLoginPage = currentPath === '/homepage' || currentPath.startsWith('/student/login') || currentPath.startsWith('/login');
  
  // ロールに応じてナビゲーション先を決定
  let targetPath = '/homepage'; // デフォルト（ホームページ）
  if (userRoleId === 1) {
    targetPath = '/student-login/';
  } else if (userRoleId >= 4) {
    targetPath = '/admin-instructor-login';
  }
  
  // ログインページでない場合のみアラートを表示してからナビゲーション
  if (!isLoginPage && typeof window !== 'undefined' && window.alert) {
    alert(`${reason}\nログインページに戻ります。`);
    // アラート後に通常のナビゲーション（強制リロードを避ける）
    navigate(targetPath, { replace: true });
  } else {
    // ログインページの場合は即座にリダイレクト（アラートなし）
    navigate(targetPath, { replace: true });
  }
  
  // リダイレクト処理完了後にフラグをリセット
  setTimeout(() => {
    window.isRedirecting = false;
  }, 1000);
};

// トークン更新が必要かどうかを判定（残り30分以下で更新）
export const shouldRefreshToken = (token) => {
  const remainingTime = getTokenExpiryTime(token);
  return remainingTime <= 30 * 60; // 30分以下で更新（1800秒）
}; 