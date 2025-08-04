/**
 * ユーザー情報管理ユーティリティ
 * 現在ログインしているユーザーの情報を取得・管理します
 */

/**
 * ローカルストレージからユーザー情報を取得
 * @returns {Object|null} ユーザー情報
 */
export const getCurrentUser = () => {
  try {
    // 複数のキーでユーザー情報を検索
    const possibleKeys = [
      'userData',
      'currentUser',
      'user',
      'adminUser',
      'loggedInUser',
      'authUser'
    ];
    
    // ローカルストレージから検索
    for (const key of possibleKeys) {
      const userData = localStorage.getItem(key);
      if (userData) {
        try {
          const parsed = JSON.parse(userData);
          if (parsed && (parsed.name || parsed.username || parsed.id)) {
            console.log(`ユーザー情報を ${key} から取得:`, parsed);
            return parsed;
          }
        } catch (e) {
          console.warn(`${key} のパースに失敗:`, e);
        }
      }
    }
    
    // セッションストレージから検索
    for (const key of possibleKeys) {
      const userData = sessionStorage.getItem(key);
      if (userData) {
        try {
          const parsed = JSON.parse(userData);
          if (parsed && (parsed.name || parsed.username || parsed.id)) {
            console.log(`ユーザー情報をセッション ${key} から取得:`, parsed);
            return parsed;
          }
        } catch (e) {
          console.warn(`セッション ${key} のパースに失敗:`, e);
        }
      }
    }
    
    console.log('ユーザー情報が見つかりませんでした');
    return null;
  } catch (error) {
    console.error('ユーザー情報の取得に失敗:', error);
    return null;
  }
};

/**
 * ユーザー情報を保存
 * @param {Object} userData - ユーザー情報
 * @param {boolean} persistent - 永続化するかどうか（デフォルト: true）
 */
export const setCurrentUser = (userData, persistent = true) => {
  try {
    const storage = persistent ? localStorage : sessionStorage;
    storage.setItem('userData', JSON.stringify(userData));
  } catch (error) {
    console.error('ユーザー情報の保存に失敗:', error);
  }
};

/**
 * ユーザー情報をクリア
 */
export const clearCurrentUser = () => {
  try {
    localStorage.removeItem('userData');
    sessionStorage.removeItem('userData');
  } catch (error) {
    console.error('ユーザー情報のクリアに失敗:', error);
  }
};

/**
 * 現在のユーザー名を取得
 * @returns {string} ユーザー名
 */
export const getCurrentUserName = () => {
  const user = getCurrentUser();
  if (user) {
    return user.name || user.username || user.displayName || '不明なユーザー';
  }
  return 'システム';
};

/**
 * 現在のユーザーIDを取得
 * @returns {string} ユーザーID
 */
export const getCurrentUserId = () => {
  const user = getCurrentUser();
  if (user) {
    return user.id || user.userId || 'unknown';
  }
  return 'system';
};

/**
 * ユーザーがログインしているかどうかを確認
 * @returns {boolean} ログイン状態
 */
export const isUserLoggedIn = () => {
  const user = getCurrentUser();
  return user !== null;
}; 