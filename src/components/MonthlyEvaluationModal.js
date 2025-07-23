import React, { useState } from 'react';

const instructorList = [
  '佐藤指導員',
  '田中指導員',
  '山田指導員',
  '鈴木指導員',
];

const todayStr = new Date().toISOString().split('T')[0];

const MonthlyEvaluationModal = ({
  isOpen,
  onClose,
  onSave,
  prevEvalDate,
  defaultInstructor,
  aiAssist,
}) => {
  const [method, setMethod] = useState('通所');
  const [otherMethod, setOtherMethod] = useState('');
  const [goal, setGoal] = useState('');
  const [work, setWork] = useState('');
  const [achievement, setAchievement] = useState('');
  const [issue, setIssue] = useState('');
  const [improve, setImprove] = useState('');
  const [health, setHealth] = useState('');
  const [note, setNote] = useState('');
  const [validity, setValidity] = useState('');
  const [instructor, setInstructor] = useState(defaultInstructor || instructorList[0]);

  const handleAi = async (field, setter) => {
    if (aiAssist) {
      const suggestion = await aiAssist({
        type: 'monthly',
        field,
        prevEvalDate,
        instructor,
      });
      setter(suggestion || '');
    }
  };

  const handleSave = () => {
    onSave && onSave({
      evalDate: todayStr,
      prevEvalDate,
      method: method === 'その他' ? otherMethod : method,
      goal,
      work,
      achievement,
      issue,
      improve,
      health,
      note,
      validity,
      instructor,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">月次評価（在宅における就労達成度評価シート）</h2>
            <button 
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all duration-200"
              onClick={onClose}
            >
              ×
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">評価実施日</label>
            <input 
              type="date" 
              value={todayStr} 
              disabled 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">実施方法</label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input 
                  type="radio" 
                  name="method" 
                  value="通所" 
                  checked={method === '通所'} 
                  onChange={() => setMethod('通所')} 
                  className="mr-2 text-green-600 focus:ring-green-500"
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
                  className="mr-2 text-green-600 focus:ring-green-500"
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
                  className="mr-2 text-green-600 focus:ring-green-500"
                />
                その他
              </label>
            </div>
            {method === 'その他' && (
              <input 
                type="text" 
                value={otherMethod} 
                onChange={e => setOtherMethod(e.target.value)} 
                placeholder="方法を入力" 
                className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">訓練目標</label>
            <div className="flex gap-2">
              <textarea 
                value={goal} 
                onChange={e => setGoal(e.target.value)} 
                rows={3} 
                placeholder="訓練目標を入力" 
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              />
              <button 
                type="button" 
                className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all duration-200 text-sm font-medium"
                onClick={() => handleAi('goal', setGoal)}
              >
                AIアシスト
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">取組内容</label>
            <div className="flex gap-2">
              <textarea 
                value={work} 
                onChange={e => setWork(e.target.value)} 
                rows={3} 
                placeholder="取組内容を入力" 
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              />
              <button 
                type="button" 
                className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all duration-200 text-sm font-medium"
                onClick={() => handleAi('work', setWork)}
              >
                AIアシスト
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">訓練目標に対する達成度</label>
            <div className="flex gap-2">
              <textarea 
                value={achievement} 
                onChange={e => setAchievement(e.target.value)} 
                rows={3} 
                placeholder="達成度を入力" 
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              />
              <button 
                type="button" 
                className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all duration-200 text-sm font-medium"
                onClick={() => handleAi('achievement', setAchievement)}
              >
                AIアシスト
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">課題</label>
            <div className="flex gap-2">
              <textarea 
                value={issue} 
                onChange={e => setIssue(e.target.value)} 
                rows={3} 
                placeholder="課題を入力" 
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              />
              <button 
                type="button" 
                className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all duration-200 text-sm font-medium"
                onClick={() => handleAi('issue', setIssue)}
              >
                AIアシスト
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">今後の課題改善方針</label>
            <div className="flex gap-2">
              <textarea 
                value={improve} 
                onChange={e => setImprove(e.target.value)} 
                rows={3} 
                placeholder="改善方針を入力" 
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              />
              <button 
                type="button" 
                className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all duration-200 text-sm font-medium"
                onClick={() => handleAi('improve', setImprove)}
              >
                AIアシスト
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">健康・体調面での留意事項</label>
            <div className="flex gap-2">
              <textarea 
                value={health} 
                onChange={e => setHealth(e.target.value)} 
                rows={3} 
                placeholder="健康・体調面での留意事項を入力" 
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              />
              <button 
                type="button" 
                className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all duration-200 text-sm font-medium"
                onClick={() => handleAi('health', setHealth)}
              >
                AIアシスト
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">その他特記事項</label>
            <div className="flex gap-2">
              <textarea 
                value={note} 
                onChange={e => setNote(e.target.value)} 
                rows={3} 
                placeholder="特記事項を入力" 
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              />
              <button 
                type="button" 
                className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all duration-200 text-sm font-medium"
                onClick={() => handleAi('note', setNote)}
              >
                AIアシスト
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">在宅就労継続の妥当性</label>
            <div className="flex gap-2">
              <textarea 
                value={validity} 
                onChange={e => setValidity(e.target.value)} 
                rows={3} 
                placeholder="妥当性を入力" 
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              />
              <button 
                type="button" 
                className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all duration-200 text-sm font-medium"
                onClick={() => handleAi('validity', setValidity)}
              >
                AIアシスト
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">評価実施者</label>
            <select 
              value={instructor} 
              onChange={e => setInstructor(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {instructorList.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
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
        
        <div className="p-6 border-t border-gray-200 flex gap-4">
          <button 
            className="flex-1 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            onClick={handleSave}
          >
            保存
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