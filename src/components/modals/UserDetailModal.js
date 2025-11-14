import React, { useState, useEffect } from 'react';
import { formatUTCToJapanTimeString } from '../../utils/dateUtils';
import { API_BASE_URL } from '../../config/apiConfig';

const UserDetailModal = ({ isOpen, onClose, selectedUser }) => {
  const [captureRecords, setCaptureRecords] = useState({ photos: [], screenshots: [] });
  const [loading, setLoading] = useState(false);
  const [startTime, setStartTime] = useState(null);

  // S3から画像データを取得
  const fetchCaptureRecords = async () => {
    if (!selectedUser || !selectedUser.id) return;
    
    setLoading(true);
    try {
      // selectedUser.dateがあればそれを使用、なければ今日の日付を使用
      const targetDate = selectedUser.date || new Date().toISOString().split('T')[0];
      console.log('UserDetailModal: 対象日付:', targetDate, 'selectedUser.date:', selectedUser.date);
      
      // バックエンドのAPIを呼び出してS3の画像データを取得
      const response = await fetch(`${API_BASE_URL}/api/remote-support/capture-records/${selectedUser.id}/${targetDate}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCaptureRecords({
            photos: data.data.photos || [],
            screenshots: data.data.screenshots || []
          });
          setStartTime(data.data.startTime || null);
        }
      } else {
        console.error('画像データの取得に失敗しました:', response.status);
      }
    } catch (error) {
      console.error('画像データの取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && selectedUser) {
      fetchCaptureRecords();
    }
  }, [isOpen, selectedUser]);

  // すべての画像を時刻順にソートしてグループ化
  const getAllImagesSorted = () => {
    const allImages = [
      ...captureRecords.photos.map(img => ({ ...img, type: 'camera' })),
      ...captureRecords.screenshots.map(img => ({ ...img, type: 'screenshot' }))
    ].sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
    
    return allImages;
  };

  if (!isOpen || !selectedUser) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">{selectedUser.name} 詳細</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* サマリーカード */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
              <div className="flex items-center gap-3">
                <span className="text-blue-600 text-2xl">🕐</span>
                <div>
                  <p className="text-blue-600 text-sm font-medium">開始時間</p>
                  <p className="text-lg font-bold text-blue-800">
                    {startTime 
                      ? new Date(startTime).toLocaleTimeString('ja-JP', { 
                          hour: '2-digit', 
                          minute: '2-digit',
                          timeZone: 'Asia/Tokyo'
                        })
                      : '-'}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-xl border border-green-200">
              <div className="flex items-center gap-3">
                <span className="text-green-600 text-2xl">📊</span>
                <div>
                  <p className="text-green-600 text-sm font-medium">記録数</p>
                  <p className="text-lg font-bold text-green-800">{captureRecords.photos.length + captureRecords.screenshots.length}件</p>
                </div>
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
              <div className="flex items-center gap-3">
                <span className="text-purple-600 text-2xl">🖥️</span>
                <div>
                  <p className="text-purple-600 text-sm font-medium">デスクトップ</p>
                  <p className="text-lg font-bold text-purple-800">{captureRecords.screenshots.length}件</p>
                </div>
              </div>
            </div>
            <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
              <div className="flex items-center gap-3">
                <span className="text-orange-600 text-2xl">📷</span>
                <div>
                  <p className="text-orange-600 text-sm font-medium">カメラ</p>
                  <p className="text-lg font-bold text-orange-800">{captureRecords.photos.length}件</p>
                </div>
              </div>
            </div>
          </div>

          {/* 今日の記録一覧 */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">📸 今日の記録</h4>
            
            {loading ? (
              <div className="text-center py-12">
                <div className="text-blue-600 text-xl font-semibold mb-2">読み込み中...</div>
                <div className="text-gray-500">画像データを取得しています</div>
              </div>
            ) : captureRecords.photos.length === 0 && captureRecords.screenshots.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg">本日の記録はありません</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {getAllImagesSorted().map((image, index) => {
                  // S3のLastModifiedはUTCで返ってくるので、JSTに変換
                  const date = new Date(image.lastModified);
                  
                  // 時刻のみ表示（HH:MM形式）
                  const timeString = date.toLocaleTimeString('ja-JP', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    timeZone: 'Asia/Tokyo'
                  });
                  
                  // 日時表示（YYYY/MM/DD HH:MM形式）
                  const dateTimeString = date.toLocaleString('ja-JP', { 
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: 'Asia/Tokyo'
                  });
                  
                  // デバッグ: 画像URLをログ出力
                  console.log('画像データ:', {
                    url: image.url,
                    lastModified: image.lastModified,
                    type: image.type,
                    parsedDate: date.toString()
                  });
                  
                  return (
                    <div key={index} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className={image.type === 'camera' ? 'text-orange-600' : 'text-blue-600'}>
                            {image.type === 'camera' ? '📷' : '🖥️'}
                          </span>
                          <span className="text-sm font-medium text-gray-800">
                            {image.type === 'camera' ? 'カメラ' : 'デスクトップ'}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">{timeString}</span>
                      </div>
                      <div className="rounded-lg h-24 flex items-center justify-center mb-2 overflow-hidden bg-gray-100">
                        <img 
                          src={image.url} 
                          alt={image.type === 'camera' ? 'カメラ画像' : 'スクリーンショット'}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            console.error('画像読み込みエラー:', image.url);
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = '<span class="text-xs text-gray-500">画像読み込みエラー</span>';
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-600">{dateTimeString}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 操作ボタン */}
          <div className="flex justify-end">
            <button 
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              閉じる
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailModal;