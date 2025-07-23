import React, { useState } from 'react';

const instructorList = [
  '佐藤指導員',
  '田中指導員',
  '山田指導員',
  '鈴木指導員',
];

const WeeklyEvaluationDetail = ({ student, report, onSave, onEdit, onDelete, onDownloadPDF }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    evalDate: report?.evalDate || new Date().toISOString().split('T')[0],
    prevEvalDate: report?.prevEvalDate || '',
    method: report?.method || '通所',
    otherMethod: report?.otherMethod || '',
    period: report?.period || { start: '', end: '' },
    content: report?.content || '',
    instructor: report?.instructor || student?.instructorName || instructorList[0]
  });

  const handleSave = () => {
    if (!formData.content.trim()) {
      alert('評価内容を入力してください。');
      return;
    }

    const saveData = {
      ...formData,
      method: formData.method === 'その他' ? formData.otherMethod : formData.method
    };

    onSave(saveData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      evalDate: report?.evalDate || new Date().toISOString().split('T')[0],
      prevEvalDate: report?.prevEvalDate || '',
      method: report?.method || '通所',
      otherMethod: report?.otherMethod || '',
      period: report?.period || { start: '', end: '' },
      content: report?.content || '',
      instructor: report?.instructor || student?.instructorName || instructorList[0]
    });
  };

  const handleDelete = () => {
    if (window.confirm('この週次評価を削除しますか？')) {
      onDelete(report?.id);
    }
  };

  // AIアシスト機能（モック）
  const handleAiAssist = async () => {
    const suggestion = `・${student?.name}の週次評価について
・期間：${formData.period.start} ～ ${formData.period.end}
・学習進捗：${student?.class}の内容を着実に習得
・体調管理：良好な状態を維持
・次回目標：より高度な内容への挑戦`;
    
    setFormData(prev => ({ ...prev, content: suggestion }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-800">📅 週次評価（在宅における就労支援記録・評価）</h3>
            <div className="flex gap-2">
              {!isEditing ? (
                <>
                  <button 
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-200"
                    onClick={() => setIsEditing(true)}
                  >
                    ✏️ 編集
                  </button>
                  <button 
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all duration-200"
                    onClick={handleDelete}
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
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all duration-200"
                    onClick={handleSave}
                  >
                    💾 保存
                  </button>
                  <button 
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-all duration-200"
                    onClick={handleCancel}
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
                      value={formData.prevEvalDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, prevEvalDate: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
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
                      className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition-all duration-200"
                      onClick={handleAiAssist}
                    >
                      🤖 AIアシスト
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
                    {instructorList.map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">評価実施日:</span>
                    <span className="text-gray-800">{report?.evalDate || '未設定'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">前回評価日:</span>
                    <span className="text-gray-800">{report?.prevEvalDate || 'なし'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">評価方法:</span>
                    <span className="text-gray-800">{report?.method || '未設定'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">対象期間:</span>
                    <span className="text-gray-800">
                      {report?.period?.start && report?.period?.end 
                        ? `${report.period.start} ～ ${report.period.end}`
                        : '未設定'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">記録者:</span>
                    <span className="text-gray-800">{report?.instructor || '未設定'}</span>
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-2">評価内容:</label>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    {report?.content || '評価内容が入力されていません。'}
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