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
    const currentTime = Math.floor(Date.now() / 1000);
    const isExpired = currentTime >= payload.exp;
    
    console.log('リフレッシュトークン有効期限チェック:', {
      currentTime,
      expiryTime: payload.exp,
      isExpired,
      remainingTime: Math.max(0, payload.exp - currentTime)
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
  console.log('トークンと関連データをクリアしました');
};

// トークン更新APIを呼び出し
export const refreshTokenAPI = async (refreshToken) => {
  try {
    console.log('トークン更新API呼び出し開始:', { refreshToken: refreshToken ? '存在' : 'なし' });
    
    const response = await fetch('/api/refresh', {
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
  
  // トークンをクリア
  clearStoredTokens();
  
  // ユーザーデータをクリア
  localStorage.removeItem('currentUser');
  
  // 追加のクリア処理（確実性のため）
  localStorage.clear();
  sessionStorage.clear();
  
  console.log('LocalStorageとSessionStorageを完全にクリアしました');
  
  // ログインページにリダイレクト
  navigate('/');
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
  
  clearStoredTokens();
  localStorage.removeItem('currentUser');
  
  // 追加のクリア処理（確実性のため）
  localStorage.clear();
  sessionStorage.clear();
  
  // 現在のパスを取得
  const currentPath = window.location.pathname;
  
  // ログインページまたは生徒ログインページの場合はアラートを表示しない
  const isLoginPage = currentPath === '/' || currentPath.startsWith('/student/login') || currentPath.startsWith('/login');
  
  // ログインページでない場合のみアラートを表示してからナビゲーション
  if (!isLoginPage && typeof window !== 'undefined' && window.alert) {
    alert(`${reason}\nログインページに戻ります。`);
    // アラート後に通常のナビゲーション（強制リロードを避ける）
    navigate('/', { replace: true });
  } else {
    // ログインページの場合は即座にリダイレクト（アラートなし）
    navigate('/', { replace: true });
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