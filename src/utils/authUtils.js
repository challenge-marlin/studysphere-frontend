// JWT認証用ユーティリティ関数

// トークンの有効期限をチェック（秒単位で残り時間を返す）
export const getTokenExpiryTime = (token) => {
  if (!token) return 0;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiryTime = payload.exp * 1000; // JWTのexpは秒単位なのでミリ秒に変換
    const currentTime = Date.now();
    const remainingTime = Math.floor((expiryTime - currentTime) / 1000); // 秒単位で返す
    
    return Math.max(0, remainingTime);
  } catch (error) {
    console.error('Token expiry check error:', error);
    return 0;
  }
};

// トークンが有効かどうかをチェック
export const isTokenValid = (token) => {
  return getTokenExpiryTime(token) > 0;
};

// セッションストレージからトークンを取得
export const getStoredTokens = () => {
  const accessToken = sessionStorage.getItem('accessToken');
  const refreshToken = sessionStorage.getItem('refreshToken');
  return { accessToken, refreshToken };
};

// セッションストレージにトークンを保存
export const storeTokens = (accessToken, refreshToken) => {
  if (accessToken) sessionStorage.setItem('accessToken', accessToken);
  if (refreshToken) sessionStorage.setItem('refreshToken', refreshToken);
};

// セッションストレージからトークンを削除
export const clearStoredTokens = () => {
  sessionStorage.removeItem('accessToken');
  sessionStorage.removeItem('refreshToken');
};

// トークン更新APIを呼び出し
export const refreshTokenAPI = async (refreshToken) => {
  try {
    const response = await fetch('http://localhost:5000/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'トークン更新に失敗しました');
    }

    return data;
  } catch (error) {
    console.error('Token refresh API error:', error);
    throw error;
  }
};

// モックログインかどうかを判定
export const isMockLogin = () => {
  const currentUser = localStorage.getItem('currentUser');
  if (!currentUser) return false;
  
  try {
    const userData = JSON.parse(currentUser);
    // 管理者でaccess_tokenがない場合はモックログイン
    if (userData.role === 'admin' && !userData.access_token) {
      return true;
    }
    // 指導員または生徒の場合はモックログイン
    if (userData.role === 'instructor' || userData.role === 'student') {
      return true;
    }
    return false;
  } catch (error) {
    console.error('Mock login check error:', error);
    return false;
  }
};

// 認証が必要なページかどうかを判定
export const isAuthRequiredPage = (pathname) => {
  const authNotRequiredPaths = ['/', '/student/login'];
  return !authNotRequiredPaths.some(path => pathname.startsWith(path));
};

// ログアウト処理
export const handleLogout = (navigate) => {
  clearStoredTokens();
  localStorage.removeItem('currentUser');
  navigate('/');
};

// トークン無効時の即座リダイレクト処理
export const handleTokenInvalid = (navigate, reason = 'トークンが無効になりました') => {
  console.warn('Token invalid, redirecting to login:', reason);
  clearStoredTokens();
  localStorage.removeItem('currentUser');
  
  // 現在のパスを取得
  const currentPath = window.location.pathname;
  
  // ログインページまたは生徒ログインページの場合はアラートを表示しない
  const isLoginPage = currentPath === '/' || currentPath.startsWith('/student/login');
  
  // ログインページでない場合のみアラートを表示してから強制リロード
  if (!isLoginPage && typeof window !== 'undefined' && window.alert) {
    alert(`${reason}\nログインページに戻ります。`);
    // アラート後に強制リロード
    window.location.href = '/';
  } else {
    // ログインページの場合は即座にリダイレクト
    navigate('/', { replace: true });
  }
};

// トークン更新が必要かどうかを判定（残り190秒以下で更新）
export const shouldRefreshToken = (token) => {
  const remainingTime = getTokenExpiryTime(token);
  return remainingTime <= 190; // 190秒以下で更新
}; 