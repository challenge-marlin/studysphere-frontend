import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInstructorGuard } from '../utils/hooks/useAuthGuard';
import InstructorHeader from '../components/InstructorHeader';
import { apiCall } from '../utils/api';

const MonthlyEvaluationHistoryPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useInstructorGuard();
  const [localUser, setLocalUser] = useState(currentUser);
  
  const [selectedEvaluationId, setSelectedEvaluationId] = useState(null);
  const [evaluations, setEvaluations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingEvaluation, setEditingEvaluation] = useState(null);
  const [instructorList, setInstructorList] = useState([]);

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

  // バックエンドデータをフロントエンド形式に変換
  const convertBackendToFrontend = (data) => {
    if (!data) return null;
    
    // 評価期間を計算（dateから1ヶ月前後）
    const evalDate = new Date(data.date);
    const startDate = new Date(evalDate.getFullYear(), evalDate.getMonth(), 1);
    const endDate = new Date(evalDate.getFullYear(), evalDate.getMonth() + 1, 0);
    
    return {
      id: data.id,
      date: data.date,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      createdDate: data.created_at || data.date,
      startTime: data.mark_start || '',
      endTime: data.mark_end || '',
      method: data.evaluation_method || '通所',
      methodOther: data.method_other || '',
      trainingGoal: data.goal || '',
      workContent: data.effort || '',
      achievement: data.achievement || '',
      issues: data.issues || '',
      improvementPlan: data.improvement || '',
      healthNotes: data.health || '',
      otherNotes: data.others || '',
      continuityValidity: data.appropriateness || '',
      evaluator: data.evaluator_name || '',
      prevEvaluationDate: data.prev_evaluation_date || '',
      recipientNumber: data.recipient_number || '',
      userName: data.user_name || ''
    };
  };

  // フロントエンドデータをバックエンド形式に変換
  const convertFrontendToBackend = (data) => {
    return {
      date: data.date,
      mark_start: data.startTime || null,
      mark_end: data.endTime || null,
      evaluation_method: data.method === 'その他' ? 'その他' : data.method,
      method_other: data.method === 'その他' ? data.methodOther : null,
      goal: data.trainingGoal || null,
      effort: data.workContent || null,
      achievement: data.achievement || null,
      issues: data.issues || null,
      improvement: data.improvementPlan || null,
      health: data.healthNotes || null,
      others: data.otherNotes || null,
      appropriateness: data.continuityValidity || null,
      evaluator_name: data.evaluator || null,
      prev_evaluation_date: data.prevEvaluationDate || null,
      recipient_number: selectedUser?.recipient_number || null,
      user_name: selectedUser?.name || null
    };
  };

  // 利用者情報を取得
  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!userId) return;
      
      try {
        const response = await apiCall(`/api/users/${userId}`, {
          method: 'GET'
        });
        
        if (response.success && response.data) {
          setSelectedUser({
            id: response.data.id,
            name: response.data.name,
            recipientNumber: response.data.recipient_number || '',
            satellite_ids: response.data.satellite_ids || null
          });
        } else {
          console.error('利用者情報の取得に失敗しました:', response.message);
        }
      } catch (error) {
        console.error('利用者情報取得エラー:', error);
      }
    };

    fetchUserInfo();
  }, [userId]);

  // 月次評価履歴を取得
  useEffect(() => {
    const fetchEvaluations = async () => {
      if (!userId) return;
      
      try {
        setIsLoading(true);
        const response = await apiCall(`/api/monthly-evaluations/user/${userId}`, {
          method: 'GET'
        });
        
        if (response.success && response.data) {
          const convertedEvaluations = response.data.map(convertBackendToFrontend);
          setEvaluations(convertedEvaluations);
          
          // 最新の評価を選択
          if (convertedEvaluations.length > 0) {
            setSelectedEvaluationId(convertedEvaluations[0].id);
          }
        } else {
          console.error('月次評価履歴の取得に失敗しました:', response.message);
          setEvaluations([]);
        }
      } catch (error) {
        console.error('月次評価履歴取得エラー:', error);
        setEvaluations([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchEvaluations();
    }
  }, [userId]);

  // 指導員リストを取得
  useEffect(() => {
    const fetchInstructors = async () => {
      if (!selectedUser?.satellite_ids) return;
      
      try {
        let satelliteIds = selectedUser.satellite_ids;
        if (typeof satelliteIds === 'string') {
          satelliteIds = JSON.parse(satelliteIds);
        }
        if (!Array.isArray(satelliteIds) || satelliteIds.length === 0) return;
        
        const satelliteId = satelliteIds[0]; // 最初の拠点を使用
        const response = await apiCall(`/api/users/satellite/${satelliteId}/weekly-evaluation-instructors`, {
          method: 'GET'
        });
        
        if (response.success && response.data) {
          setInstructorList(response.data);
        }
      } catch (error) {
        console.error('指導員リスト取得エラー:', error);
      }
    };

    if (selectedUser) {
      fetchInstructors();
    }
  }, [selectedUser]);

  const selectedEvaluation = evaluations.find(e => e.id === selectedEvaluationId);

  // 選択中の評価が変更された場合、編集モードを解除
  useEffect(() => {
    if (isEditing && selectedEvaluationId) {
      setIsEditing(false);
      setEditingEvaluation(null);
    }
  }, [selectedEvaluationId]);

  // 編集開始
  const handleEdit = () => {
    if (selectedEvaluation) {
      setEditingEvaluation({ ...selectedEvaluation });
      setIsEditing(true);
    }
  };

  // 編集キャンセル
  const handleCancel = () => {
    setIsEditing(false);
    setEditingEvaluation(null);
  };

  // 保存処理
  const handleSave = async () => {
    if (!editingEvaluation || !selectedEvaluation) {
      return;
    }

    if (!editingEvaluation.trainingGoal.trim() || !editingEvaluation.workContent.trim()) {
      alert('訓練目標と取組内容は必須項目です。');
      return;
    }

    setIsSaving(true);
    try {
      const backendData = convertFrontendToBackend(editingEvaluation);
      const response = await apiCall(`/api/monthly-evaluations/${selectedEvaluation.id}`, {
        method: 'PUT',
        body: JSON.stringify(backendData)
      });

      if (response.success) {
        alert('月次評価を更新しました。');
        setIsEditing(false);
        setEditingEvaluation(null);
        
        // データを再取得
        const refreshResponse = await apiCall(`/api/monthly-evaluations/user/${userId}`, {
          method: 'GET'
        });
        
        if (refreshResponse.success && refreshResponse.data) {
          const convertedEvaluations = refreshResponse.data.map(convertBackendToFrontend);
          setEvaluations(convertedEvaluations);
          
          // 更新した評価を選択
          const updatedEval = convertedEvaluations.find(e => e.id === selectedEvaluation.id);
          if (updatedEval) {
            setSelectedEvaluationId(updatedEval.id);
          }
        }
      } else {
        alert('保存に失敗しました: ' + (response.message || 'エラーが発生しました'));
      }
    } catch (error) {
      console.error('保存エラー:', error);
      alert('保存中にエラーが発生しました: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  // フィールド更新
  const updateEditingField = (field, value) => {
    if (editingEvaluation) {
      setEditingEvaluation({
        ...editingEvaluation,
        [field]: value
      });
    }
  };

  // 印刷処理
  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-xl text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!selectedUser) {
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

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* ヘッダー（印刷時は非表示） */}
      <div className="print:hidden">
        <InstructorHeader 
          user={localUser || currentUser} 
          onLocationChange={handleLocationChange}
          showBackButton={true}
          backButtonText="在宅支援ダッシュボードに戻る"
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
            navigate('/instructor/home-support');
          }}
        />
      </div>

      <div className="flex-1 p-8">
        {/* タイトルエリア（印刷時は非表示） */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 print:hidden">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">📈 在宅における就労達成度評価</h1>
            <p className="text-lg text-gray-600">月次の達成度評価を確認できます</p>
          </div>

          {/* 利用者情報 */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 mb-6 border border-purple-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-white rounded-full w-12 h-12 flex items-center justify-center shadow-md">
                  <span className="text-2xl">👤</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{selectedUser.name}</h2>
                  <p className="text-sm text-gray-600">受給者証番号: {selectedUser.recipientNumber}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {!isEditing && selectedEvaluation && (
                  <button 
                    onClick={handleEdit}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    ✏️ 編集
                  </button>
                )}
                <button 
                  onClick={handlePrint}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  🖨️ 印刷
                </button>
              </div>
            </div>
          </div>

          {/* 評価期間ナビゲーション */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={() => {
                  const currentIndex = evaluations.findIndex(e => e.id === selectedEvaluationId);
                  if (currentIndex < evaluations.length - 1) {
                    setSelectedEvaluationId(evaluations[currentIndex + 1].id);
                  }
                }}
                disabled={evaluations.findIndex(e => e.id === selectedEvaluationId) >= evaluations.length - 1}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                ← 前回記録
              </button>
              
              <div className="flex-1 text-center">
                <div className="font-bold text-lg text-gray-800">
                  {selectedEvaluation && `${new Date(selectedEvaluation.startDate).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })} 〜 ${new Date(selectedEvaluation.endDate).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}`}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  評価作成日: {selectedEvaluation && new Date(selectedEvaluation.createdDate).toLocaleDateString('ja-JP')}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {evaluations.length > 0 && `${evaluations.findIndex(e => e.id === selectedEvaluationId) + 1} / ${evaluations.length} 件`}
                </div>
              </div>
              
              <button
                onClick={() => {
                  const currentIndex = evaluations.findIndex(e => e.id === selectedEvaluationId);
                  if (currentIndex > 0) {
                    setSelectedEvaluationId(evaluations[currentIndex - 1].id);
                  }
                }}
                disabled={evaluations.findIndex(e => e.id === selectedEvaluationId) <= 0}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                次回記録 →
              </button>
            </div>
          </div>
        </div>

        {/* 印刷用ヘッダー（画面上は非表示） */}
        <div className="hidden print:block mb-6">
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold text-gray-800">在宅における就労達成度評価シート</h1>
          </div>
          <div className="border-2 border-gray-800 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-semibold">利用者名:</span> {selectedUser.name}
              </div>
              <div>
                <span className="font-semibold">受給者証番号:</span> {selectedUser.recipientNumber}
              </div>
              <div>
                <span className="font-semibold">評価期間:</span> {selectedEvaluation && `${new Date(selectedEvaluation.startDate).toLocaleDateString('ja-JP')} 〜 ${new Date(selectedEvaluation.endDate).toLocaleDateString('ja-JP')}`}
              </div>
              <div>
                <span className="font-semibold">評価作成日:</span> {selectedEvaluation && new Date(selectedEvaluation.createdDate).toLocaleDateString('ja-JP')}
              </div>
            </div>
          </div>
        </div>

        {/* 評価内容 */}
        {selectedEvaluation ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 print:shadow-none print:rounded-none">
            {isEditing && (
              <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-400 rounded-lg print:hidden">
                <div className="flex items-center justify-between">
                  <p className="text-yellow-800 font-semibold">📝 編集モード</p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? '💾 保存中...' : '💾 保存'}
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={isSaving}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              </div>
            )}
            <div className="space-y-6 print:break-inside-avoid">
              {/* 1. 実施時間 */}
              <section className="border-b-2 border-gray-200 pb-6 print:break-inside-avoid">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg">実施時間</span>
                </h3>
                {isEditing ? (
                  <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">開始時間</label>
                      <input
                        type="time"
                        value={editingEvaluation?.startTime || ''}
                        onChange={(e) => updateEditingField('startTime', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">終了時間</label>
                      <input
                        type="time"
                        value={editingEvaluation?.endTime || ''}
                        onChange={(e) => updateEditingField('endTime', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">開始時間</div>
                      <div className="text-xl font-bold text-blue-600">{selectedEvaluation.startTime || '未設定'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">終了時間</div>
                      <div className="text-xl font-bold text-blue-600">{selectedEvaluation.endTime || '未設定'}</div>
                    </div>
                  </div>
                )}
              </section>

              {/* 2. 実施方法 */}
              <section className="border-b-2 border-gray-200 pb-6 print:break-inside-avoid">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-lg">実施方法</span>
                </h3>
                {isEditing ? (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex gap-4 mb-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="method"
                          value="通所"
                          checked={editingEvaluation?.method === '通所'}
                          onChange={(e) => updateEditingField('method', e.target.value)}
                          className="mr-2"
                        />
                        通所
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="method"
                          value="訪問"
                          checked={editingEvaluation?.method === '訪問'}
                          onChange={(e) => updateEditingField('method', e.target.value)}
                          className="mr-2"
                        />
                        訪問
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="method"
                          value="その他"
                          checked={editingEvaluation?.method === 'その他'}
                          onChange={(e) => updateEditingField('method', e.target.value)}
                          className="mr-2"
                        />
                        その他
                      </label>
                    </div>
                    {editingEvaluation?.method === 'その他' && (
                      <input
                        type="text"
                        value={editingEvaluation?.methodOther || ''}
                        onChange={(e) => updateEditingField('methodOther', e.target.value)}
                        placeholder="実施方法を入力"
                        className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    )}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <span className="inline-block px-4 py-2 bg-white border-2 border-green-500 rounded-lg font-semibold text-gray-800">
                      {selectedEvaluation.method}
                      {selectedEvaluation.method === 'その他' && selectedEvaluation.methodOther && ` (${selectedEvaluation.methodOther})`}
                    </span>
                  </div>
                )}
              </section>

              {/* 3. 訓練目標 */}
              <section className="border-b-2 border-gray-200 pb-6 print:break-inside-avoid">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-lg">訓練目標 *</span>
                </h3>
                {isEditing ? (
                  <textarea
                    value={editingEvaluation?.trainingGoal || ''}
                    onChange={(e) => updateEditingField('trainingGoal', e.target.value)}
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none"
                    placeholder="訓練目標を入力"
                  />
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4 text-gray-800 whitespace-pre-wrap">
                    {selectedEvaluation.trainingGoal || '未入力'}
                  </div>
                )}
              </section>

              {/* 4. 取組内容 */}
              <section className="border-b-2 border-gray-200 pb-6 print:break-inside-avoid">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-lg">取組内容 *</span>
                </h3>
                {isEditing ? (
                  <textarea
                    value={editingEvaluation?.workContent || ''}
                    onChange={(e) => updateEditingField('workContent', e.target.value)}
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 resize-none"
                    placeholder="取組内容を入力"
                  />
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4 text-gray-800 whitespace-pre-wrap">
                    {selectedEvaluation.workContent || '未入力'}
                  </div>
                )}
              </section>

              {/* 5. 訓練目標に対する達成度 */}
              <section className="border-b-2 border-gray-200 pb-6 print:break-inside-avoid">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="bg-pink-100 text-pink-800 px-3 py-1 rounded-lg">訓練目標に対する達成度</span>
                </h3>
                {isEditing ? (
                  <textarea
                    value={editingEvaluation?.achievement || ''}
                    onChange={(e) => updateEditingField('achievement', e.target.value)}
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 resize-none"
                    placeholder="達成度を入力"
                  />
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4 text-gray-800 whitespace-pre-wrap">
                    {selectedEvaluation.achievement || '未入力'}
                  </div>
                )}
              </section>

              {/* 6. 課題 */}
              <section className="border-b-2 border-gray-200 pb-6 print:break-inside-avoid">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-lg">課題</span>
                </h3>
                {isEditing ? (
                  <textarea
                    value={editingEvaluation?.issues || ''}
                    onChange={(e) => updateEditingField('issues', e.target.value)}
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 resize-none"
                    placeholder="課題を入力"
                  />
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4 text-gray-800 whitespace-pre-wrap">
                    {selectedEvaluation.issues || '未入力'}
                  </div>
                )}
              </section>

              {/* 7. 今後における課題の改善方針 */}
              <section className="border-b-2 border-gray-200 pb-6 print:break-inside-avoid">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="bg-teal-100 text-teal-800 px-3 py-1 rounded-lg">今後における課題の改善方針</span>
                </h3>
                {isEditing ? (
                  <textarea
                    value={editingEvaluation?.improvementPlan || ''}
                    onChange={(e) => updateEditingField('improvementPlan', e.target.value)}
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 resize-none"
                    placeholder="改善方針を入力"
                  />
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4 text-gray-800 whitespace-pre-wrap">
                    {selectedEvaluation.improvementPlan || '未入力'}
                  </div>
                )}
              </section>

              {/* 8. 健康・体調面での留意事項 */}
              <section className="border-b-2 border-gray-200 pb-6 print:break-inside-avoid">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-lg">健康・体調面での留意事項</span>
                </h3>
                {isEditing ? (
                  <textarea
                    value={editingEvaluation?.healthNotes || ''}
                    onChange={(e) => updateEditingField('healthNotes', e.target.value)}
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 resize-none"
                    placeholder="健康・体調面での留意事項を入力"
                  />
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4 text-gray-800 whitespace-pre-wrap">
                    {selectedEvaluation.healthNotes || '未入力'}
                  </div>
                )}
              </section>

              {/* 9. その他特記事項 */}
              <section className="border-b-2 border-gray-200 pb-6 print:break-inside-avoid">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-lg">その他特記事項</span>
                </h3>
                {isEditing ? (
                  <textarea
                    value={editingEvaluation?.otherNotes || ''}
                    onChange={(e) => updateEditingField('otherNotes', e.target.value)}
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 resize-none"
                    placeholder="特記事項を入力"
                  />
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4 text-gray-800 whitespace-pre-wrap">
                    {selectedEvaluation.otherNotes || '特になし'}
                  </div>
                )}
              </section>

              {/* 10. 在宅就労継続の妥当性 */}
              <section className="border-b-2 border-gray-200 pb-6 print:break-inside-avoid">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-lg">在宅就労継続の妥当性</span>
                </h3>
                {isEditing ? (
                  <textarea
                    value={editingEvaluation?.continuityValidity || ''}
                    onChange={(e) => updateEditingField('continuityValidity', e.target.value)}
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 resize-none bg-amber-50"
                    placeholder="在宅就労継続の妥当性を入力"
                  />
                ) : (
                  <div className="bg-amber-50 border-l-4 border-amber-400 rounded-lg p-4 text-gray-800 whitespace-pre-wrap">
                    {selectedEvaluation.continuityValidity || '未入力'}
                  </div>
                )}
              </section>

              {/* 担当者情報 */}
              <section className="pt-6 border-t-2 border-gray-300 print:break-inside-avoid">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">評価作成日</div>
                    {isEditing ? (
                      <input
                        type="date"
                        value={editingEvaluation?.date || ''}
                        onChange={(e) => updateEditingField('date', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <div className="font-semibold text-gray-800">
                        {selectedEvaluation.date ? new Date(selectedEvaluation.date).toLocaleDateString('ja-JP') : new Date(selectedEvaluation.createdDate).toLocaleDateString('ja-JP')}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">評価実施者</div>
                    {isEditing ? (
                      <select
                        value={editingEvaluation?.evaluator || ''}
                        onChange={(e) => updateEditingField('evaluator', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        {instructorList.length > 0 ? (
                          instructorList.map(instructor => (
                            <option key={instructor.id || instructor.name} value={instructor.name}>
                              {instructor.name}
                            </option>
                          ))
                        ) : (
                          <option value="">指導員が見つかりません</option>
                        )}
                      </select>
                    ) : (
                      <div className="font-semibold text-gray-800">{selectedEvaluation.evaluator || '未設定'}</div>
                    )}
                  </div>
                </div>
              </section>

              {/* 対象者署名欄（印刷後に手書き用） */}
              <section className="mt-8 pt-6 border-t-2 border-gray-300 print:break-inside-avoid">
                <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-6">
                  <h4 className="text-lg font-bold text-gray-800 mb-4">対象者署名（確認欄）</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    上記内容を確認し、評価実施者と共有しました。
                  </p>
                  <div className="bg-white border-2 border-gray-300 rounded-lg p-6 min-h-[100px] flex items-end">
                    <div className="w-full border-b-2 border-gray-400 pb-2">
                      <div className="text-sm text-gray-500 mb-1">署名:</div>
                      <div className="h-8"></div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-right">
                    ※ 印刷後、こちらに署名をお願いします
                  </p>
                </div>
              </section>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <p className="text-xl text-gray-600">評価データがありません</p>
          </div>
        )}

        {/* 印刷時のフッター */}
        <div className="hidden print:block mt-6 text-center text-sm text-gray-600">
          <p>発行日: {new Date().toLocaleDateString('ja-JP')}</p>
        </div>
      </div>
    </div>
  );
};

export default MonthlyEvaluationHistoryPage;

