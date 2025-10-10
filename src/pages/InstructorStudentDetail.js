import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/contexts/AuthContext';
import { API_BASE_URL } from '../config/apiConfig';

const InstructorStudentDetail = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [student, setStudent] = useState(null);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [showCertificate, setShowCertificate] = useState(false);
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    fetchStudentProgress();
  }, [studentId]);

  const fetchStudentProgress = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/learning/instructor/student/${studentId}/lesson-progress`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setStudent(result.data.student);
          setProgress(result.data.progress);
        } else {
          setError(result.message || '学生情報の取得に失敗しました');
        }
      } else {
        setError('学生情報の取得に失敗しました');
      }
    } catch (error) {
      console.error('学生進捗取得エラー:', error);
      setError('学生情報の取得中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveLesson = async (lessonId) => {
    try {
      setApproving(true);
      const response = await fetch(`${API_BASE_URL}/api/learning/instructor/student/${studentId}/lesson/${lessonId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          alert('レッスン完了を承認しました');
          fetchStudentProgress(); // データを再取得
        } else {
          alert(result.message || '承認に失敗しました');
        }
      } else {
        alert('承認に失敗しました');
      }
    } catch (error) {
      console.error('レッスン承認エラー:', error);
      alert('承認中にエラーが発生しました');
    } finally {
      setApproving(false);
    }
  };

  const handleViewCertificate = (lesson) => {
    setSelectedLesson(lesson);
    setShowCertificate(true);
  };

  const handleViewSubmission = (lesson) => {
    // 提出物確認機能（今後実装予定）
    alert(`提出物確認機能は今後実装予定です。\nレッスン: ${lesson.lesson_title}`);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">完了</span>;
      case 'in_progress':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">進行中</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">未開始</span>;
    }
  };

  const getTestScoreBadge = (score) => {
    if (score === null || score === undefined) {
      return <span className="text-gray-400">-</span>;
    }
    const color = score >= 80 ? 'green' : score >= 60 ? 'yellow' : 'red';
    return (
      <span className={`px-2 py-1 bg-${color}-100 text-${color}-800 text-xs rounded-full`}>
        {score}点
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-600 text-xl font-semibold">学生情報を読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl font-semibold mb-4">エラーが発生しました</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => navigate('/instructor/dashboard')}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            ダッシュボードに戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                className="px-4 py-2 bg-white bg-opacity-10 border border-white border-opacity-30 rounded-lg hover:bg-opacity-20 transition-all duration-200 font-medium"
                onClick={() => navigate('/instructor/dashboard')}
              >
                ← ダッシュボードに戻る
              </button>
              <div>
                <h1 className="text-2xl font-bold">学生詳細</h1>
                <span className="text-blue-100 text-sm">
                  {student?.name} ({student?.login_code})
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* コンテンツ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 学生情報 */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4">学生情報</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">名前</label>
              <p className="text-lg font-semibold text-gray-800">{student?.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">ログインコード</label>
              <p className="text-lg font-mono text-gray-800">{student?.login_code}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">メールアドレス</label>
              <p className="text-lg text-gray-800">{student?.email || '未設定'}</p>
            </div>
          </div>
        </div>

        {/* レッスン進捗 */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6">レッスン進捗</h2>
          
          {progress.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">レッスン進捗がありません</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">レッスン</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">コース</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">進捗</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">テストスコア</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">課題提出</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">完了日時</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {progress.map((lesson) => (
                    <tr key={lesson.lesson_id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-gray-800">{lesson.lesson_title}</div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{lesson.course_title}</td>
                      <td className="py-3 px-4 text-center">{getStatusBadge(lesson.status)}</td>
                      <td className="py-3 px-4 text-center">{getTestScoreBadge(lesson.test_score)}</td>
                      <td className="py-3 px-4 text-center">
                        {lesson.assignment_submitted ? (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">提出済み</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center text-sm text-gray-600">
                        {lesson.completed_at ? new Date(lesson.completed_at).toLocaleDateString('ja-JP') : '-'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex gap-2 justify-center">
                          {/* レッスンテストで合格している場合のみ終了証表示ボタンを表示 */}
                          {lesson.status === 'completed' && lesson.test_score >= 29 && (
                            <button
                              className="px-3 py-1 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs rounded-lg font-medium hover:shadow-lg transition-all duration-200"
                              onClick={() => handleViewCertificate(lesson)}
                            >
                              🏆 終了証
                            </button>
                          )}
                          {/* 提出物がある場合の確認ボタン */}
                          {lesson.assignment_submitted && (
                            <button
                              className="px-3 py-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs rounded-lg font-medium hover:shadow-lg transition-all duration-200"
                              onClick={() => handleViewSubmission(lesson)}
                            >
                              📄 提出物
                            </button>
                          )}
                          {/* テスト合格済みで未承認の場合のみ承認ボタンを表示 */}
                          {lesson.status === 'completed' && lesson.test_score >= 29 && !lesson.completed_at && (
                            <button
                              className="px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs rounded-lg font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                              onClick={() => handleApproveLesson(lesson.lesson_id)}
                              disabled={approving}
                            >
                              {approving ? '承認中...' : '✅ 承認'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 終了証モーダル */}
      {showCertificate && selectedLesson && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-800">修了証</h3>
                <button 
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all duration-200"
                  onClick={() => setShowCertificate(false)}
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">🏆</div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">修了証</h2>
                <p className="text-gray-600">この証書は、以下の学習を完了したことを証明します</p>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 mb-6">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{selectedLesson.lesson_title}</h3>
                  <p className="text-gray-600 mb-4">{selectedLesson.course_title}</p>
                  <div className="flex justify-center items-center gap-4 text-sm text-gray-600">
                    <span>受講者: {student?.name}</span>
                    <span>|</span>
                    <span>スコア: {selectedLesson.test_score}点</span>
                    <span>|</span>
                    <span>完了日: {new Date().toLocaleDateString('ja-JP')}</span>
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-4">
                  指導員による承認後、このレッスンが正式に完了となります
                </p>
                {selectedLesson.assignment_submitted && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-yellow-800">
                      ⚠️ このレッスンには提出物があります。提出物の確認も完了してから承認してください。
                    </p>
                  </div>
                )}
                <div className="flex gap-4 justify-center">
                  <button
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200"
                    onClick={() => setShowCertificate(false)}
                  >
                    閉じる
                  </button>
                  <button
                    className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200"
                    onClick={() => {
                      handleApproveLesson(selectedLesson.lesson_id);
                      setShowCertificate(false);
                    }}
                    disabled={approving}
                  >
                    {approving ? '承認中...' : '✅ 修了確認'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorStudentDetail;
