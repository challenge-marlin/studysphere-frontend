import React, { useState } from 'react';

const instructorList = [
  '佐藤指導員',
  '田中指導員',
  '山田指導員',
  '鈴木指導員',
];

const todayStr = new Date().toISOString().split('T')[0];

const WeeklyEvaluationModal = ({
  isOpen,
  onClose,
  onSave,
  prevEvalDate,
  defaultPeriod,
  defaultInstructor,
  aiAssist,
}) => {
  const [method, setMethod] = useState('通所');
  const [otherMethod, setOtherMethod] = useState('');
  const [period, setPeriod] = useState(defaultPeriod || { start: '', end: '' });
  const [content, setContent] = useState('');
  const [instructor, setInstructor] = useState(defaultInstructor || instructorList[0]);

  const handleAiAssist = async () => {
    if (aiAssist) {
      const suggestion = await aiAssist({
        type: 'weekly',
        period,
        prevEvalDate,
        instructor,
      });
      setContent(suggestion || '');
    }
  };

  const handleSave = () => {
    onSave && onSave({
      evalDate: todayStr,
      prevEvalDate,
      method: method === 'その他' ? otherMethod : method,
      period,
      content,
      instructor,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">週次評価（在宅における就労支援記録・評価）</h2>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">前回評価日</label>
            <input 
              type="date" 
              value={prevEvalDate || ''} 
              disabled 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">評価方法</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">対象期間</label>
            <div className="flex items-center gap-4">
              <input 
                type="date" 
                value={period.start} 
                onChange={e => setPeriod(p => ({...p, start: e.target.value}))} 
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <span className="text-gray-500">～</span>
              <input 
                type="date" 
                value={period.end} 
                onChange={e => setPeriod(p => ({...p, end: e.target.value}))} 
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">評価内容</label>
            <div className="flex gap-2">
              <textarea 
                value={content} 
                onChange={e => setContent(e.target.value)} 
                rows={6} 
                placeholder="評価内容を入力してください" 
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              />
              <button 
                type="button" 
                className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all duration-200 text-sm font-medium"
                onClick={handleAiAssist}
              >
                AIアシスト
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">記録者</label>
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

export default WeeklyEvaluationModal; 