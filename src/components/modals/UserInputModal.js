import React, { useState, useEffect } from 'react';
import { getUserHealthData, getUserWorkPlan, addInstructorComment, updateUserDailyReport } from '../../utils/userInputApi';
import { getSatelliteInstructors } from '../../utils/api';
import { getCurrentUser } from '../../utils/userContext';

const UserInputModal = ({ isOpen, onClose, selectedUser }) => {
  const [healthData, setHealthData] = useState(null);
  const [workPlan, setWorkPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [comment, setComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [instructors, setInstructors] = useState([]);
  const [workNote, setWorkNote] = useState('');
  const [aiSuggesting, setAiSuggesting] = useState(false);
  const [supportPlan, setSupportPlan] = useState(null);
  
  // 編集用の状態
  const [editData, setEditData] = useState({
    temperature: '',
    condition: '普通',
    condition_note: '',
    work_note: '',
    work_result: '',
    task_content: '',
    daily_report: '',
    mark_start: '',
    mark_end: '',
    mark_lunch_start: '',
    mark_lunch_end: '',
    recorder_name: ''
  });

  // 更新時間をHH:MM形式にフォーマットする関数
  const formatTime = (dateString) => {
    if (!dateString) return '未記録';
    try {
      const date = new Date(dateString);
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    } catch (error) {
      console.error('時間フォーマットエラー:', error);
      return 'エラー';
    }
  };

  useEffect(() => {
    if (isOpen && selectedUser) {
      fetchUserData();
      fetchInstructors();
      fetchSupportPlan();
    }
  }, [isOpen, selectedUser]);

  const fetchSupportPlan = async () => {
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 
        (window.location.hostname === 'studysphere.ayatori-inc.co.jp' 
          ? 'https://backend.studysphere.ayatori-inc.co.jp' 
          : 'http://localhost:5050');
      
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE_URL}/api/support-plans/user/${selectedUser.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setSupportPlan(data.data);
        }
      }
    } catch (error) {
      console.error('個別計画書取得エラー:', error);
    }
  };

  const fetchInstructors = async () => {
    try {
      const currentUser = getCurrentUser();
      const satelliteId = currentUser?.satellite_id || currentUser?.location?.id;
      
      if (satelliteId) {
        const response = await getSatelliteInstructors(satelliteId);
        if (response.success && response.data) {
          setInstructors(response.data);
        }
      }
    } catch (error) {
      console.error('指導員リスト取得エラー:', error);
    }
  };

  const fetchUserData = async () => {
    if (!selectedUser) return;

    setLoading(true);
    setError(null);

    try {
      // 認証トークンの確認
      const accessToken = localStorage.getItem('accessToken');
      console.log('UserInputModal: 認証トークン確認:', {
        hasToken: !!accessToken,
        tokenLength: accessToken ? accessToken.length : 0,
        tokenPreview: accessToken ? accessToken.substring(0, 50) + '...' : 'なし'
      });
      
      if (!accessToken) {
        console.error('認証トークンが見つかりません');
        setError('認証トークンが見つかりません。ログインし直してください。');
        return;
      }

      // selectedUser.dateがあればそれを使用、なければ今日の日付を使用
      const targetDate = selectedUser.date || new Date().toISOString().split('T')[0];
      console.log('UserInputModal: 対象日付:', targetDate, 'selectedUser.date:', selectedUser.date);
      
      // 体調管理データと作業予定データを並行取得
      const [healthResult, workResult] = await Promise.all([
        getUserHealthData(selectedUser.id, targetDate),
        getUserWorkPlan(selectedUser.id, targetDate)
      ]);

      if (healthResult.success) {
        setHealthData(healthResult.data);
        // 編集用データを初期化
        if (healthResult.data) {
          setEditData(prev => ({
            ...prev,
            temperature: healthResult.data.temperature || '',
            condition: healthResult.data.condition || '普通',
            condition_note: healthResult.data.condition_note || '',
            mark_start: healthResult.data.mark_start || '',
            mark_end: healthResult.data.mark_end || '',
            mark_lunch_start: healthResult.data.mark_lunch_start || '',
            mark_lunch_end: healthResult.data.mark_lunch_end || ''
          }));
        }
      } else {
        console.error('体調管理データ取得エラー:', healthResult.message);
        setError(`体調管理データの取得に失敗しました: ${healthResult.message}`);
      }

      if (workResult.success) {
        setWorkPlan(workResult.data);
        // 編集用データを初期化
        if (workResult.data) {
          setEditData(prev => ({
            ...prev,
            work_note: workResult.data.work_note || '',
            work_result: workResult.data.work_result || '',
            task_content: workResult.data.task_content || '',
            daily_report: workResult.data.daily_report || '',
            recorder_name: workResult.data.recorder_name || '',
            // workPlanから昼休憩時間も取得
            mark_start: workResult.data.mark_start || prev.mark_start || '',
            mark_end: workResult.data.mark_end || prev.mark_end || '',
            mark_lunch_start: workResult.data.mark_lunch_start || prev.mark_lunch_start || '',
            mark_lunch_end: workResult.data.mark_lunch_end || prev.mark_lunch_end || ''
          }));
          // work_noteを初期化（AI提案で使用）
          setWorkNote(workResult.data.work_note || '');
        }
      } else {
        console.error('作業予定データ取得エラー:', workResult.message);
        setError(`作業予定データの取得に失敗しました: ${workResult.message}`);
      }
    } catch (error) {
      console.error('データ取得エラー:', error);
      
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

  const handleAddComment = async () => {
    if (!comment.trim()) {
      alert('コメントを入力してください');
      return;
    }

    setSubmittingComment(true);
    try {
      // 体調データまたは作業予定データから日次記録IDを取得
      let reportId = null;
      
      if (healthData && healthData.id) {
        reportId = healthData.id;
      } else if (workPlan && workPlan.id) {
        reportId = workPlan.id;
      }
      
      if (!reportId) {
        alert('日次記録が見つかりません。データを再読み込みしてください。');
        return;
      }
      
      console.log('指導員コメント追加:', {
        reportId,
        comment,
        selectedUser: selectedUser?.id
      });
      
      const result = await addInstructorComment(reportId, comment);
      
      if (result.success) {
        alert('指導員コメントを追加しました');
        setComment('');
        // データを再読み込み
        fetchUserData();
      } else {
        alert(`コメント追加に失敗しました: ${result.message}`);
      }
    } catch (error) {
      console.error('コメント追加エラー:', error);
      alert('コメントの追加中にエラーが発生しました');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleAISuggest = async () => {
    if (!workNote || workNote.trim() === '') {
      alert('作業記録がありません。AI提案を生成できません。');
      return;
    }

    setAiSuggesting(true);
    try {
      // OpenAI APIを呼び出し
      const token = localStorage.getItem('accessToken');
      const API_BASE_URL = process.env.REACT_APP_API_URL || 
        (window.location.hostname === 'studysphere.ayatori-inc.co.jp' 
          ? 'https://backend.studysphere.ayatori-inc.co.jp' 
          : 'http://localhost:5050');

      const response = await fetch(`${API_BASE_URL}/api/ai/suggest-work-content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          work_note: workNote
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.suggestion) {
        setEditData(prev => ({
          ...prev,
          work_result: data.suggestion
        }));
        
        console.log('AI提案生成完了:', {
          suggestionLength: data.suggestion.length,
          usage: data.usage
        });
        
        alert('AI提案を生成しました。内容を確認してください。');
      } else {
        throw new Error(data.message || 'AI提案の生成に失敗しました');
      }
    } catch (error) {
      console.error('AI提案エラー:', error);
      alert(`AI提案の生成中にエラーが発生しました: ${error.message}`);
    } finally {
      setAiSuggesting(false);
    }
  };


  const handleSave = async () => {
    setSaving(true);
    try {
      // 日次記録IDを取得
      let reportId = null;
      
      if (healthData && healthData.id) {
        reportId = healthData.id;
      } else if (workPlan && workPlan.id) {
        reportId = workPlan.id;
      }
      
      if (!reportId) {
        alert('日次記録が見つかりません。データを再読み込みしてください。');
        return;
      }
      
      console.log('在宅就労支援記録保存:', {
        reportId,
        editData,
        selectedUser: selectedUser?.id
      });
      
      const result = await updateUserDailyReport(reportId, editData);
      
      if (result.success) {
        alert('在宅就労支援記録を保存しました');
        setIsEditing(false);
        // データを再読み込み
        fetchUserData();
      } else {
        alert(`保存に失敗しました: ${result.message}`);
      }
    } catch (error) {
      console.error('保存エラー:', error);
      alert('保存中にエラーが発生しました');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !selectedUser) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-2">📋 在宅における就労支援記録</h2>
              <div className="text-indigo-100 text-sm space-y-1">
                <p>対象者名: <span className="font-semibold text-white">{selectedUser?.name || '未設定'}</span></p>
                <p>受給者証番号: <span className="font-semibold text-white">{selectedUser?.recipientNumber || '未設定'}</span></p>
                <p>記録日: <span className="font-semibold text-white">{selectedUser?.date ? new Date(selectedUser.date).toLocaleDateString('ja-JP') : new Date().toLocaleDateString('ja-JP')}</span></p>
              </div>
            </div>
            {!isEditing && !loading && !error && (healthData || workPlan) && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-white text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition-all duration-200"
              >
                ✏️ 編集
              </button>
            )}
          </div>
        </div>

        {/* コンテンツ */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <span className="ml-2 text-gray-600">データを読み込み中...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <p className="text-lg font-medium text-red-600 mb-2">データの取得に失敗しました</p>
              <p className="text-gray-500">{error}</p>
              <button
                onClick={fetchUserData}
                className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
              >
                再試行
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* 打刻時間セクション */}
              <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center gap-2">
                  <span>⏰</span>
                  <span>打刻時間</span>
                </h3>
                
                {(healthData || workPlan) ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="bg-white rounded-lg p-4 border border-purple-100">
                        <label className="block text-sm font-medium text-gray-700 mb-2">実施時間 (開始)</label>
                        {isEditing ? (
                          <input
                            type="datetime-local"
                            value={editData.mark_start ? new Date(editData.mark_start).toISOString().slice(0, 16) : ''}
                            onChange={(e) => setEditData(prev => ({ ...prev, mark_start: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        ) : (
                          <div className="text-lg font-semibold text-purple-600">
                            {(healthData?.mark_start || workPlan?.mark_start) ? formatTime(healthData?.mark_start || workPlan?.mark_start) : '未記録'}
                          </div>
                        )}
                      </div>
                      
                      <div className="bg-white rounded-lg p-4 border border-purple-100">
                        <label className="block text-sm font-medium text-gray-700 mb-2">実施時間 (終了)</label>
                        {isEditing ? (
                          <input
                            type="datetime-local"
                            value={editData.mark_end ? new Date(editData.mark_end).toISOString().slice(0, 16) : ''}
                            onChange={(e) => setEditData(prev => ({ ...prev, mark_end: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        ) : (
                          <div className="text-lg font-semibold text-purple-600">
                            {(healthData?.mark_end || workPlan?.mark_end) ? formatTime(healthData?.mark_end || workPlan?.mark_end) : '未記録'}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg p-4 border border-purple-100">
                        <label className="block text-sm font-medium text-gray-700 mb-2">昼休憩開始</label>
                        {isEditing ? (
                          <input
                            type="datetime-local"
                            value={editData.mark_lunch_start ? new Date(editData.mark_lunch_start).toISOString().slice(0, 16) : ''}
                            onChange={(e) => setEditData(prev => ({ ...prev, mark_lunch_start: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        ) : (
                          <div className="text-lg font-semibold text-purple-600">
                            {(healthData?.mark_lunch_start || workPlan?.mark_lunch_start) ? formatTime(healthData?.mark_lunch_start || workPlan?.mark_lunch_start) : '未記録'}
                          </div>
                        )}
                      </div>
                      
                      <div className="bg-white rounded-lg p-4 border border-purple-100">
                        <label className="block text-sm font-medium text-gray-700 mb-2">昼休憩終了</label>
                        {isEditing ? (
                          <input
                            type="datetime-local"
                            value={editData.mark_lunch_end ? new Date(editData.mark_lunch_end).toISOString().slice(0, 16) : ''}
                            onChange={(e) => setEditData(prev => ({ ...prev, mark_lunch_end: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        ) : (
                          <div className="text-lg font-semibold text-purple-600">
                            {(healthData?.mark_lunch_end || workPlan?.mark_lunch_end) ? formatTime(healthData?.mark_lunch_end || workPlan?.mark_lunch_end) : '未記録'}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>打刻データがありません</p>
                  </div>
                )}
              </div>

              {/* 体調管理セクション */}
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                  <span>🏥</span>
                  <span>体調管理</span>
                </h3>
                
                {healthData ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-white rounded-lg p-4 border border-blue-100">
                        <label className="block text-sm font-medium text-gray-700 mb-2">体温</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editData.temperature}
                            onChange={(e) => setEditData(prev => ({ ...prev, temperature: e.target.value }))}
                            placeholder="例: 36.5"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <>
                            <div className="text-2xl font-bold text-blue-600">
                              {healthData.temperature ? `${healthData.temperature}°C` : '未記録'}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">記録時刻: {formatTime(healthData.mark_start)}</p>
                          </>
                        )}
                      </div>
                      
                      <div className="bg-white rounded-lg p-4 border border-blue-100">
                        <label className="block text-sm font-medium text-gray-700 mb-2">睡眠時間</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editData.sleep_hours || healthData.sleep_hours || ''}
                            onChange={(e) => setEditData(prev => ({ ...prev, sleep_hours: e.target.value }))}
                            placeholder="例: 7時間30分"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <div className="text-2xl font-bold text-blue-600">
                            {healthData.sleep_hours ? `${healthData.sleep_hours}` : '未記録'}
                          </div>
                        )}
                      </div>
                      
                      <div className="bg-white rounded-lg p-4 border border-blue-100">
                        <label className="block text-sm font-medium text-gray-700 mb-2">体調</label>
                        {isEditing ? (
                          <select
                            value={editData.condition}
                            onChange={(e) => setEditData(prev => ({ ...prev, condition: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="良い">😊 良い</option>
                            <option value="普通">😐 普通</option>
                            <option value="悪い">😷 悪い</option>
                          </select>
                        ) : (
                          <div className={`inline-flex px-3 py-1 rounded-full font-semibold ${
                            healthData.condition === '良い' ? 'bg-green-100 text-green-800' :
                            healthData.condition === '普通' ? 'bg-yellow-100 text-yellow-800' :
                            healthData.condition === '悪い' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {healthData.condition === '良い' ? '😊 良い' : 
                             healthData.condition === '普通' ? '😐 普通' : 
                             healthData.condition === '悪い' ? '😷 悪い' : '❓ 未記録'}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 border border-blue-100">
                      <label className="block text-sm font-medium text-gray-700 mb-2">体調の詳細</label>
                      {isEditing ? (
                        <textarea
                          value={editData.condition_note}
                          onChange={(e) => setEditData(prev => ({ ...prev, condition_note: e.target.value }))}
                          placeholder="体調の詳細を入力してください..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                        />
                      ) : (
                        <p className="text-gray-800">
                          {healthData.condition_note || '体調の詳細が記録されていません。'}
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>今日の体調管理データがありません</p>
                  </div>
                )}
              </div>

              {/* 作業予定セクション */}
              <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                <h3 className="text-lg font-bold text-green-900 mb-4 flex items-center gap-2">
                  <span>💼</span>
                  <span>作業内容</span>
                </h3>
                
                {workPlan ? (
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4 border border-green-100">
                      <label className="block text-sm font-medium text-gray-700 mb-2">作業予定</label>
                      {isEditing ? (
                        <textarea
                          value={editData.work_note}
                          onChange={(e) => setEditData(prev => ({ ...prev, work_note: e.target.value }))}
                          placeholder="作業予定を入力してください..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 h-24 resize-none"
                        />
                      ) : (
                        <p className="text-gray-800 whitespace-pre-wrap">
                          {workPlan.work_note || '作業予定が記録されていません。'}
                        </p>
                      )}
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-green-100">
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <span>作業・訓練内容</span>
                        {isEditing && (
                          <button
                            type="button"
                            onClick={handleAISuggest}
                            disabled={aiSuggesting || !workNote}
                            className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-200"
                          >
                            {aiSuggesting ? '🤖 生成中...' : '🤖 AI提案'}
                          </button>
                        )}
                      </label>
                      {isEditing ? (
                        <textarea
                          value={editData.work_result}
                          onChange={(e) => setEditData(prev => ({ ...prev, work_result: e.target.value }))}
                          placeholder="作業・訓練内容を入力してください..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 h-24 resize-none"
                        />
                      ) : (
                        <p className="text-gray-800 whitespace-pre-wrap">
                          {workPlan.work_result || '作業・訓練内容が記録されていません。'}
                        </p>
                      )}
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-green-100">
                      <label className="block text-sm font-medium text-gray-700 mb-2">日報</label>
                      {isEditing ? (
                        <textarea
                          value={editData.daily_report}
                          onChange={(e) => setEditData(prev => ({ ...prev, daily_report: e.target.value }))}
                          placeholder="日報を入力してください..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 h-32 resize-none"
                        />
                      ) : (
                        <p className="text-gray-800 whitespace-pre-wrap">{workPlan.daily_report || '日報が記録されていません。'}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>今日の作業予定データがありません</p>
                  </div>
                )}
              </div>


              {/* コメント追加セクション */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span>💬</span>
                  <span>指導員コメント</span>
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">コメントを追加</label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="利用者へのコメントを入力してください..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 h-24 resize-none"
                    />
                  </div>
                  
                  <button
                    onClick={handleAddComment}
                    disabled={submittingComment || !comment.trim()}
                    className="px-6 py-2 bg-indigo-500 text-white rounded-lg font-medium hover:bg-indigo-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {submittingComment ? '追加中...' : '💬 コメントを追加'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex justify-end gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    // 編集データをリセット
                    fetchUserData();
                  }}
                  disabled={saving}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 disabled:bg-green-300 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {saving ? '保存中...' : '💾 保存'}
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  onClose();
                }}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-all duration-200"
              >
                閉じる
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInputModal;
