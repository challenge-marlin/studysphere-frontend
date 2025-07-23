import React, { useState } from 'react';

const instructorList = [
  '佐藤指導員',
  '田中指導員',
  '山田指導員',
  '鈴木指導員',
];

const MonthlyEvaluationDetail = ({ student, report, onSave, onEdit, onDelete, onDownloadPDF }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    evalDate: report?.evalDate || new Date().toISOString().split('T')[0],
    prevEvalDate: report?.prevEvalDate || '',
    method: report?.method || '通所',
    otherMethod: report?.otherMethod || '',
    goal: report?.goal || '',
    work: report?.work || '',
    achievement: report?.achievement || '',
    issue: report?.issue || '',
    improve: report?.improve || '',
    health: report?.health || '',
    note: report?.note || '',
    validity: report?.validity || '',
    instructor: report?.instructor || student?.instructorName || instructorList[0]
  });

  const handleSave = () => {
    if (!formData.goal.trim() || !formData.work.trim()) {
      alert('訓練目標と取組内容は必須項目です。');
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
      goal: report?.goal || '',
      work: report?.work || '',
      achievement: report?.achievement || '',
      issue: report?.issue || '',
      improve: report?.improve || '',
      health: report?.health || '',
      note: report?.note || '',
      validity: report?.validity || '',
      instructor: report?.instructor || student?.instructorName || instructorList[0]
    });
  };

  const handleDelete = () => {
    if (window.confirm('この月次評価を削除しますか？')) {
      onDelete(report?.id);
    }
  };

  // AIアシスト機能（モック）
  const handleAiAssist = async (field) => {
    const suggestions = {
      goal: `${student?.class}の習得と実践的なスキルアップ`,
      work: `${student?.class}の学習と実習、課題への取り組み`,
      achievement: '基礎知識の習得ができ、実践的な作業も可能になった',
      issue: 'より高度な内容への理解を深める必要がある',
      improve: '段階的な学習と実践を組み合わせた指導を継続',
      health: '体調管理を適切に行い、無理のない学習を継続',
      note: '学習意欲が高く、着実にスキルアップしている',
      validity: '在宅就労の継続は妥当。適切なサポート体制を維持'
    };
    
    setFormData(prev => ({ ...prev, [field]: suggestions[field] || '' }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-800">📈 月次評価（在宅における就労達成度評価シート）</h3>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">前回の達成度評価日</label>
                    <input 
                      type="date" 
                      value={formData.prevEvalDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, prevEvalDate: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">実施方法</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    訓練目標 *
                    <button 
                      type="button" 
                      className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition-all duration-200"
                      onClick={() => handleAiAssist('goal')}
                    >
                      🤖 AI
                    </button>
                  </label>
                  <textarea 
                    value={formData.goal} 
                    onChange={(e) => setFormData(prev => ({ ...prev, goal: e.target.value }))} 
                    rows={3} 
                    placeholder="訓練目標を入力" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    取組内容 *
                    <button 
                      type="button" 
                      className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition-all duration-200"
                      onClick={() => handleAiAssist('work')}
                    >
                      🤖 AI
                    </button>
                  </label>
                  <textarea 
                    value={formData.work} 
                    onChange={(e) => setFormData(prev => ({ ...prev, work: e.target.value }))} 
                    rows={3} 
                    placeholder="取組内容を入力" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    訓練目標に対する達成度
                    <button 
                      type="button" 
                      className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition-all duration-200"
                      onClick={() => handleAiAssist('achievement')}
                    >
                      🤖 AI
                    </button>
                  </label>
                  <textarea 
                    value={formData.achievement} 
                    onChange={(e) => setFormData(prev => ({ ...prev, achievement: e.target.value }))} 
                    rows={3} 
                    placeholder="達成度を入力" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    課題
                    <button 
                      type="button" 
                      className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition-all duration-200"
                      onClick={() => handleAiAssist('issue')}
                    >
                      🤖 AI
                    </button>
                  </label>
                  <textarea 
                    value={formData.issue} 
                    onChange={(e) => setFormData(prev => ({ ...prev, issue: e.target.value }))} 
                    rows={3} 
                    placeholder="課題を入力" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    今後の課題改善方針
                    <button 
                      type="button" 
                      className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition-all duration-200"
                      onClick={() => handleAiAssist('improve')}
                    >
                      🤖 AI
                    </button>
                  </label>
                  <textarea 
                    value={formData.improve} 
                    onChange={(e) => setFormData(prev => ({ ...prev, improve: e.target.value }))} 
                    rows={3} 
                    placeholder="改善方針を入力" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    健康・体調面での留意事項
                    <button 
                      type="button" 
                      className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition-all duration-200"
                      onClick={() => handleAiAssist('health')}
                    >
                      🤖 AI
                    </button>
                  </label>
                  <textarea 
                    value={formData.health} 
                    onChange={(e) => setFormData(prev => ({ ...prev, health: e.target.value }))} 
                    rows={3} 
                    placeholder="健康・体調面での留意事項を入力" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    その他特記事項
                    <button 
                      type="button" 
                      className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition-all duration-200"
                      onClick={() => handleAiAssist('note')}
                    >
                      🤖 AI
                    </button>
                  </label>
                  <textarea 
                    value={formData.note} 
                    onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))} 
                    rows={3} 
                    placeholder="特記事項を入力" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    在宅就労継続の妥当性
                    <button 
                      type="button" 
                      className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition-all duration-200"
                      onClick={() => handleAiAssist('validity')}
                    >
                      🤖 AI
                    </button>
                  </label>
                  <textarea 
                    value={formData.validity} 
                    onChange={(e) => setFormData(prev => ({ ...prev, validity: e.target.value }))} 
                    rows={3} 
                    placeholder="妥当性を入力" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">評価実施者</label>
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
                    <span className="font-medium text-gray-700">前回の達成度評価日:</span>
                    <span className="text-gray-800">{report?.prevEvalDate || 'なし'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">実施方法:</span>
                    <span className="text-gray-800">{report?.method || '未設定'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">評価実施者:</span>
                    <span className="text-gray-800">{report?.instructor || '未設定'}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block font-medium text-gray-700 mb-2">訓練目標:</label>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      {report?.goal || '未入力'}
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium text-gray-700 mb-2">取組内容:</label>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      {report?.work || '未入力'}
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium text-gray-700 mb-2">訓練目標に対する達成度:</label>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      {report?.achievement || '未入力'}
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium text-gray-700 mb-2">課題:</label>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      {report?.issue || '未入力'}
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium text-gray-700 mb-2">今後の課題改善方針:</label>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      {report?.improve || '未入力'}
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium text-gray-700 mb-2">健康・体調面での留意事項:</label>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      {report?.health || '未入力'}
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium text-gray-700 mb-2">その他特記事項:</label>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      {report?.note || '未入力'}
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium text-gray-700 mb-2">在宅就労継続の妥当性:</label>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      {report?.validity || '未入力'}
                    </div>
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

export default MonthlyEvaluationDetail; 