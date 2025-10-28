import React, { useState, useEffect } from 'react';
import { getSatelliteHomeSupportUsers, getSatelliteHomeSupportUsersWithDailyRecords } from '../../utils/api';
import { getCurrentUser } from '../../utils/userContext';

const OverviewTab = ({ 
  handleUserInputClick, 
  handleDailySupportRecordClick, 
  handleUserDetailClick 
}) => {
  const [homeSupportUsers, setHomeSupportUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHomeSupportUsers();
  }, []);

  // 拠点変更イベントを監視
  useEffect(() => {
    const handleSatelliteChanged = (event) => {
      console.log('OverviewTab: 拠点変更イベントを受信:', event.detail);
      const newLocation = event.detail.newLocation;
      if (newLocation) {
        console.log('OverviewTab: 新しい拠点でデータを再取得:', newLocation);
        fetchHomeSupportUsers();
      }
    };

    window.addEventListener('satelliteChanged', handleSatelliteChanged);
    
    return () => {
      window.removeEventListener('satelliteChanged', handleSatelliteChanged);
    };
  }, []);

  const fetchHomeSupportUsers = async () => {
    try {
      setLoading(true);
      
      // 認証トークンの確認
      const accessToken = localStorage.getItem('accessToken');
      console.log('OverviewTab: 認証トークン確認:', {
        hasToken: !!accessToken,
        tokenLength: accessToken ? accessToken.length : 0,
        tokenPreview: accessToken ? accessToken.substring(0, 50) + '...' : 'なし'
      });
      
      if (!accessToken) {
        console.error('認証トークンが見つかりません');
        setError('認証トークンが見つかりません。ログインし直してください。');
        return;
      }
      
      // 現在のユーザー情報と拠点情報を取得
      const user = getCurrentUser();
      const selectedSatellite = sessionStorage.getItem('selectedSatellite');
      
      if (!selectedSatellite) {
        console.error('拠点情報が取得できません');
        setError('拠点情報が取得できません');
        return;
      }
      
      const satelliteData = JSON.parse(selectedSatellite);
      console.log('OverviewTab: 拠点情報:', satelliteData);
      
      // 在宅支援利用者データを取得（すべての日次記録情報を含む）
      // dateパラメータを渡さずに全データを取得し、フロントエンドで今日の日付でフィルタリング
      console.log('OverviewTab: DB連携 - API呼び出し開始: satelliteId=', satelliteData.id);
      
      const response = await getSatelliteHomeSupportUsersWithDailyRecords(satelliteData.id, null, null);
      console.log('OverviewTab: DB連携 - APIレスポンス:', response);
      console.log('OverviewTab: DB連携 - 取得データ数:', response?.data?.length || 0);
      
      if (response.success && response.data) {
        // 今日の日付を取得（ローカル時間を使用、YYYY-MM-DD形式）
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const todayDate = `${year}-${month}-${day}`;
        console.log('OverviewTab: 現在時刻:', now.toString());
        console.log('OverviewTab: 今日の日付（フィルタ用）:', todayDate);
        
        // データをユーザーごとにグループ化
        const userMap = new Map();
        
        response.data.forEach(record => {
          const userId = record.id;
          if (!userMap.has(userId)) {
            userMap.set(userId, {
              id: record.id,
              name: record.name,
              instructorName: record.instructor_name || '未設定',
              email: record.login_code || '未設定',
              companyName: record.company_name || '未設定',
              dailyRecords: []
            });
          }
          
          // 日次記録がある場合のみ追加（今日の記録のみ）
          // record_dateから日付部分だけを抽出（YYYY-MM-DD形式）
          const recordDate = record.record_date ? record.record_date.toString().substring(0, 10) : null;
          
          if (record.daily_record_id) {
            console.log('OverviewTab: 日次記録発見 - userId:', userId, ', record_date:', record.record_date, ', recordDate:', recordDate, ', todayDate:', todayDate, ', 一致:', recordDate === todayDate);
          }
          if (record.daily_record_id && recordDate === todayDate) {
            userMap.get(userId).dailyRecords.push({
              id: record.daily_record_id,
              date: record.record_date,
              markStart: record.mark_start,
              markLunchStart: record.mark_lunch_start,
              markLunchEnd: record.mark_lunch_end,
              markEnd: record.mark_end,
              temperature: record.temperature,
              conditionNote: record.condition_note,
              workNote: record.work_note,
              workResult: record.work_result,
              dailyReport: record.daily_report,
              supportMethod: record.support_method,
              supportMethodNote: record.support_method_note,
              taskContent: record.task_content,
              supportContent: record.support_content,
              advice: record.advice,
              instructorComment: record.instructor_comment,
              recorderName: record.recorder_name,
              webcamPhotos: record.webcam_photos,
              screenshots: record.screenshots,
              createdAt: record.record_created_at,
              updatedAt: record.record_updated_at
            });
          }
        });
        
        const formattedUsers = Array.from(userMap.values());
        setHomeSupportUsers(formattedUsers);
        console.log('OverviewTab: 在宅支援利用者データ:', formattedUsers);
      } else {
        console.error('在宅支援利用者データの取得に失敗:', response);
        setError(`データの取得に失敗しました: ${response.message || '不明なエラー'}`);
      }
    } catch (error) {
      console.error('OverviewTab: データ取得エラー:', error);
      
      // 認証エラーの場合の特別な処理
      if (error.message && error.message.includes('認証')) {
        setError('認証に失敗しました。ログインし直してください。');
      } else if (error.message && error.message.includes('トークン')) {
        setError('認証トークンが無効です。ログインし直してください。');
      } else {
        setError(`データの取得中にエラーが発生しました: ${error.message || '不明なエラー'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // 統計データを計算
  const getStatistics = () => {
    const totalUsers = homeSupportUsers.length;
    
    // 完了ユーザー: markEndがある
    const completedUsers = homeSupportUsers.filter(user => {
      const latestRecord = user.dailyRecords?.[0];
      return latestRecord && latestRecord.markEnd;
    }).length;
    
    // 休憩中ユーザー: markLunchStartがあり、markLunchEndがない（最優先）
    const restUsers = homeSupportUsers.filter(user => {
      const latestRecord = user.dailyRecords?.[0];
      return latestRecord && latestRecord.markLunchStart && !latestRecord.markLunchEnd;
    }).length;
    
    // 作業中ユーザー: markStartがあり、markEndがなく、休憩中ではない
    const activeUsers = homeSupportUsers.filter(user => {
      const latestRecord = user.dailyRecords?.[0];
      if (!latestRecord || !latestRecord.markStart || latestRecord.markEnd) {
        return false;
      }
      // 休憩中でないことを確認
      return !latestRecord.markLunchStart || latestRecord.markLunchEnd;
    }).length;
    
    return {
      total: totalUsers,
      active: activeUsers,
      rest: restUsers,
      completed: completedUsers
    };
  };

  const statistics = getStatistics();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="ml-4 text-gray-600">データを読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">エラーが発生しました</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchHomeSupportUsers}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            再試行
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 今日の状況サマリー */}
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">📊 今日の在宅支援状況</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">総利用者数</p>
                <p className="text-2xl font-bold text-blue-800">{statistics.total}名</p>
              </div>
              <span className="text-blue-600 text-2xl">👥</span>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">作業中</p>
                <p className="text-2xl font-bold text-green-800">{statistics.active}名</p>
              </div>
              <span className="text-green-600 text-2xl">✅</span>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-xl border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-600 text-sm font-medium">休憩中</p>
                <p className="text-2xl font-bold text-yellow-800">{statistics.rest}名</p>
              </div>
              <span className="text-yellow-600 text-2xl">⏸️</span>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">完了</p>
                <p className="text-2xl font-bold text-purple-800">{statistics.completed}名</p>
              </div>
              <span className="text-purple-600 text-2xl">🎯</span>
            </div>
          </div>
        </div>
      </div>

      {/* 利用者一覧 */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">👥 在宅支援利用者一覧</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  利用者名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  開始時間
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  休憩開始時間
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  休憩終了時間
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  終了時間
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ステータス
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  指導員コメント
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  本人記録
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {homeSupportUsers.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-8 text-center text-gray-500">
                    在宅支援利用者が登録されていません
                  </td>
                </tr>
              ) : (
                homeSupportUsers.map((user) => {
                  const latestRecord = user.dailyRecords?.[0];
                  const getStatus = () => {
                    if (!latestRecord) return { text: '未開始', color: 'bg-red-100 text-red-800' };
                    if (latestRecord.markEnd) return { text: '完了', color: 'bg-purple-100 text-purple-800' };
                    if (latestRecord.markLunchStart && !latestRecord.markLunchEnd) return { text: '休憩中', color: 'bg-yellow-100 text-yellow-800' };
                    if (latestRecord.markStart && !latestRecord.markEnd) return { text: '作業中', color: 'bg-green-100 text-green-800' };
                    return { text: '未開始', color: 'bg-red-100 text-red-800' };
                  };
                  
                  const status = getStatus();
                  const startTime = latestRecord?.markStart ? 
                    new Date(latestRecord.markStart).toLocaleTimeString('ja-JP', {hour: '2-digit', minute: '2-digit'}) : 
                    '未設定';
                  const breakStartTime = latestRecord?.markLunchStart ? 
                    new Date(latestRecord.markLunchStart).toLocaleTimeString('ja-JP', {hour: '2-digit', minute: '2-digit'}) : 
                    '未設定';
                  const breakEndTime = latestRecord?.markLunchEnd ? 
                    new Date(latestRecord.markLunchEnd).toLocaleTimeString('ja-JP', {hour: '2-digit', minute: '2-digit'}) : 
                    '未設定';
                  const endTime = latestRecord?.markEnd ? 
                    new Date(latestRecord.markEnd).toLocaleTimeString('ja-JP', {hour: '2-digit', minute: '2-digit'}) : 
                    '未設定';
                  
                  return (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-green-800">
                          {startTime}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-yellow-800">
                          {breakStartTime}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-yellow-800">
                          {breakEndTime}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-red-800">
                          {endTime}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${status.color}`}>
                          {status.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {latestRecord?.instructorComment || '指導員コメントなし'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          onClick={() => handleUserInputClick(user)}
                          disabled={status.text === '未開始'}
                          className={`text-sm px-3 py-1 rounded transition-colors duration-200 ${
                            status.text === '未開始'
                              ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                              : 'text-white bg-indigo-600 hover:bg-indigo-700'
                          }`}
                        >
                          📋 本人記録
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleDailySupportRecordClick(user)}
                            disabled={status.text === '未開始'}
                            className={`text-sm px-3 py-1 rounded transition-colors duration-200 ${
                              status.text === '未開始'
                                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                : 'text-white bg-green-600 hover:bg-green-700'
                            }`}
                          >
                            📝 支援記録
                          </button>
                          <button 
                            onClick={() => handleUserDetailClick(user)}
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
  );
};

export default OverviewTab;