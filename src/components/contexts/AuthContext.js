import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  getStoredTokens,
  storeTokens,
  clearStoredTokens,
  isTokenValid,
  shouldRefreshToken,
  getTokenExpiryTime,
  refreshTokenAPI,
  isMockLogin,
  isAuthRequiredPage,
  handleLogout,
  handleTokenInvalid
} from '../../utils/authUtils';
import { setGlobalNavigate, setupFetchInterceptor } from '../../utils/httpInterceptor';
import { addOperationLog } from '../../utils/operationLogManager';

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
    // グローバルナビゲーション関数を設定
    setGlobalNavigate(navigate);
    
    // HTTPインターセプターを設定
    setupFetchInterceptor();
    
    const checkInitialAuth = async () => {
      try {
        console.log('=== 初期認証チェック開始 ===');
        const userData = localStorage.getItem('currentUser');
        console.log('localStorage currentUser:', userData ? '存在' : 'なし');
        
        if (!userData) {
          console.log('ユーザーデータがありません');
          setIsAuthenticated(false);
          setCurrentUser(null);
          setIsLoading(false);
          return;
        }

        const user = JSON.parse(userData);
        console.log('ユーザー情報:', { role: user.role, name: user.name });
        setCurrentUser(user);

        // モックログインの場合は認証済みとして扱う
        if (isMockLogin()) {
          console.log('モックログインとして認証');
          setIsAuthenticated(true);
          setIsLoading(false);
          return;
        }

        // JWT認証の場合
        const { accessToken, refreshToken } = getStoredTokens();
        console.log('保存されたトークン:', { 
          accessToken: accessToken ? '存在' : 'なし', 
          refreshToken: refreshToken ? '存在' : 'なし' 
        });
        
        // トークンがない場合はモックログインとして扱う
        if (!accessToken || !refreshToken) {
          console.log('トークンが見つかりません - モックログインとして処理');
          setIsAuthenticated(true);
          setIsLoading(false);
          return;
        }
        
        // トークンの詳細を確認（デバッグ用）
        if (accessToken) {
          console.log('アクセストークン詳細:', {
            length: accessToken.length,
            startsWith: accessToken.substring(0, 20) + '...',
            containsDots: accessToken.includes('.'),
            dotCount: (accessToken.match(/\./g) || []).length,
            fullToken: accessToken // 完全なトークンを表示
          });
        }
        if (refreshToken) {
          console.log('リフレッシュトークン詳細:', {
            length: refreshToken.length,
            startsWith: refreshToken.substring(0, 20) + '...',
            containsDots: refreshToken.includes('.'),
            dotCount: (refreshToken.match(/\./g) || []).length,
            fullToken: refreshToken // 完全なトークンを表示
          });
        }

        // トークンの形式をチェック
        if (!accessToken.includes('.') || accessToken.split('.').length !== 3) {
          console.error('アクセストークンの形式が不正です:', accessToken);
          handleTokenInvalid(navigate, 'アクセストークンの形式が不正です');
          return;
        }

        if (!refreshToken.includes('.') || refreshToken.split('.').length !== 3) {
          console.error('リフレッシュトークンの形式が不正です:', refreshToken);
          handleTokenInvalid(navigate, 'リフレッシュトークンの形式が不正です');
          return;
        }

        // アクセストークンの有効性をチェック
        const isValid = isTokenValid(accessToken);
        const remainingTime = getTokenExpiryTime(accessToken);
        
        console.log('トークン有効性チェック:', { 
          isValid, 
          remainingTime, 
          shouldRefresh: shouldRefreshToken(accessToken),
          remainingMinutes: Math.floor(remainingTime / 60)
        });

        if (!isValid) {
          // アクセストークンが完全に無効な場合はリフレッシュトークンで更新を試行
          console.log('アクセストークンが無効です。トークン更新を試行します。');
          try {
            await handleTokenRefresh(refreshToken);
            setIsAuthenticated(true);
            setIsLoading(false);
          } catch (error) {
            console.error('トークン更新に失敗:', error);
            handleTokenInvalid(navigate, 'アクセストークンが無効です');
          }
          return;
        }

        // アクセストークンが有効だが、更新が必要な場合
        if (shouldRefreshToken(accessToken)) {
          console.log('アクセストークンは有効ですが、更新が必要です。バックグラウンドで更新します。');
          // バックグラウンドでトークン更新を試行（失敗しても認証状態は維持）
          handleTokenRefresh(refreshToken).catch(error => {
            console.warn('バックグラウンドトークン更新に失敗:', error);
            // 更新に失敗しても現在のトークンで継続
          });
        }

        console.log('認証成功: ユーザーを認証済みとして設定');
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
      console.log('トークン更新開始:', { refreshToken: refreshToken ? '存在' : 'なし' });
      const response = await refreshTokenAPI(refreshToken);
      console.log('トークン更新API応答:', response);
      
      if (response.success) {
        const { access_token, refresh_token } = response.data;
        storeTokens(access_token, refresh_token);
        console.log('トークン保存完了');
        
        // ユーザー情報を更新（既存のユーザー情報がある場合のみ）
        const userData = localStorage.getItem('currentUser');
        if (userData) {
          try {
            const user = JSON.parse(userData);
            const updatedUser = {
              ...user,
              access_token,
              refresh_token
            };
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            setCurrentUser(updatedUser);
            console.log('ユーザー情報更新完了');
          } catch (error) {
            console.warn('ユーザー情報の更新に失敗:', error);
          }
        }
        
        setIsAuthenticated(true);
        setIsLoading(false);
      } else {
        console.error('トークン更新APIが失敗:', response);
        throw new Error(response.message || 'トークン更新に失敗しました');
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      handleTokenInvalid(navigate, 'トークン更新に失敗しました');
    }
  };

  // 定期的なトークンチェック（3分ごと）
  useEffect(() => {
    // 認証されていない場合はチェックしない
    if (!isAuthenticated || isMockLogin()) {
      console.log('認証されていないため、定期的なトークンチェックをスキップ');
      return;
    }

    const checkTokenPeriodically = async () => {
      console.log('定期的なトークンチェック開始');
      const { accessToken, refreshToken } = getStoredTokens();
      console.log('保存されたトークン:', { accessToken: accessToken ? '存在' : 'なし', refreshToken: refreshToken ? '存在' : 'なし' });
      
      // トークンの詳細を確認（デバッグ用）
      if (accessToken) {
        console.log('定期的チェック - アクセストークン詳細:', {
          length: accessToken.length,
          startsWith: accessToken.substring(0, 20) + '...',
          containsDots: accessToken.includes('.'),
          dotCount: (accessToken.match(/\./g) || []).length,
          fullToken: accessToken // 完全なトークンを表示
        });
      }
      
      if (!accessToken || !refreshToken) {
        console.log('トークンが見つかりません');
        handleTokenInvalid(navigate, 'トークンが見つかりません');
        return;
      }

      // トークンの形式をチェック
      if (!accessToken.includes('.') || accessToken.split('.').length !== 3) {
        console.error('トークンの形式が不正です:', accessToken);
        handleTokenInvalid(navigate, 'トークンの形式が不正です');
        return;
      }

      const isValid = isTokenValid(accessToken);
      const remainingTime = getTokenExpiryTime(accessToken);
      console.log('アクセストークン状態:', { isValid, remainingTime });

      if (!isValid) {
        // トークンが完全に無効な場合はリダイレクト
        console.log('トークンの有効期限が切れました');
        handleTokenInvalid(navigate, 'トークンの有効期限が切れました');
        return;
      }

      // 残り120秒以下でトークン更新
      if (shouldRefreshToken(accessToken)) {
        console.log('トークン更新が必要です');
        try {
          await handleTokenRefresh(refreshToken);
          console.log('トークン更新が完了しました');
        } catch (error) {
          console.error('トークン更新に失敗:', error);
          // 更新に失敗しても現在のトークンで継続（完全に無効になるまで）
          const stillValid = isTokenValid(accessToken);
          if (!stillValid) {
            handleTokenInvalid(navigate, 'トークン更新に失敗しました');
          }
        }
      } else {
        console.log('トークン更新は不要です');
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
      handleTokenInvalid(navigate, '認証が必要です');
      return;
    }

    // 認証済みでログインページにアクセスした場合の処理を削除
    // これにより、ログアウト後にログインページに戻れるようになる
    // また、生徒ログイン時も既存セッションがあっても新しいログインが可能になる
  }, [location.pathname, isAuthenticated, isLoading]);

  // ログアウト処理
  const logout = async () => {
    // ログアウト前にユーザー情報を取得
    const userData = localStorage.getItem('currentUser');
    let userName = '不明';
    let userRole = '不明';
    
    if (userData) {
      try {
        const user = JSON.parse(userData);
        userName = user.name || '不明';
        userRole = user.role === 'admin' ? '管理者' : user.role === 'instructor' ? '指導員' : '不明';
      } catch (error) {
        console.error('ユーザー情報の解析に失敗しました:', error);
      }
    }
    
    // 操作ログを記録
    try {
      await addOperationLog({
        action: 'ログアウト',
        details: `${userRole}「${userName}」がログアウトしました`
      });
    } catch (error) {
      console.error('ログアウトログの記録に失敗しました:', error);
    }
    
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
    console.log('=== ログイン処理開始 ===');
    console.log('ユーザーデータ:', userData);
    console.log('アクセストークン:', accessToken ? '存在' : 'なし');
    console.log('リフレッシュトークン:', refreshToken ? '存在' : 'なし');
    
    // トークンの詳細を確認（デバッグ用）
    if (accessToken) {
      console.log('ログイン時 - アクセストークン詳細:', {
        length: accessToken.length,
        startsWith: accessToken.substring(0, 20) + '...',
        containsDots: accessToken.includes('.'),
        dotCount: (accessToken.match(/\./g) || []).length,
        fullToken: accessToken // 完全なトークンを表示
      });
    }
    if (refreshToken) {
      console.log('ログイン時 - リフレッシュトークン詳細:', {
        length: refreshToken.length,
        startsWith: refreshToken.substring(0, 20) + '...',
        containsDots: refreshToken.includes('.'),
        dotCount: (refreshToken.match(/\./g) || []).length,
        fullToken: refreshToken // 完全なトークンを表示
      });
    }
    
    localStorage.setItem('currentUser', JSON.stringify(userData));
    console.log('ユーザーデータをlocalStorageに保存完了');
    
    // トークンが提供されている場合のみ保存
    if (accessToken && refreshToken) {
      storeTokens(accessToken, refreshToken);
      console.log('トークンをlocalStorageに保存完了');
    } else {
      // トークンがない場合はクリア
      clearStoredTokens();
      console.log('トークンなし - モックログインとして処理');
    }
    
    setCurrentUser(userData);
    setIsAuthenticated(true);
    console.log('認証状態を設定完了');
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