import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  getStoredTokens,
  storeTokens,
  clearStoredTokens,
  isTokenValid,
  shouldRefreshToken,
  refreshTokenAPI,
  isMockLogin,
  isAuthRequiredPage,
  handleLogout
} from '../../utils/authUtils';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const tokenCheckInterval = useRef(null);
  const tokenRefreshTimeout = useRef(null);

  // 初期認証チェック
  useEffect(() => {
    const checkInitialAuth = () => {
      try {
        const userData = localStorage.getItem('currentUser');
        if (!userData) {
          setIsAuthenticated(false);
          setCurrentUser(null);
          setIsLoading(false);
          return;
        }

        const user = JSON.parse(userData);
        setCurrentUser(user);

        // モックログインの場合は認証済みとして扱う
        if (isMockLogin()) {
          setIsAuthenticated(true);
          setIsLoading(false);
          return;
        }

        // JWT認証の場合
        const { accessToken, refreshToken } = getStoredTokens();
        
        if (!accessToken || !refreshToken) {
          // トークンがない場合はログアウト
          handleLogout(navigate);
          return;
        }

        if (!isTokenValid(accessToken)) {
          // アクセストークンが無効な場合はリフレッシュトークンで更新を試行
          handleTokenRefresh(refreshToken);
          return;
        }

        setIsAuthenticated(true);
        setIsLoading(false);
      } catch (error) {
        console.error('Initial auth check error:', error);
        handleLogout(navigate);
      }
    };

    checkInitialAuth();
  }, []);

  // トークン更新処理
  const handleTokenRefresh = async (refreshToken) => {
    try {
      const response = await refreshTokenAPI(refreshToken);
      
      if (response.success) {
        const { access_token, refresh_token } = response.data;
        storeTokens(access_token, refresh_token);
        
        // ユーザー情報を更新
        const userData = JSON.parse(localStorage.getItem('currentUser'));
        const updatedUser = {
          ...userData,
          access_token,
          refresh_token
        };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        setCurrentUser(updatedUser);
        
        setIsAuthenticated(true);
        setIsLoading(false);
      } else {
        throw new Error(response.message || 'トークン更新に失敗しました');
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      handleLogout(navigate);
    }
  };

  // 定期的なトークンチェック（3分ごと）
  useEffect(() => {
    if (isMockLogin() || !isAuthenticated) {
      return;
    }

    const checkTokenPeriodically = () => {
      const { accessToken, refreshToken } = getStoredTokens();
      
      if (!accessToken || !refreshToken) {
        handleLogout(navigate);
        return;
      }

      if (!isTokenValid(accessToken)) {
        handleLogout(navigate);
        return;
      }

      // 残り120秒以下でトークン更新
      if (shouldRefreshToken(accessToken)) {
        handleTokenRefresh(refreshToken);
      }
    };

    // 初回チェック
    checkTokenPeriodically();

    // 3分ごとにチェック
    tokenCheckInterval.current = setInterval(checkTokenPeriodically, 3 * 60 * 1000);

    return () => {
      if (tokenCheckInterval.current) {
        clearInterval(tokenCheckInterval.current);
      }
    };
  }, [isAuthenticated]);

  // ページ変更時の認証チェック
  useEffect(() => {
    if (isLoading) return;

    const pathname = location.pathname;
    
    // 認証が必要なページで認証されていない場合
    if (isAuthRequiredPage(pathname) && !isAuthenticated) {
      handleLogout(navigate);
      return;
    }

    // 認証済みでログインページにアクセスした場合の処理を削除
    // これにより、ログアウト後にログインページに戻れるようになる
    // また、生徒ログイン時も既存セッションがあっても新しいログインが可能になる
  }, [location.pathname, isAuthenticated, isLoading]);

  // ログアウト処理
  const logout = () => {
    if (tokenCheckInterval.current) {
      clearInterval(tokenCheckInterval.current);
    }
    if (tokenRefreshTimeout.current) {
      clearTimeout(tokenRefreshTimeout.current);
    }
    handleLogout(navigate);
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  // ログイン処理
  const login = (userData, accessToken, refreshToken) => {
    localStorage.setItem('currentUser', JSON.stringify(userData));
    
    if (accessToken && refreshToken) {
      storeTokens(accessToken, refreshToken);
    }
    
    setCurrentUser(userData);
    setIsAuthenticated(true);
  };

  const value = {
    isAuthenticated,
    isLoading,
    currentUser,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 