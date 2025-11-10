/**
 * IPアドレス取得ユーティリティ
 * 複数の方法でIPアドレスを取得を試行します
 */
import { API_BASE_URL } from '../config/apiConfig';

/**
 * バックエンドAPIを使用してIPアドレスを取得
 * @returns {Promise<string>} IPアドレス
 */

const getIPFromBackendAPI = async () => {
  try {

    const response = await fetch(`${API_BASE_URL}/api/operation-logs/client-ip`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.data?.ip || 'N/A';
    }
    
    return 'N/A';
  } catch (error) {
    console.warn('バックエンドIP取得サービスでエラー:', error);
    return 'N/A';
  }
};

/**
 * WebRTCを使用してローカルIPアドレスを取得（開発環境用）
 * @returns {Promise<string>} ローカルIPアドレス
 */
const getLocalIPAddress = () => {
  return new Promise((resolve) => {
    try {
      const RTCPeerConnection = window.RTCPeerConnection || 
                               window.webkitRTCPeerConnection || 
                               window.mozRTCPeerConnection;

      if (!RTCPeerConnection) {
        resolve('N/A');
        return;
      }

      const pc = new RTCPeerConnection({
        iceServers: []
      });

      pc.createDataChannel('');
      pc.createOffer().then(offer => pc.setLocalDescription(offer));

      pc.onicecandidate = (event) => {
        if (!event || !event.candidate) {
          pc.close();
          resolve('N/A');
          return;
        }

        const ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3})/;
        const match = ipRegex.exec(event.candidate.candidate);
        
        if (match) {
          const ip = match[1];
          pc.close();
          resolve(ip);
        }
      };

      // タイムアウト設定
      setTimeout(() => {
        pc.close();
        resolve('N/A');
      }, 3000);

    } catch (error) {
      console.warn('ローカルIP取得エラー:', error);
      resolve('N/A');
    }
  });
};

/**
 * メインのIPアドレス取得関数
 * @returns {Promise<string>} IPアドレス
 */
export const getClientIPAddress = async () => {
  try {
    // まずバックエンドAPIでIPを取得
    const backendIP = await getIPFromBackendAPI();
    
    if (backendIP && backendIP !== 'N/A') {
      return backendIP;
    }

    // バックエンドAPIが失敗した場合、ローカルIPを取得
    const localIP = await getLocalIPAddress();
    return localIP;

  } catch (error) {
    console.error('IPアドレス取得に失敗:', error);
    return 'N/A';
  }
};

/**
 * IPアドレスをキャッシュして取得（パフォーマンス向上）
 */
let cachedIP = null;
let cacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5分間キャッシュ

export const getCachedIPAddress = async () => {
  const now = Date.now();
  
  // キャッシュが有効な場合はキャッシュを返す
  if (cachedIP && (now - cacheTime) < CACHE_DURATION) {
    return cachedIP;
  }

  // 新しいIPアドレスを取得
  const ip = await getClientIPAddress();
  
  // キャッシュを更新
  cachedIP = ip;
  cacheTime = now;
  
  return ip;
}; 