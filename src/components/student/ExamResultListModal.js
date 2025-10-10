import React, { useState, useEffect } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5050';

const ExamResultListModal = ({ isOpen, onClose, lesson, onViewDetail }) => {
  const [examResults, setExamResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && lesson) {
      loadExamResults();
    }
  }, [isOpen, lesson]);

  const loadExamResults = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${API_BASE_URL}/api/test/learning/exam-results/${lesson.id}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('試験結果の取得に失敗しました');
      }

      const data = await response.json();
      
      if (data.success) {
        setExamResults(data.data || []);
      } else {
        throw new Error(data.message || '試験結果の取得に失敗しました');
      }
    } catch (err) {
      console.error('試験結果一覧取得エラー:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (result) => {
    onViewDetail(result);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold mb-2">📝 試験結果一覧</h2>
              <p className="text-blue-100">{lesson?.title}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-3xl font-bold transition-colors"
            >
              ×
            </button>
          </div>
        </div>

        {/* コンテンツ */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {loading && (
            <div className="text-center py-12">
              <div className="text-blue-600 text-xl font-semibold mb-2">読み込み中...</div>
              <div className="text-gray-500">試験結果を取得しています</div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-4">
              <div className="font-semibold mb-1">エラー</div>
              <div>{error}</div>
            </div>
          )}

          {!loading && !error && examResults.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📄</div>
              <div className="text-gray-600 text-lg font-semibold mb-2">
                試験結果がありません
              </div>
              <div className="text-gray-500">
                このレッスンの試験結果はまだ保存されていません。
              </div>
            </div>
          )}

          {!loading && !error && examResults.length > 0 && (
            <div className="space-y-4">
              {examResults.map((result, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-5 border border-blue-200 hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm font-medium">
                          {result.testType === 'lesson' ? '📝 総合テスト' : '📋 セクションテスト'}
                        </span>
                        <span className="text-gray-600 text-sm">
                          受験日時: {result.displayTime}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleViewDetail(result)}
                      className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                    >
                      詳細を見る
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="bg-gray-50 p-4 flex justify-end border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-medium transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamResultListModal;

