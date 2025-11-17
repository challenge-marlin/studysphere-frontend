import React, { useState, useEffect } from 'react';
import { apiCall } from '../utils/api';
import { normalizeSatelliteId } from '../utils/locationUtils';

const WeeklyEvaluationDetail = ({ student, report, onSave, onEdit, onDelete, onDownloadPDF }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [instructorList, setInstructorList] = useState([]);
  
  // バックエンドデータをフロントエンド形式に変換
  const convertBackendToFrontend = (data) => {
    if (!data) return null;
    return {
      evalDate: data.date || new Date().toISOString().split('T')[0],
      prevEvalDate: data.prev_eval_date || '',
      method: data.evaluation_method || '通所',
      otherMethod: data.method_other || '',
      period: {
        start: data.period_start || '',
        end: data.period_end || ''
      },
      content: data.evaluation_content || '',
      instructor: data.recorder_name || '',
      confirmer: data.confirm_name || ''
    };
  };

  // フロントエンドデータをバックエンド形式に変換
  const convertFrontendToBackend = (data) => {
    return {
      date: data.evalDate,
      prev_eval_date: data.prevEvalDate || null,
      period_start: data.period.start || null,
      period_end: data.period.end || null,
      evaluation_method: data.method === 'その他' ? 'その他' : data.method,
      method_other: data.method === 'その他' ? data.otherMethod : null,
      evaluation_content: data.content,
      recorder_name: data.instructor,
      confirm_name: data.confirmer || null
    };
  };

  const [formData, setFormData] = useState(() => {
    const converted = convertBackendToFrontend(report);
    return {
      evalDate: converted?.evalDate || report?.evalDate || new Date().toISOString().split('T')[0],
      prevEvalDate: converted?.prevEvalDate || report?.prevEvalDate || '',
      method: converted?.method || report?.method || '通所',
      otherMethod: converted?.otherMethod || report?.otherMethod || '',
      period: converted?.period || report?.period || { start: '', end: '' },
      content: converted?.content || report?.content || '',
      instructor: converted?.instructor || report?.instructor || student?.instructorName || '',
      confirmer: converted?.confirmer || report?.confirmer || ''
    };
  });

  // 指導員リストを取得
  useEffect(() => {
    const fetchInstructors = async () => {
      let satelliteId = normalizeSatelliteId(student?.satellite_id ?? student?.location?.id);
      if (!satelliteId) {
        const savedSatellite = sessionStorage.getItem('selectedSatellite');
        if (savedSatellite) {
          try {
            const parsed = JSON.parse(savedSatellite);
            satelliteId = normalizeSatelliteId(parsed?.id);
          } catch (error) {
            console.error('selectedSatelliteのパースエラー:', error);
          }
        }
      }

      if (!satelliteId) return;

      try {
        const response = await apiCall(`/api/users/satellite/${satelliteId}/weekly-evaluation-instructors`, {
          method: 'GET'
        });
        
        if (response.success && response.data) {
          setInstructorList(response.data);
          // デフォルトの指導員が設定されていない場合、最初の指導員を設定
          setFormData(prev => {
            if (!prev.instructor && response.data.length > 0) {
              return { ...prev, instructor: response.data[0].name };
            }
            return prev;
          });
        }
      } catch (error) {
        console.error('指導員リスト取得エラー:', error);
      }
    };

    fetchInstructors();
  }, [student?.satellite_id, student?.location?.id]);

  // 前回評価日を取得
  useEffect(() => {
    const fetchPrevEvalDate = async () => {
      if (!student?.id || report?.id) return; // 既存のレコードの場合はスキップ
      
      try {
        const response = await apiCall(`/api/weekly-evaluations/user/${student.id}/last-evaluation-date`, {
          method: 'GET'
        });
        
        if (response.success && response.data?.last_evaluation_date) {
          setFormData(prev => ({ ...prev, prevEvalDate: response.data.last_evaluation_date }));
        } else {
          // 前回評価日がない場合は空文字列を設定
          setFormData(prev => ({ ...prev, prevEvalDate: '' }));
        }
      } catch (error) {
        console.error('前回評価日取得エラー:', error);
      }
    };

    if (!isEditing && !report?.id) {
      fetchPrevEvalDate();
    }
  }, [student?.id, report?.id]);

  const handleSave = async () => {
    if (!formData.content.trim()) {
      alert('評価内容を入力してください。');
      return;
    }

    if (!student?.id) {
      alert('利用者情報が取得できません。');
      return;
    }

    setIsLoading(true);
    try {
      const backendData = convertFrontendToBackend(formData);

      let response;
      if (report?.id) {
        // 更新
        response = await apiCall(`/api/weekly-evaluations/${report.id}`, {
          method: 'PUT',
          body: JSON.stringify(backendData)
        });
      } else {
        // 作成
        response = await apiCall('/api/weekly-evaluations', {
          method: 'POST',
          body: JSON.stringify({
            ...backendData,
            user_id: student.id
          })
        });
      }

      if (response.success) {
        alert(report?.id ? '評価(週次)を更新しました。' : '評価(週次)を保存しました。');
        setIsEditing(false);
        // 親コンポーネントのコールバックを呼び出し
        if (onSave) {
          onSave({
            ...formData,
            id: report?.id || response.data?.id,
            method: formData.method === 'その他' ? formData.otherMethod : formData.method
          });
        }
      } else {
        alert('保存に失敗しました: ' + (response.message || 'エラーが発生しました'));
      }
    } catch (error) {
      console.error('保存エラー:', error);
      alert('保存中にエラーが発生しました: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    const converted = convertBackendToFrontend(report);
    setFormData({
      evalDate: converted?.evalDate || report?.evalDate || new Date().toISOString().split('T')[0],
      prevEvalDate: converted?.prevEvalDate || report?.prevEvalDate || '',
      method: converted?.method || report?.method || '通所',
      otherMethod: converted?.otherMethod || report?.otherMethod || '',
      period: converted?.period || report?.period || { start: '', end: '' },
      content: converted?.content || report?.content || '',
      instructor: converted?.instructor || report?.instructor || student?.instructorName || '',
      confirmer: converted?.confirmer || report?.confirmer || ''
    });
  };

  const handleDelete = async () => {
    if (!window.confirm('この評価(週次)を削除しますか？')) {
      return;
    }

    if (!report?.id) {
      alert('削除する評価が見つかりません。');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiCall(`/api/weekly-evaluations/${report.id}`, {
        method: 'DELETE'
      });

      if (response.success) {
        alert('評価(週次)を削除しました。');
        // 親コンポーネントのコールバックを呼び出し
        if (onDelete) {
          onDelete(report.id);
        }
      } else {
        alert('削除に失敗しました: ' + (response.message || 'エラーが発生しました'));
      }
    } catch (error) {
      console.error('削除エラー:', error);
      alert('削除中にエラーが発生しました: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // AIアシスト機能
  const handleAiAssist = async () => {
    if (!student?.id || !formData.period.start || !formData.period.end) {
      alert('対象期間を設定してください。');
      return;
    }

    try {
      setIsGenerating(true);
      const response = await apiCall('/api/weekly-evaluation-ai/generate-evaluation-content', {
        method: 'POST',
        body: JSON.stringify({
          user_id: student.id,
          period_start: formData.period.start,
          period_end: formData.period.end,
          evaluation_method: formData.method === 'その他' ? formData.otherMethod : formData.method,
          recorder_name: formData.instructor
        })
      });

      if (response.success && response.data?.evaluation_content) {
        setFormData(prev => ({ ...prev, content: response.data.evaluation_content }));
      } else {
        alert('評価内容の生成に失敗しました: ' + (response.message || 'エラーが発生しました'));
      }
    } catch (error) {
      console.error('AI評価内容生成エラー:', error);
      alert('評価内容の生成中にエラーが発生しました: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-800">📅 評価(週次)（在宅における就労支援記録・評価）</h3>
            <div className="flex gap-2">
              {!isEditing ? (
                <>
                  <button 
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => setIsEditing(true)}
                    disabled={isLoading}
                  >
                    ✏️ 編集
                  </button>
                  <button 
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleDelete}
                    disabled={isLoading || !report?.id}
                  >
                    🗑️ 削除
                  </button>
                  <button 
                    className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-all duration-200"
                    onClick={() => onDownloadPDF && onDownloadPDF(report)}
                    title="PDFでダウンロード"
                  >
                    📄 PDF
                  </button>
                </>
              ) : (
                <>
                  <button 
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleSave}
                    disabled={isLoading}
                  >
                    {isLoading ? '💾 保存中...' : '💾 保存'}
                  </button>
                  <button 
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleCancel}
                    disabled={isLoading}
                  >
                    キャンセル
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {isEditing ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">評価実施日</label>
                    <input 
                      type="date" 
                      value={formData.evalDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, evalDate: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">前回評価日</label>
                    <input 
                      type="date" 
                      value={formData.prevEvalDate || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, prevEvalDate: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="前回評価日がない場合は未入力"
                    />
                    {!formData.prevEvalDate && (
                      <p className="mt-1 text-xs text-gray-500">前回評価日がない場合は未入力のままにしてください</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">評価方法</label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input 
                        type="radio" 
                        name="method" 
                        value="通所" 
                        checked={formData.method === '通所'} 
                        onChange={() => setFormData(prev => ({ ...prev, method: '通所' }))} 
                        className="mr-2 text-green-600 focus:ring-green-500"
                      />
                      通所
                    </label>
                    <label className="flex items-center">
                      <input 
                        type="radio" 
                        name="method" 
                        value="訪問" 
                        checked={formData.method === '訪問'} 
                        onChange={() => setFormData(prev => ({ ...prev, method: '訪問' }))} 
                        className="mr-2 text-green-600 focus:ring-green-500"
                      />
                      訪問
                    </label>
                    <label className="flex items-center">
                      <input 
                        type="radio" 
                        name="method" 
                        value="その他" 
                        checked={formData.method === 'その他'} 
                        onChange={() => setFormData(prev => ({ ...prev, method: 'その他' }))} 
                        className="mr-2 text-green-600 focus:ring-green-500"
                      />
                      その他
                    </label>
                  </div>
                  {formData.method === 'その他' && (
                    <input 
                      type="text" 
                      value={formData.otherMethod} 
                      onChange={(e) => setFormData(prev => ({ ...prev, otherMethod: e.target.value }))} 
                      placeholder="方法を入力" 
                      className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">対象期間</label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="date" 
                      value={formData.period.start} 
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        period: { ...prev.period, start: e.target.value } 
                      }))} 
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <span className="text-gray-500">～</span>
                    <input 
                      type="date" 
                      value={formData.period.end} 
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        period: { ...prev.period, end: e.target.value } 
                      }))} 
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    評価内容
                    <button 
                      type="button" 
                      className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleAiAssist}
                      disabled={isGenerating || !student?.id || !formData.period.start || !formData.period.end}
                    >
                      {isGenerating ? '🤖 生成中...' : '🤖 AIアシスト'}
                    </button>
                  </label>
                  <textarea 
                    value={formData.content} 
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))} 
                    rows={6} 
                    placeholder="評価内容を入力してください" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">記録者</label>
                  <select 
                    value={formData.instructor} 
                    onChange={(e) => setFormData(prev => ({ ...prev, instructor: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    確認者（サービス管理責任者）
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.confirmer}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmer: e.target.value }))}
                    placeholder="サービス管理責任者名を入力"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <p className="mt-1 text-xs text-gray-500">※ 評価内容はサービス管理責任者が必ず確認すること</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">評価実施日:</span>
                    <span className="text-gray-800">{report?.evalDate || report?.date || '未設定'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">前回評価日:</span>
                    <span className="text-gray-800">{report?.prevEvalDate || report?.prev_eval_date || 'なし'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">評価方法:</span>
                    <span className="text-gray-800">
                      {report?.method || report?.evaluation_method || '未設定'}
                      {report?.method_other && `（${report.method_other}）`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">対象期間:</span>
                    <span className="text-gray-800">
                      {(report?.period?.start || report?.period_start) && (report?.period?.end || report?.period_end)
                        ? `${report?.period?.start || report?.period_start} ～ ${report?.period?.end || report?.period_end}`
                        : '未設定'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">記録者:</span>
                    <span className="text-gray-800">{report?.instructor || report?.recorder_name || '未設定'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">確認者:</span>
                    <span className="text-gray-800">{report?.confirmer || report?.confirm_name || '未設定'}</span>
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-2">評価内容:</label>
                  <div className="p-4 bg-gray-50 rounded-lg whitespace-pre-wrap">
                    {report?.content || report?.evaluation_content || '評価内容が入力されていません。'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyEvaluationDetail; 