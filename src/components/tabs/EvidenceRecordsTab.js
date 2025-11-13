import React, { useState, useEffect, useRef } from 'react';
import { getCaptureRecords, getSatelliteHomeSupportUsers } from '../../utils/api';
import { getCurrentUser } from '../../utils/userContext';

const EvidenceRecordsTab = ({ 
  handleUserInputClick, 
  handleUserDetailClick 
}) => {
  // 初期値としてsessionStorageから拠点IDを取得
  const getInitialSatelliteId = () => {
    const selectedSatellite = sessionStorage.getItem('selectedSatellite');
    if (selectedSatellite) {
      try {
        const satelliteData = JSON.parse(selectedSatellite);
        return satelliteData.id;
      } catch (error) {
        console.error('初期化時の拠点情報のパースエラー:', error);
      }
    }
    // フォールバック: getCurrentUserから取得
    const currentUser = getCurrentUser();
    return currentUser?.satellite_id || currentUser?.location?.id || null;
  };

  const [records, setRecords] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [userDailyReports, setUserDailyReports] = useState({});
  const initialSatelliteId = getInitialSatelliteId();
  const [currentSatelliteId, setCurrentSatelliteId] = useState(initialSatelliteId);
  const previousSatelliteIdRef = useRef(initialSatelliteId);

  // 現在の拠点IDを監視
  useEffect(() => {
    const updateSatelliteId = () => {
      // sessionStorageから拠点情報を取得（拠点切り替え時に更新される）
      const selectedSatellite = sessionStorage.getItem('selectedSatellite');
      let newSatelliteId = null;
      
      if (selectedSatellite) {
        try {
          const satelliteData = JSON.parse(selectedSatellite);
          newSatelliteId = satelliteData.id;
        } catch (error) {
          console.error('EvidenceRecordsTab: 拠点情報のパースエラー:', error);
          // フォールバック: getCurrentUserから取得
          const currentUser = getCurrentUser();
          newSatelliteId = currentUser?.satellite_id || currentUser?.location?.id;
        }
      } else {
        // sessionStorageにない場合はgetCurrentUserから取得
        const currentUser = getCurrentUser();
        newSatelliteId = currentUser?.satellite_id || currentUser?.location?.id;
      }
      
      // 値が変更された場合のみ状態を更新
      if (newSatelliteId !== previousSatelliteIdRef.current) {
        console.log('EvidenceRecordsTab: 拠点IDが変更されました:', previousSatelliteIdRef.current, '->', newSatelliteId);
        previousSatelliteIdRef.current = newSatelliteId;
        setCurrentSatelliteId(newSatelliteId);
      }
    };
    
    // 初期化
    updateSatelliteId();
    
    // 定期的に拠点IDをチェック（2秒ごと）
    const intervalId = setInterval(() => {
      updateSatelliteId();
    }, 2000);
    
    // フォーカス時に再チェック
    const handleFocus = () => {
      updateSatelliteId();
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
    };
  }, []); // 依存配列を空に

  // 利用者一覧を取得
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        if (!currentSatelliteId) {
          return;
        }
        
        const response = await getSatelliteHomeSupportUsers(currentSatelliteId);
        if (response.success && response.data) {
          setUsers(response.data);
        }
      } catch (err) {
        console.error('利用者一覧の取得エラー:', err);
      }
    };

    fetchUsers();
  }, [currentSatelliteId]); // 拠点IDが変更されたら再取得

  // 記録データを取得
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        setLoading(true);
        
        // currentSatelliteIdがnullの場合はスキップ
        if (!currentSatelliteId) {
          console.log('EvidenceRecordsTab: 拠点IDが設定されていないため、記録を取得しません');
          setLoading(false);
          return;
        }
        
        console.log('EvidenceRecordsTab: 記録を取得します - satelliteId:', currentSatelliteId);
        const response = await getCaptureRecords(selectedUserId || null, startDate || null, endDate || null, currentSatelliteId || null);
        
        if (response.success && response.data) {
          setRecords(response.data.records || []);
          
          // 各ユーザーの日報データを取得して状況を判定
          const reports = {};
          for (const record of response.data.records || []) {
            if (!reports[record.user.id]) {
              try {
                const API_BASE_URL = process.env.REACT_APP_API_URL || 
                  (window.location.hostname === 'studysphere.ayatori-inc.co.jp' 
                    ? 'https://backend.studysphere.ayatori-inc.co.jp' 
                    : 'http://localhost:5050');
                
                // ユーザーIDと日付で日報をフィルタリング
                const reportResponse = await fetch(`${API_BASE_URL}/api/remote-support/daily-reports?userId=${record.user.id}&startDate=${record.date}&endDate=${record.date}`, {
                  headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                    'Content-Type': 'application/json'
                  }
                });
                
                if (reportResponse.ok) {
                  const reportData = await reportResponse.json();
                  if (reportData.success && reportData.data && reportData.data.reports && reportData.data.reports.length > 0) {
                    // 日報配列から最初のものを取得
                    reports[record.user.id] = reportData.data.reports[0];
                  }
                }
              } catch (err) {
                console.error('日報データの取得エラー:', err);
              }
            }
          }
          setUserDailyReports(reports);
        } else {
          throw new Error(response.message || '記録データの取得に失敗しました');
        }
      } catch (err) {
        console.error('記録データの取得エラー:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [selectedUserId, startDate, endDate, currentSatelliteId]);


  // 状況を判定する関数
  const getStatusText = (record) => {
    const report = userDailyReports[record.user.id];
    
    if (!report) {
      return '始業打刻されていません';
    }
    
    // 日報の状態を確認
    const hasMarkStart = report.mark_start;
    const hasMarkEnd = report.mark_end;
    const hasMarkBreakStart = report.mark_break_start;
    const hasMarkBreakEnd = report.mark_break_end;
    
    // 状態の判定
    if (!hasMarkStart) {
      return '始業打刻されていません';
    } else if (hasMarkEnd) {
      return '業務終了しました';
    } else if (hasMarkBreakStart && !hasMarkBreakEnd) {
      return '休憩中です';
    } else {
      return '作業中です';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">📷 記録・証拠</h2>
          <p className="text-lg text-gray-600">デスクトップ画面とカメラで学習状況を記録・管理</p>
        </div>

        {/* 検索・フィルター機能 */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">利用者</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
              >
                <option value="">すべて</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">開始日</label>
              <input 
                type="date" 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">終了日</label>
              <input 
                type="date" 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="終了日（空欄可）"
              />
            </div>
          </div>
        </div>

        {/* 記録一覧 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">記録一覧</h3>
          
          {/* 記録リストテーブル */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    日時
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    利用者
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    サムネイル
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状況
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        <span className="ml-3">記録データを読み込み中...</span>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-red-500">
                      <div className="flex flex-col items-center">
                        <span className="text-xl mb-2">⚠️</span>
                        <span>{error}</span>
                      </div>
                    </td>
                  </tr>
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      記録がありません
                    </td>
                  </tr>
                ) : (
                  records.map((record, index) => {
                    const date = new Date(record.date);
                    const time = record.thumbnail ? new Date(record.thumbnail.lastModified) : date;
                    const thumbnailType = record.thumbnail?.type === 'camera' ? '📷' : '🖥️';
                    const statusText = getStatusText(record);
                    
                    // サムネイルを取得（複数対応）
                    const thumbnails = record.thumbnails || (record.thumbnail ? [record.thumbnail] : []);
                    
                    return (
                      <tr key={`${record.user.id}-${record.date}`} className={`hover:bg-gray-50 ${index % 2 === 1 ? 'bg-gray-50' : ''}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {date.toLocaleDateString('ja-JP')}
                          </div>
                          <div className="text-sm text-gray-500">
                            {time.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{record.user.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {thumbnails.length > 0 ? (
                            <div className="flex gap-1">
                              {thumbnails.map((thumb, idx) => {
                                // 撮影時刻を日本時間でフォーマット
                                const captureTime = new Date(thumb.lastModified);
                                const timeString = captureTime.toLocaleString('ja-JP', {
                                  year: 'numeric',
                                  month: '2-digit',
                                  day: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  timeZone: 'Asia/Tokyo'
                                });
                                
                                return (
                                  <img 
                                    key={idx}
                                    src={thumb.url} 
                                    alt={`撮影時刻: ${timeString}`}
                                    className="w-16 h-12 object-cover rounded-lg cursor-pointer hover:opacity-80"
                                    onClick={() => window.open(thumb.url, '_blank')}
                                    onError={(e) => {
                                      console.error('画像読み込みエラー:', thumb.url);
                                      e.target.style.display = 'none';
                                    }}
                                  />
                                );
                              })}
                            </div>
                          ) : (
                            <div className="w-16 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                              <span className="text-xs text-gray-500">{thumbnailType}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {statusText === '始業打刻されていません' && (
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600">
                                {statusText}
                              </span>
                            )}
                            {statusText === '作業中です' && (
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                {statusText}
                              </span>
                            )}
                            {statusText === '休憩中です' && (
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                {statusText}
                              </span>
                            )}
                            {statusText === '業務終了しました' && (
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                {statusText}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleUserInputClick({
                                id: record.user.id,
                                name: record.user.name,
                                recipientNumber: record.user.login_code,
                                status: statusText,
                                startTime: time.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
                                date: record.date
                              })}
                              className="text-white text-sm px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200"
                            >
                              📋 本人記録
                            </button>
                            <button 
                              onClick={() => handleUserDetailClick({
                                id: record.user.id,
                                name: record.user.name,
                                certificate: record.user.login_code,
                                status: statusText,
                                startTime: time.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
                                date: record.date
                              })}
                              className="text-white text-sm px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                            >
                              詳細
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvidenceRecordsTab;

