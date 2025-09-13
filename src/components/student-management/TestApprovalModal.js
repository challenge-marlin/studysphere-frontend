import React, { useState, useEffect } from 'react';
import { getPendingApprovals, approveTest } from '../../utils/api';

const TestApprovalModal = ({ 
  isOpen, 
  onClose, 
  student, 
  satelliteId,
  onApprovalSuccess 
}) => {
  const [pendingTests, setPendingTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState(false);
  const [error, setError] = useState(null);

  // 未承認の合格テストを取得
  const fetchPendingTests = async () => {
    if (!satelliteId || !student) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await getPendingApprovals(satelliteId);
      if (response.success) {
        // 選択された学生のテストのみをフィルタリング
        const studentTests = response.data.filter(test => test.user_id === student.id);
        setPendingTests(studentTests);
      } else {
        setError('未承認テストの取得に失敗しました');
      }
    } catch (error) {
      console.error('未承認テスト取得エラー:', error);
      setError('未承認テストの取得中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  // テスト承認処理
  const handleApproveTest = async (test) => {
    if (!window.confirm(`${test.lesson_name}のテスト合格を承認しますか？`)) {
      return;
    }

    setApproving(true);
    setError(null);

    try {
      const response = await approveTest(test.exam_result_id, test.user_id, test.lesson_id);
      if (response.success) {
        alert(response.message);
        // 承認成功後、リストを更新
        await fetchPendingTests();
        // 親コンポーネントに通知
        onApprovalSuccess && onApprovalSuccess();
      } else {
        setError(response.message || '承認に失敗しました');
      }
    } catch (error) {
      console.error('テスト承認エラー:', error);
      setError('承認処理中にエラーが発生しました');
    } finally {
      setApproving(false);
    }
  };

  // モーダルが開かれた時にデータを取得
  useEffect(() => {
    if (isOpen && student && satelliteId) {
      fetchPendingTests();
    }
  }, [isOpen, student, satelliteId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-gray-800">
              📝 合格承認 - {student?.name}
            </h3>
            <button 
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all duration-200"
              onClick={onClose}
            >
              ×
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <span className="text-red-500 mr-2">⚠️</span>
                <span className="text-red-700">{error}</span>
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <div className="text-lg text-gray-600">読み込み中...</div>
            </div>
          ) : pendingTests.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">✅</div>
              <h4 className="text-xl font-semibold text-gray-800 mb-2">
                未承認の合格テストはありません
              </h4>
              <p className="text-gray-600">
                {student?.name}さんの未承認の合格テストは現在ありません。
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <span className="text-blue-500 mr-2">💡</span>
                  <div>
                    <h4 className="font-semibold text-blue-800">承認について</h4>
                    <p className="text-blue-700 text-sm mt-1">
                      提出物がないレッスン：承認で完了<br />
                      提出物があるレッスン：テスト承認＋提出物承認の両方で完了
                    </p>
                  </div>
                </div>
              </div>

              {pendingTests.map((test) => (
                <div key={test.exam_result_id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-semibold text-gray-800">
                          {test.lesson_name}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          test.test_type === 'lesson' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {test.test_type === 'lesson' ? '総合テスト' : 'セクションテスト'}
                        </span>
                        {test.has_assignment && (
                          <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                            提出物あり
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">得点:</span>
                          <span className="ml-1">{test.score}/{test.total_questions}</span>
                        </div>
                        <div>
                          <span className="font-medium">正答率:</span>
                          <span className="ml-1">{test.percentage}%</span>
                        </div>
                        <div>
                          <span className="font-medium">受験日:</span>
                          <span className="ml-1">
                            {new Date(test.exam_date).toLocaleDateString('ja-JP')}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">ステータス:</span>
                          <span className="ml-1 text-green-600 font-medium">合格</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-4">
                      <button
                        onClick={() => handleApproveTest(test)}
                        disabled={approving}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
                      >
                        {approving ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            承認中...
                          </>
                        ) : (
                          <>
                            ✅ 承認
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200"
            >
              閉じる
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestApprovalModal;
