import React, { useState, useEffect } from 'react';
import { getStoredTokens, getTokenExpiryTime } from '../utils/authUtils';
import { useLocation } from 'react-router-dom';

const TokenCountdown = () => {
  const [remainingTime, setRemainingTime] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();

  // 管理者ページでのみ表示するかチェック
  const isAdminPage = () => {
    return location.pathname.startsWith('/admin/');
  };

  // 残り時間を計算して表示を更新
  const updateRemainingTime = () => {
    // 管理者ページでない場合は表示しない
    if (!isAdminPage()) {
      setIsVisible(false);
      return;
    }



    const { accessToken } = getStoredTokens();
    if (accessToken) {
      const time = getTokenExpiryTime(accessToken);
      setRemainingTime(time);
      setIsVisible(time > 0);
    } else {
      setIsVisible(false);
    }
  };

  // 初期化と定期的な更新
  useEffect(() => {
    // 初回更新
    updateRemainingTime();

    // 1秒ごとに更新
    const interval = setInterval(updateRemainingTime, 1000);

    return () => clearInterval(interval);
  }, [location.pathname]); // ページ変更時にも更新

  // 残り時間を分:秒形式でフォーマット
  const formatTime = (seconds) => {
    if (seconds <= 0) return '00:00';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // 残り時間に応じた色を決定
  const getTimeColor = () => {
    if (remainingTime <= 30) return 'text-red-600'; // 30秒以下は赤
    if (remainingTime <= 60) return 'text-orange-600'; // 1分以下はオレンジ
    if (remainingTime <= 180) return 'text-yellow-600'; // 3分以下は黄
    return 'text-green-600'; // それ以外は緑
  };

  // 残り時間に応じた背景色を決定
  const getBackgroundColor = () => {
    if (remainingTime <= 30) return 'bg-red-100 border-red-300'; // 30秒以下は赤
    if (remainingTime <= 60) return 'bg-orange-100 border-orange-300'; // 1分以下はオレンジ
    if (remainingTime <= 180) return 'bg-yellow-100 border-yellow-300'; // 3分以下は黄
    return 'bg-green-100 border-green-300'; // それ以外は緑
  };

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed bottom-4 right-4 z-50 p-3 rounded-lg border-2 shadow-lg ${getBackgroundColor()} transition-all duration-300`}
      title="試験用：トークン残り時間表示"
    >
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
        <span className="text-sm font-medium text-gray-700">リフレッシュトークン残り</span>
        <span className={`text-lg font-bold ${getTimeColor()}`}>
          {formatTime(remainingTime)}
        </span>
      </div>
      
      {/* 残り時間が少ない場合の警告メッセージ */}
      {remainingTime <= 60 && (
        <div className="mt-1 text-xs text-red-600 font-medium">
          {remainingTime <= 30 ? '⚠️ まもなく期限切れ' : '⚠️ 更新が必要'}
        </div>
      )}
      
      {/* 試験用であることを示すメッセージ */}
      <div className="mt-1 text-xs text-gray-500">
        🔬 管理者試験用
      </div>
    </div>
  );
};

export default TokenCountdown; 