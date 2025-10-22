import React, { useState } from 'react';

const instructorList = [
  '佐藤指導員',
  '田中指導員',
  '山田指導員',
  '鈴木指導員',
];

const todayStr = new Date().toISOString().split('T')[0];

/**
 * 達成度評価モーダル（在宅における就労達成度評価シート）
 */
const MonthlyEvaluationModal = ({
  isOpen,
  onClose,
  onSave,
  prevEvalDate,
  defaultInstructor,
  aiAssist,
  student,
}) => {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [method, setMethod] = useState('通所');
  const [otherMethod, setOtherMethod] = useState('');
  const [trainingGoal, setTrainingGoal] = useState('');
  const [workContent, setWorkContent] = useState('');
  const [achievement, setAchievement] = useState('');
  const [issues, setIssues] = useState('');
  const [improvementPlan, setImprovementPlan] = useState('');
  const [healthNotes, setHealthNotes] = useState('');
  const [otherNotes, setOtherNotes] = useState('');
  const [continuityValidity, setContinuityValidity] = useState('');
  const [evaluator, setEvaluator] = useState(defaultInstructor || instructorList[0]);
  const [studentSignature, setStudentSignature] = useState('');

  const handleAi = async (field, setter) => {
    if (aiAssist) {
      const suggestion = await aiAssist({
        type: 'monthly',
        field,
        prevEvalDate,
        evaluator,
        student,
      });
      setter(suggestion || '');
    }
  };

  const handleSave = () => {
    onSave && onSave({
      studentId: student?.id,
      studentName: student?.name,
      recipientNumber: student?.recipientNumber || '',
      evalDate: todayStr,
      prevEvalDate,
      startTime,
      endTime,
      method: method === 'その他' ? otherMethod : method,
      trainingGoal,
      workContent,
      achievement,
      issues,
      improvementPlan,
      healthNotes,
      otherNotes,
      continuityValidity,
      evaluator,
      studentSignature,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] flex flex-col">
        {/* ヘッダー */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">在宅における就労達成度評価シート</h2>
              <p className="text-purple-100 text-sm mt-1">達成度評価（令和{new Date().getFullYear() - 2018}年{new Date().getMonth() + 1}月分）</p>
              {student && (
                <div className="mt-2 text-sm text-purple-100">
                  <span>対象者名: <span className="font-semibold text-white">{student.name}</span></span>
                  {student.recipientNumber && (
                    <span className="ml-4">受給者証番号: <span className="font-semibold text-white">{student.recipientNumber}</span></span>
                  )}
                </div>
              )}
            </div>
            <button 
              className="text-white hover:bg-white hover:bg-opacity-20 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200"
              onClick={onClose}
            >
              ×
            </button>
          </div>
        </div>
        
        {/* コンテンツ */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 実施日時・方法 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                実施日 <span className="text-red-500">*</span>
              </label>
              <input 
                type="date" 
                value={todayStr} 
                disabled 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">前回の達成度評価日</label>
              <input 
                type="date" 
                value={prevEvalDate || ''} 
                disabled 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
              />
            </div>
          </div>

          {/* 実施時間 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">実施時間（開始）</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">実施時間（終了）</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
          
          {/* 実施方法 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              実施方法 <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input 
                  type="radio" 
                  name="method" 
                  value="通所" 
                  checked={method === '通所'} 
                  onChange={() => setMethod('通所')} 
                  className="mr-2 text-purple-600 focus:ring-purple-500"
                />
                通所
              </label>
              <label className="flex items-center">
                <input 
                  type="radio" 
                  name="method" 
                  value="訪問" 
                  checked={method === '訪問'} 
                  onChange={() => setMethod('訪問')} 
                  className="mr-2 text-purple-600 focus:ring-purple-500"
                />
                訪問
              </label>
              <label className="flex items-center">
                <input 
                  type="radio" 
                  name="method" 
                  value="その他" 
                  checked={method === 'その他'} 
                  onChange={() => setMethod('その他')} 
                  className="mr-2 text-purple-600 focus:ring-purple-500"
                />
                その他
              </label>
            </div>
            {method === 'その他' && (
              <input 
                type="text" 
                value={otherMethod} 
                onChange={e => setOtherMethod(e.target.value)} 
                placeholder="実施方法の詳細を入力" 
                className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            )}
          </div>
          
          {/* 訓練目標 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              訓練目標
              <button 
                type="button" 
                className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition-all duration-200"
                onClick={() => handleAi('trainingGoal', setTrainingGoal)}
              >
                🤖 AI提案
              </button>
            </label>
            <p className="text-xs text-gray-500 mb-2">※ 在宅就労による支援効果を達成するために掲げた、当該月の具体的な目標を記載</p>
            <textarea 
              value={trainingGoal} 
              onChange={e => setTrainingGoal(e.target.value)} 
              rows={3} 
              placeholder="例：HTML/CSSの基礎スキルを習得し、簡単なWebページを作成できるようになる" 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
          </div>
          
          {/* 取組内容 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              取組内容
              <button 
                type="button" 
                className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition-all duration-200"
                onClick={() => handleAi('workContent', setWorkContent)}
              >
                🤖 AI提案
              </button>
            </label>
            <p className="text-xs text-gray-500 mb-2">※ 上記目標を達成するために行った、作業内容や支援内容を記載</p>
            <textarea 
              value={workContent} 
              onChange={e => setWorkContent(e.target.value)} 
              rows={4} 
              placeholder="例：HTMLタグの学習、CSSレイアウトの実習、簡単なポートフォリオサイトの作成..." 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
          </div>
          
          {/* 訓練目標に対する達成度 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              訓練目標に対する達成度
              <button 
                type="button" 
                className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition-all duration-200"
                onClick={() => handleAi('achievement', setAchievement)}
              >
                🤖 AI提案
              </button>
            </label>
            <p className="text-xs text-gray-500 mb-2">※ 上記目標に対し、達成できたこと、できなかったことを具体的に記載</p>
            <textarea 
              value={achievement} 
              onChange={e => setAchievement(e.target.value)} 
              rows={4} 
              placeholder="例：基本的なHTMLタグは習得できた。CSSレイアウトは理解が進んだが、実践ではまだ時間がかかる..." 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
          </div>
          
          {/* 課題 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              課題
              <button 
                type="button" 
                className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition-all duration-200"
                onClick={() => handleAi('issues', setIssues)}
              >
                🤖 AI提案
              </button>
            </label>
            <p className="text-xs text-gray-500 mb-2">※ 達成できなかった内容を分析し、課題を抽出</p>
            <textarea 
              value={issues} 
              onChange={e => setIssues(e.target.value)} 
              rows={3} 
              placeholder="例：CSSの応用的な使い方について理解が不足している。作業時間の管理がまだ不十分..." 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
          </div>
          
          {/* 今後における課題の改善方針 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              今後における課題の改善方針
              <button 
                type="button" 
                className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition-all duration-200"
                onClick={() => handleAi('improvementPlan', setImprovementPlan)}
              >
                🤖 AI提案
              </button>
            </label>
            <p className="text-xs text-gray-500 mb-2">※ 上記課題を克服するための、来月以降の目標設定の方向性や作業内容及び支援内容を記載</p>
            <textarea 
              value={improvementPlan} 
              onChange={e => setImprovementPlan(e.target.value)} 
              rows={4} 
              placeholder="例：来月はCSS応用編の学習に重点を置く。タスク管理ツールを導入して作業時間を記録する..." 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
          </div>
          
          {/* 健康・体調面での留意事項 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              健康・体調面での留意事項
              <button 
                type="button" 
                className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition-all duration-200"
                onClick={() => handleAi('healthNotes', setHealthNotes)}
              >
                🤖 AI提案
              </button>
            </label>
            <p className="text-xs text-gray-500 mb-2">※ 在宅就労の継続の妥当性を判断するうえで考慮すべき事項を記載</p>
            <textarea 
              value={healthNotes} 
              onChange={e => setHealthNotes(e.target.value)} 
              rows={3} 
              placeholder="例：体調は概ね良好。時々頭痛があるため、適度な休憩を推奨..." 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
          </div>
          
          {/* その他特記事項 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              その他特記事項
            </label>
            <textarea 
              value={otherNotes} 
              onChange={e => setOtherNotes(e.target.value)} 
              rows={3} 
              placeholder="その他、特記すべき事項があれば記載してください" 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
          </div>
          
          {/* 在宅就労継続の妥当性 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              在宅就労継続の妥当性 <span className="text-red-500">*</span>
              <button 
                type="button" 
                className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition-all duration-200"
                onClick={() => handleAi('continuityValidity', setContinuityValidity)}
              >
                🤖 AI提案
              </button>
            </label>
            <p className="text-xs text-gray-500 mb-2">※ 上記記載事項を総合的に勘案し、今後も在宅就労による支援効果が見込まれるかを慎重に検討し判断</p>
            <textarea 
              value={continuityValidity} 
              onChange={e => setContinuityValidity(e.target.value)} 
              rows={4} 
              placeholder="例：訓練目標の達成度は良好であり、健康状態も安定している。引き続き在宅での支援を継続することが妥当と判断する..." 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
          </div>
          
          {/* 評価実施者 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              評価実施者 <span className="text-red-500">*</span>
            </label>
            <select 
              value={evaluator} 
              onChange={e => setEvaluator(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {instructorList.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>

          {/* 対象者署名（確認欄） */}
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              対象者署名（確認欄）
            </label>
            <p className="text-xs text-gray-600 mb-3">上記内容を確認し、評価実施者と共有しました。</p>
            <input
              type="text"
              value={studentSignature}
              onChange={e => setStudentSignature(e.target.value)}
              placeholder="対象者名を入力してください"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
        
        {/* フッター */}
        <div className="p-6 border-t border-gray-200 flex gap-4">
          <button 
            className="flex-1 px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            onClick={handleSave}
          >
            💾 保存
          </button>
          <button 
            className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200"
            onClick={onClose}
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
};

export default MonthlyEvaluationModal;
