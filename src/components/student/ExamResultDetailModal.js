import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { API_BASE_URL } from '../../config/apiConfig';

const ExamResultDetailModal = ({ isOpen, onClose, resultKey }) => {
  const [markdownContent, setMarkdownContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && resultKey) {
      loadExamResultDetail();
    }
  }, [isOpen, resultKey]);

  const loadExamResultDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${API_BASE_URL}/api/test/learning/exam-result-detail?key=${encodeURIComponent(resultKey)}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('試験結果詳細の取得に失敗しました');
      }

      const data = await response.json();
      
      if (data.success) {
        setMarkdownContent(data.data.content || '');
      } else {
        throw new Error(data.message || '試験結果詳細の取得に失敗しました');
      }
    } catch (err) {
      console.error('試験結果詳細取得エラー:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">📋 試験結果詳細</h2>
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
              <div className="text-green-600 text-xl font-semibold mb-2">読み込み中...</div>
              <div className="text-gray-500">試験結果詳細を取得しています</div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-4">
              <div className="font-semibold mb-1">エラー</div>
              <div>{error}</div>
            </div>
          )}

          {!loading && !error && markdownContent && (
            <div className="prose prose-lg max-w-none">
              <ReactMarkdown
                components={{
                  // Markdownのスタイルをカスタマイズ
                  h1: ({node, ...props}) => <h1 className="text-3xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-blue-500" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-2xl font-bold text-gray-800 mt-6 mb-3 pb-2 border-b border-gray-300" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-2" {...props} />,
                  p: ({node, ...props}) => <p className="text-gray-700 mb-3 leading-relaxed" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc list-inside mb-4 space-y-1" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-4 space-y-1" {...props} />,
                  li: ({node, ...props}) => <li className="text-gray-700 ml-4" {...props} />,
                  strong: ({node, ...props}) => <strong className="font-semibold text-gray-900" {...props} />,
                  hr: ({node, ...props}) => <hr className="my-6 border-t-2 border-gray-300" {...props} />,
                  blockquote: ({node, ...props}) => (
                    <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-700 my-4" {...props} />
                  ),
                  code: ({node, inline, ...props}) => 
                    inline ? (
                      <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono text-red-600" {...props} />
                    ) : (
                      <code className="block bg-gray-100 p-4 rounded-lg text-sm font-mono overflow-x-auto" {...props} />
                    )
                }}
              >
                {markdownContent}
              </ReactMarkdown>
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

export default ExamResultDetailModal;

