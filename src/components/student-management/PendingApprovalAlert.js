import React, { useState, useEffect } from 'react';
import { getPendingApprovals } from '../../utils/api';

const PendingApprovalAlert = ({ satelliteId, onApprovalClick }) => {
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 未承認の合格テストを取得
  const fetchPendingApprovals = async () => {
    if (!satelliteId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await getPendingApprovals(satelliteId);
      if (response.success) {
        setPendingApprovals(response.data);
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

  // コンポーネントマウント時とsatelliteId変更時にデータを取得
  useEffect(() => {
    if (satelliteId) {
      fetchPendingApprovals();
      
      // 5分間隔で自動更新
      const interval = setInterval(fetchPendingApprovals, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [satelliteId]);

  // 未承認のテストがない場合は何も表示しない
  if (!satelliteId || loading || error || pendingApprovals.length === 0) {
    return null;
  }

  // 学生ごとにグループ化
  const groupedByStudent = pendingApprovals.reduce((acc, approval) => {
    const studentId = approval.user_id;
    if (!acc[studentId]) {
      acc[studentId] = {
        student_name: approval.student_name,
        tests: []
      };
    }
    acc[studentId].tests.push(approval);
    return acc;
  }, {});

  return (
    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <span className="text-yellow-600 text-lg mr-2">⚠️</span>
          <h3 className="font-semibold text-yellow-800">
            未承認の合格テストがあります
          </h3>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="text-yellow-600 hover:text-yellow-800 text-sm"
        >
          🔄 更新
        </button>
      </div>
      
      <div className="space-y-2">
        {Object.entries(groupedByStudent).map(([studentId, studentData]) => (
          <div key={studentId} className="bg-white rounded-lg p-3 border border-yellow-200">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-gray-800 mb-1">
                  {studentData.student_name}さん
                </h4>
                <div className="space-y-1">
                  {studentData.tests.map((test) => (
                    <div key={test.exam_result_id} className="flex items-center gap-2 text-sm">
                      <span className="text-gray-600">
                        {test.lesson_name}のテスト合格が未承認です
                      </span>
                      {test.has_assignment && (
                        <span className="text-orange-600">
                          （提出物の承認も必要）
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={() => onApprovalClick && onApprovalClick(studentId)}
                className="ml-4 px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700 transition-colors"
              >
                承認する
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-3 text-xs text-yellow-700">
        💡 合格承認ボタンから個別に承認できます
      </div>
    </div>
  );
};

export default PendingApprovalAlert;
