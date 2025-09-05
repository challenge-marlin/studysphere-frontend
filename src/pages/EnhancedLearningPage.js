// このファイルは無効化されました。新しいリファクタリング版を使用してください。
// 新しいコンポーネント: EnhancedLearningPageRefactored
// 場所: src/components/learning/EnhancedLearningPageRefactored.js

import React from 'react';
import { useNavigate } from 'react-router-dom';

const EnhancedLearningPage = () => {
  const navigate = useNavigate();
  
  // このコンポーネントは無効化されました
  // 新しいリファクタリング版を使用してください
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
      <div className="text-center max-w-2xl mx-auto p-8">
        <div className="text-amber-600 text-6xl mb-6">⚠️</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          このコンポーネントは無効化されました
        </h1>
        <p className="text-gray-600 mb-6">
          学習画面のコンポーネント分割により、このファイルは無効化されました。
          新しいリファクタリング版のコンポーネントが作成されています。
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
          <h2 className="font-semibold text-blue-800 mb-2">新しいコンポーネント情報:</h2>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• ファイル名: EnhancedLearningPageRefactored.js</li>
            <li>• 場所: src/components/learning/</li>
            <li>• 機能: 分割されたコンポーネントを使用した学習画面</li>
            <li>• 行数: 約400行（元の1179行から大幅削減）</li>
          </ul>
        </div>
        <button 
          onClick={() => navigate('/student/dashboard')}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
        >
          ダッシュボードに戻る
        </button>
      </div>
    </div>
  );
};

export default EnhancedLearningPage; 