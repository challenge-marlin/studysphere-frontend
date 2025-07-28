import React, { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import { getTokenExpiryTime, isMockLogin } from '../utils/authUtils';

const AuthStatus = () => {
  const { currentUser } = useAuth();
  const [tokenTimeLeft, setTokenTimeLeft] = useState(null);
  const [isMock, setIsMock] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    setIsMock(isMockLogin());

    if (isMockLogin()) {
      return; // モックログインの場合はトークン時間を表示しない
    }

    const updateTokenTime = () => {
      const { getStoredTokens } = require('../utils/authUtils');
      const { accessToken } = getStoredTokens();
      if (accessToken) {
        const timeLeft = getTokenExpiryTime(accessToken);
        setTokenTimeLeft(timeLeft);
      }
    };

    // 初回更新
    updateTokenTime();

    // 1分ごとに更新
    const interval = setInterval(updateTokenTime, 60 * 1000);

    return () => clearInterval(interval);
  }, [currentUser]);

  if (!currentUser) return null;

  if (isMock) {
    return (
      <div className="fixed bottom-4 right-4 bg-yellow-500 text-white px-3 py-2 rounded-lg shadow-lg text-sm font-medium z-50">
        🧪 モックモード
      </div>
    );
  }

  if (tokenTimeLeft === null) return null;

  const isWarning = tokenTimeLeft <= 120; // 2分以下で警告
  const isCritical = tokenTimeLeft <= 30; // 30秒以下で危険

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getBgColor = () => {
    if (isCritical) return 'bg-red-500';
    if (isWarning) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getIcon = () => {
    if (isCritical) return '⚠️';
    if (isWarning) return '⏰';
    return '🔒';
  };

  return (
    <div className={`fixed bottom-4 right-4 ${getBgColor()} text-white px-3 py-2 rounded-lg shadow-lg text-sm font-medium z-50`}>
      {getIcon()} トークン残り: {formatTime(tokenTimeLeft)}
    </div>
  );
};

export default AuthStatus; 