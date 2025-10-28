import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInstructorGuard } from '../utils/hooks/useAuthGuard';
import InstructorHeader from '../components/InstructorHeader';
import { apiCall } from '../utils/api';
import { convertTimeToMySQLDateTime } from '../utils/dateUtils';

const HomeSupportRecordsPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useInstructorGuard();
  const [localUser, setLocalUser] = useState(currentUser);
  
  // 日付範囲の初期値（今月の1日から今日まで）
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  
  const [startDate, setStartDate] = useState(firstDayOfMonth.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);
  const [dailyReports, setDailyReports] = useState([]);
  const [weeklyReports, setWeeklyReports] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editingDailyReport, setEditingDailyReport] = useState(null);
  const [editingWeeklyReport, setEditingWeeklyReport] = useState(null);
  const [dailyEditForm, setDailyEditForm] = useState({});
  const [weeklyEditForm, setWeeklyEditForm] = useState({});

  // 拠点情報を復元
  useEffect(() => {
    if (currentUser) {
      const savedSatellite = sessionStorage.getItem('selectedSatellite');
      if (savedSatellite) {
        try {
          const satellite = JSON.parse(savedSatellite);
          setLocalUser({
            ...currentUser,
            satellite_id: satellite.id,
            satellite_name: satellite.name,
            company_id: satellite.company_id,
            company_name: satellite.company_name
          });
        } catch (e) {
          console.error('拠点情報のパースエラー:', e);
          setLocalUser(currentUser);
        }
      } else {
        setLocalUser(currentUser);
      }
    }
  }, [currentUser]);

  // 拠点変更ハンドラー
  const handleLocationChange = (newLocation) => {
    console.log('拠点情報が変更されました:', newLocation);
    
    // 拠点情報をsessionStorageに保存
    sessionStorage.setItem('selectedSatellite', JSON.stringify(newLocation));
    
    // ユーザー情報を更新
    const updatedUser = {
      ...localUser,
      satellite_id: newLocation.id,
      satellite_name: newLocation.name,
      company_id: newLocation.company_id,
      company_name: newLocation.company_name
    };
    
    setLocalUser(updatedUser);
    
    // 拠点切り替えイベントを発火
    window.dispatchEvent(new CustomEvent('satelliteChanged', {
      detail: { satellite: newLocation }
    }));
  };

  // 利用者情報を取得
  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return;
      
      try {
        console.log('利用者情報を取得中: ユーザーID', userId);
        const response = await apiCall(`/api/users/${userId}`, { method: 'GET' });
        console.log('利用者情報取得レスポンス:', response);
        
        if (response.success && response.data) {
          setUser(response.data);
          console.log('利用者情報を設定しました:', response.data);
        } else {
          console.error('利用者情報の取得に失敗しました:', response);
          // エラーメッセージをより詳細に表示
          alert('利用者情報の取得に失敗しました: ' + (response.message || 'エラーが発生しました'));
        }
      } catch (error) {
        console.error('利用者情報取得エラー:', error);
        // エラーのステータスコードに応じて詳細なメッセージを表示
        if (error.status === 403) {
          alert('この利用者情報へのアクセス権限がありません。\n同じ拠点に所属しているか、担当指導員である必要があります。');
        } else if (error.status === 404) {
          alert('利用者が見つかりません。');
        } else {
          alert('利用者情報の取得中にエラーが発生しました: ' + (error.message || '不明なエラー'));
        }
      }
    };

    fetchUser();
  }, [userId]);

  // 記録を検索
  const searchRecords = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      // 日報を取得
      const dailyResponse = await apiCall(
        `/api/remote-support/daily-reports?userId=${userId}&startDate=${startDate}&endDate=${endDate}`,
        { method: 'GET' }
      );
      
      if (dailyResponse.success && dailyResponse.data) {
        setDailyReports(dailyResponse.data.reports || []);
      } else {
        console.error('日報取得エラー:', dailyResponse.message);
        setDailyReports([]);
      }

      // 週次評価を取得（期間を計算）
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      const weeklyResponse = await apiCall(
        `/api/weekly-evaluations/user/${userId}?periodStart=${startDate}&periodEnd=${endDate}`,
        { method: 'GET' }
      );
      
      if (weeklyResponse.success && weeklyResponse.data) {
        setWeeklyReports(weeklyResponse.data || []);
      } else {
        console.error('週次評価取得エラー:', weeklyResponse.message);
        setWeeklyReports([]);
      }
    } catch (error) {
      console.error('記録取得エラー:', error);
      alert('記録の取得に失敗しました: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId && startDate && endDate) {
      searchRecords();
    }
  }, [userId, startDate, endDate]);

  // 日報の編集を開始
  const startEditDailyReport = (report) => {
    setEditingDailyReport(report.id);
    
    // 時間フィールドをHH:MM形式に変換
    const formatTimeForInput = (datetime) => {
      if (!datetime) return '';
      const date = new Date(datetime);
      return date.toTimeString().slice(0, 5);
    };

    setDailyEditForm({
      temperature: report.temperature || '',
      condition: report.condition || '',
      condition_note: report.condition_note || '',
      work_note: report.work_note || '',
      work_result: report.work_result || '',
      daily_report: report.daily_report || '',
      support_method: report.support_method || '',
      support_method_note: report.support_method_note || '',
      task_content: report.task_content || '',
      support_content: report.support_content || '',
      advice: report.advice || '',
      instructor_comment: report.instructor_comment || '',
      recorder_name: report.recorder_name || '',
      mark_start: formatTimeForInput(report.mark_start),
      mark_lunch_start: formatTimeForInput(report.mark_lunch_start),
      mark_lunch_end: formatTimeForInput(report.mark_lunch_end),
      mark_end: formatTimeForInput(report.mark_end)
    });
  };

  // 週報の編集を開始
  const startEditWeeklyReport = (report) => {
    setEditingWeeklyReport(report.id);
    setWeeklyEditForm({
      date: report.date || '',
      prev_eval_date: report.prev_eval_date || '',
      period_start: report.period_start || '',
      period_end: report.period_end || '',
      evaluation_method: report.evaluation_method || '通所',
      method_other: report.method_other || '',
      evaluation_content: report.evaluation_content || '',
      recorder_name: report.recorder_name || '',
      confirm_name: report.confirm_name || ''
    });
  };

  // 日報を保存
  const saveDailyReport = async (reportId) => {
    try {
      const normalizedForm = { ...dailyEditForm };
      
      // 時間フィールドをMySQL形式に変換
      if (normalizedForm.mark_start && normalizedForm.mark_start.trim() !== '') {
        normalizedForm.mark_start = convertTimeToMySQLDateTime(normalizedForm.mark_start);
      } else {
        normalizedForm.mark_start = null;
      }
      
      if (normalizedForm.mark_lunch_start && normalizedForm.mark_lunch_start.trim() !== '') {
        normalizedForm.mark_lunch_start = convertTimeToMySQLDateTime(normalizedForm.mark_lunch_start);
      } else {
        normalizedForm.mark_lunch_start = null;
      }
      
      if (normalizedForm.mark_lunch_end && normalizedForm.mark_lunch_end.trim() !== '') {
        normalizedForm.mark_lunch_end = convertTimeToMySQLDateTime(normalizedForm.mark_lunch_end);
      } else {
        normalizedForm.mark_lunch_end = null;
      }
      
      if (normalizedForm.mark_end && normalizedForm.mark_end.trim() !== '') {
        normalizedForm.mark_end = convertTimeToMySQLDateTime(normalizedForm.mark_end);
      } else {
        normalizedForm.mark_end = null;
      }

      const response = await apiCall(`/api/remote-support/daily-reports/${reportId}`, {
        method: 'PUT',
        body: JSON.stringify(normalizedForm)
      });

      if (response.success) {
        alert('日報を更新しました。');
        setEditingDailyReport(null);
        searchRecords(); // 再読み込み
      } else {
        alert('更新に失敗しました: ' + (response.message || 'エラーが発生しました'));
      }
    } catch (error) {
      console.error('日報更新エラー:', error);
      alert('更新中にエラーが発生しました: ' + error.message);
    }
  };

  // 週報を保存
  const saveWeeklyReport = async (reportId) => {
    try {
      const backendData = {
        date: weeklyEditForm.date,
        prev_eval_date: weeklyEditForm.prev_eval_date || null,
        period_start: weeklyEditForm.period_start || null,
        period_end: weeklyEditForm.period_end || null,
        evaluation_method: weeklyEditForm.evaluation_method === 'その他' ? 'その他' : weeklyEditForm.evaluation_method,
        method_other: weeklyEditForm.evaluation_method === 'その他' ? weeklyEditForm.method_other : null,
        evaluation_content: weeklyEditForm.evaluation_content,
        recorder_name: weeklyEditForm.recorder_name,
        confirm_name: weeklyEditForm.confirm_name || null
      };

      const response = await apiCall(`/api/weekly-evaluations/${reportId}`, {
        method: 'PUT',
        body: JSON.stringify(backendData)
      });

      if (response.success) {
        alert('週次評価を更新しました。');
        setEditingWeeklyReport(null);
        searchRecords(); // 再読み込み
      } else {
        alert('更新に失敗しました: ' + (response.message || 'エラーが発生しました'));
      }
    } catch (error) {
      console.error('週次評価更新エラー:', error);
      alert('更新中にエラーが発生しました: ' + error.message);
    }
  };

  // 編集をキャンセル
  const cancelEdit = () => {
    setEditingDailyReport(null);
    setEditingWeeklyReport(null);
    setDailyEditForm({});
    setWeeklyEditForm({});
  };

  // 印刷処理
  const handlePrint = () => {
    window.print();
  };

  if (!user && !loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-xl text-gray-600">利用者が見つかりません</p>
          <button
            onClick={() => navigate('/instructor/home-support')}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            在宅支援ダッシュボードに戻る
          </button>
        </div>
      </div>
    );
  }

  // 記録を日付順にソート（日報と週報を統合）
  const allRecords = [
    ...dailyReports.map(r => ({ ...r, type: 'daily', sortDate: new Date(r.date) })),
    ...weeklyReports.map(r => ({ ...r, type: 'weekly', sortDate: new Date(r.period_end || r.date) }))
  ].sort((a, b) => b.sortDate - a.sortDate);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* 印刷時は非表示 */}
      <div className="print:hidden">
        <InstructorHeader 
          user={localUser || currentUser} 
          onLocationChange={handleLocationChange}
          showBackButton={true}
          backButtonText="評価記録に戻る"
          onBackClick={() => {
            // 戻る前に現在の拠点情報を保存
            if (localUser) {
              const currentLocation = {
                id: localUser.satellite_id,
                name: localUser.satellite_name,
                company_id: localUser.company_id,
                company_name: localUser.company_name
              };
              sessionStorage.setItem('selectedSatellite', JSON.stringify(currentLocation));
            }
            navigate('/instructor/home-support?tab=evaluations');
          }}
        />
      </div>

      <div className="flex-1 p-8">
        {/* 検索・印刷エリア（印刷時は非表示） */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 print:hidden">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">🔍 在宅支援記録確認</h1>
            <p className="text-lg text-gray-600">日次支援記録と週次評価を統合して確認・編集できます</p>
          </div>

          {/* 利用者情報 */}
          {user && (
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 mb-6 border border-indigo-200">
              <div className="flex items-center gap-4">
                <div className="bg-white rounded-full w-12 h-12 flex items-center justify-center shadow-md">
                  <span className="text-2xl">👤</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
                  <p className="text-sm text-gray-600">
                    受給者証番号: {user.recipient_number || ''}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 日付範囲選択 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">開始日</label>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">終了日</label>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex items-end gap-2">
              <button 
                onClick={searchRecords}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? '検索中...' : '🔍 検索'}
              </button>
              <button 
                onClick={handlePrint}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                🖨️ 印刷
              </button>
            </div>
          </div>

          {/* クイック日付選択 */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                const today = new Date();
                const weekAgo = new Date(today);
                weekAgo.setDate(weekAgo.getDate() - 7);
                setStartDate(weekAgo.toISOString().split('T')[0]);
                setEndDate(today.toISOString().split('T')[0]);
              }}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              過去1週間
            </button>
            <button
              onClick={() => {
                const today = new Date();
                const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                setStartDate(firstDay.toISOString().split('T')[0]);
                setEndDate(today.toISOString().split('T')[0]);
              }}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              今月
            </button>
            <button
              onClick={() => {
                const today = new Date();
                const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
                setStartDate(lastMonthStart.toISOString().split('T')[0]);
                setEndDate(lastMonthEnd.toISOString().split('T')[0]);
              }}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              先月
            </button>
          </div>
        </div>

        {/* 印刷用ヘッダー（画面上は非表示） */}
        {user && (
          <div className="hidden print:block mb-6">
            <div className="text-center mb-4">
              <h1 className="text-2xl font-bold text-gray-800">在宅における就労支援記録</h1>
              <p className="text-sm text-gray-600 mt-2">
                期間: {new Date(startDate).toLocaleDateString('ja-JP')} ～ {new Date(endDate).toLocaleDateString('ja-JP')}
              </p>
            </div>
            <div className="border-2 border-gray-800 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-semibold">利用者名:</span> {user.name}
                </div>
                <div>
                  <span className="font-semibold">受給者証番号:</span> {user.recipient_number || ''}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 記録一覧 */}
        <div className="bg-white rounded-2xl shadow-xl p-6 print:shadow-none print:rounded-none">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-indigo-600"></div>
              <p className="mt-4 text-gray-600">記録を読み込んでいます...</p>
            </div>
          ) : allRecords.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-gray-600">記録が見つかりません</p>
              <p className="text-sm text-gray-500 mt-2">期間を変更して再度検索してください</p>
            </div>
          ) : (
            <div className="space-y-6">
              {allRecords.map((record) => (
                <div 
                  key={`${record.type}-${record.id}`} 
                  className="border-2 border-gray-300 rounded-lg p-6 print:break-inside-avoid print:page-break-inside-avoid"
                >
                  {record.type === 'daily' ? (
                    // 日次支援記録
                    <div>
                      <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-gray-300">
                        <div className="flex items-center gap-3">
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                            📝 日次支援記録
                          </span>
                          <span className="text-lg font-bold text-gray-800">
                            {new Date(record.date).toLocaleDateString('ja-JP', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              weekday: 'short'
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">記録者: {record.recorder_name || '-'}</span>
                          {editingDailyReport === record.id ? (
                            <>
                              <button
                                onClick={() => saveDailyReport(record.id)}
                                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                              >
                                保存
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="px-3 py-1 bg-gray-400 text-white rounded text-sm hover:bg-gray-500"
                              >
                                キャンセル
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => startEditDailyReport(record)}
                              className="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 print:hidden"
                            >
                              編集
                            </button>
                          )}
                        </div>
                      </div>

                      {editingDailyReport === record.id ? (
                        // 編集モード
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">開始時間</label>
                              <input
                                type="time"
                                value={dailyEditForm.mark_start || ''}
                                onChange={(e) => setDailyEditForm({ ...dailyEditForm, mark_start: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">終了時間</label>
                              <input
                                type="time"
                                value={dailyEditForm.mark_end || ''}
                                onChange={(e) => setDailyEditForm({ ...dailyEditForm, mark_end: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">支援方法</label>
                            <select
                              value={dailyEditForm.support_method || ''}
                              onChange={(e) => setDailyEditForm({ ...dailyEditForm, support_method: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            >
                              <option value="">選択してください</option>
                              <option value="電話">電話</option>
                              <option value="オンライン">オンライン</option>
                              <option value="訪問">訪問</option>
                              <option value="メール">メール</option>
                              <option value="その他">その他</option>
                            </select>
                            {dailyEditForm.support_method === 'その他' && (
                              <input
                                type="text"
                                value={dailyEditForm.support_method_note || ''}
                                onChange={(e) => setDailyEditForm({ ...dailyEditForm, support_method_note: e.target.value })}
                                placeholder="支援方法を入力"
                                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg"
                              />
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">作業内容</label>
                            <textarea
                              value={dailyEditForm.task_content || ''}
                              onChange={(e) => setDailyEditForm({ ...dailyEditForm, task_content: e.target.value })}
                              rows="4"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">支援内容</label>
                            <textarea
                              value={dailyEditForm.support_content || ''}
                              onChange={(e) => setDailyEditForm({ ...dailyEditForm, support_content: e.target.value })}
                              rows="6"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">健康状態・助言</label>
                            <textarea
                              value={dailyEditForm.advice || ''}
                              onChange={(e) => setDailyEditForm({ ...dailyEditForm, advice: e.target.value })}
                              rows="4"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">記録者</label>
                            <input
                              type="text"
                              value={dailyEditForm.recorder_name || ''}
                              onChange={(e) => setDailyEditForm({ ...dailyEditForm, recorder_name: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                              placeholder="記録者名を入力"
                            />
                          </div>
                        </div>
                      ) : (
                        // 表示モード
                        <>
                          {/* 基本情報 */}
                          <div className="mb-4 bg-blue-50 rounded-lg p-3 border border-blue-200">
                            <div className="grid grid-cols-3 gap-3 text-sm">
                              <div>
                                <span className="text-gray-600">実施時間:</span>
                                <span className="ml-2 font-semibold text-gray-800">
                                  {record.mark_start 
                                    ? `${new Date(record.mark_start).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })} 〜 ${record.mark_end ? new Date(record.mark_end).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }) : '-'}`
                                    : '-'
                                  }
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">支援方法:</span>
                                <span className="ml-2 font-semibold text-gray-800">
                                  {record.support_method || '-'}
                                  {record.support_method === 'その他' && record.support_method_note && ` (${record.support_method_note})`}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">対応者:</span>
                                <span className="ml-2 font-semibold text-gray-800">{record.recorder_name || '-'}</span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">作業・訓練内容</span>
                              </h4>
                              <div className="bg-gray-50 rounded-lg p-3 whitespace-pre-wrap text-sm text-gray-700">
                                {record.task_content || '-'}
                              </div>
                            </div>

                            <div>
                              <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">支援内容（1日2回以上）</span>
                              </h4>
                              <div className="bg-gray-50 rounded-lg p-3 whitespace-pre-wrap text-sm text-gray-700">
                                {record.support_content || '-'}
                              </div>
                            </div>

                            <div>
                              <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm">対象者の心身の状況及びそれに対する助言の内容</span>
                              </h4>
                              <div className="bg-gray-50 rounded-lg p-3 whitespace-pre-wrap text-sm text-gray-700">
                                {record.advice || '-'}
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    // 週次評価
                    <div>
                      <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-gray-300">
                        <div className="flex items-center gap-3">
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                            📊 週次評価
                          </span>
                          <span className="text-lg font-bold text-gray-800">
                            {record.period_start && record.period_end
                              ? `${new Date(record.period_start).toLocaleDateString('ja-JP')} 〜 ${new Date(record.period_end).toLocaleDateString('ja-JP')}`
                              : new Date(record.date).toLocaleDateString('ja-JP')
                            }
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">記録者: {record.recorder_name || '-'}</span>
                          {editingWeeklyReport === record.id ? (
                            <>
                              <button
                                onClick={() => saveWeeklyReport(record.id)}
                                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                              >
                                保存
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="px-3 py-1 bg-gray-400 text-white rounded text-sm hover:bg-gray-500"
                              >
                                キャンセル
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => startEditWeeklyReport(record)}
                              className="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 print:hidden"
                            >
                              編集
                            </button>
                          )}
                        </div>
                      </div>

                      {editingWeeklyReport === record.id ? (
                        // 編集モード
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">評価日</label>
                              <input
                                type="date"
                                value={weeklyEditForm.date || ''}
                                onChange={(e) => setWeeklyEditForm({ ...weeklyEditForm, date: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">期間（開始）</label>
                              <input
                                type="date"
                                value={weeklyEditForm.period_start || ''}
                                onChange={(e) => setWeeklyEditForm({ ...weeklyEditForm, period_start: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">期間（終了）</label>
                              <input
                                type="date"
                                value={weeklyEditForm.period_end || ''}
                                onChange={(e) => setWeeklyEditForm({ ...weeklyEditForm, period_end: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">評価方法</label>
                              <select
                                value={weeklyEditForm.evaluation_method || '通所'}
                                onChange={(e) => setWeeklyEditForm({ ...weeklyEditForm, evaluation_method: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                              >
                                <option value="通所">通所</option>
                                <option value="電話">電話</option>
                                <option value="オンライン">オンライン</option>
                                <option value="訪問">訪問</option>
                                <option value="その他">その他</option>
                              </select>
                              {weeklyEditForm.evaluation_method === 'その他' && (
                                <input
                                  type="text"
                                  value={weeklyEditForm.method_other || ''}
                                  onChange={(e) => setWeeklyEditForm({ ...weeklyEditForm, method_other: e.target.value })}
                                  placeholder="評価方法を入力"
                                  className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg"
                                />
                              )}
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">評価内容</label>
                            <textarea
                              value={weeklyEditForm.evaluation_content || ''}
                              onChange={(e) => setWeeklyEditForm({ ...weeklyEditForm, evaluation_content: e.target.value })}
                              rows="8"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">記録者</label>
                              <input
                                type="text"
                                value={weeklyEditForm.recorder_name || ''}
                                onChange={(e) => setWeeklyEditForm({ ...weeklyEditForm, recorder_name: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">確認者</label>
                              <input
                                type="text"
                                value={weeklyEditForm.confirm_name || ''}
                                onChange={(e) => setWeeklyEditForm({ ...weeklyEditForm, confirm_name: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        // 表示モード
                        <>
                          {/* 基本情報 */}
                          <div className="mb-4 bg-blue-50 rounded-lg p-3 border border-blue-200">
                            <div className="grid grid-cols-3 gap-3 text-sm">
                              <div>
                                <span className="text-gray-600">実施方法:</span>
                                <span className="ml-2 font-semibold text-gray-800">
                                  {record.evaluation_method || '-'}
                                  {record.evaluation_method === 'その他' && record.method_other && ` (${record.method_other})`}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">記録者:</span>
                                <span className="ml-2 font-semibold text-gray-800">{record.recorder_name || '-'}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">確認者:</span>
                                <span className="ml-2 font-semibold text-gray-800">{record.confirm_name || '-'}</span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">評価内容</span>
                              </h4>
                              <div className="bg-gray-50 rounded-lg p-3 whitespace-pre-wrap text-sm text-gray-700">
                                {record.evaluation_content || '-'}
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 印刷時のフッター */}
        <div className="hidden print:block mt-6 text-center text-sm text-gray-600">
          <p>発行日: {new Date().toLocaleDateString('ja-JP')}</p>
        </div>
      </div>
    </div>
  );
};

export default HomeSupportRecordsPage;
