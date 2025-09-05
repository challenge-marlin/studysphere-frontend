import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LearningProgress = ({ userId }) => {
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        setLoading(true);
        setError(null);

                 const response = await fetch(`http://localhost:5050/api/learning/progress/${userId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('学習進捗の取得に失敗しました');
        }

        const data = await response.json();
        if (data.success) {
          setProgressData(data.data);
        } else {
          throw new Error(data.message || '学習進捗の取得に失敗しました');
        }
      } catch (error) {
        console.error('学習進捗取得エラー:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchProgress();
    }
  }, [userId]);

  const handleCourseClick = (courseId) => {
    navigate(`/student/learning?course=${courseId}`);
  };

  const handleStartLearning = async (courseId, lessons) => {
    if (lessons && lessons.length > 0) {
      const firstLesson = lessons[0];
      
      // 学習開始時に進捗を更新
      try {
        const userId = localStorage.getItem('userId') || '1';
        
                     await fetch('http://localhost:5050/api/learning/progress/lesson', {
               method: 'PUT',
               headers: {
                 'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                 'Content-Type': 'application/json'
               },
               body: JSON.stringify({
                 userId: parseInt(userId),
                 lessonId: parseInt(firstLesson.id),
                 status: 'in_progress',
                 testScore: null,
                 assignmentSubmitted: false
               })
             });
      } catch (error) {
        console.error('学習進捗更新エラー:', error);
      }
      
      // 学習画面に遷移
      navigate(`/student/enhanced-learning?course=${courseId}&lesson=${firstLesson.id}`);
    } else {
      // レッスンがない場合はコースのみ指定
      navigate(`/student/enhanced-learning?course=${courseId}`);
    }
  };

  const handleLessonClick = (courseId, lessonId) => {
    navigate(`/student/learning?course=${courseId}&lesson=${lessonId}`);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-2 text-gray-600">進捗を読み込み中...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-red-600">
          <p className="mb-2">エラーが発生しました</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!progressData || progressData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-gray-600">
          <p className="mb-2">学習中のコースがありません</p>
          <p className="text-sm">コースを選択して学習を開始してください</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">学習進捗</h2>
      
      <div className="space-y-6">
        {progressData.map((course) => (
          <div key={course.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {course.course_title}
                </h3>
                <p className="text-sm text-gray-600">{course.course_description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {course.course_category} • {course.total_lessons}レッスン
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-indigo-600">
                  {course.progress_percentage}%
                </div>
                <div className="text-sm text-gray-500">
                  {course.completed_lessons}/{course.total_lessons}完了
                </div>
              </div>
            </div>

            {/* プログレスバー */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${course.progress_percentage}%` }}
              ></div>
            </div>

            {/* レッスン一覧 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {course.lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                    lesson.status === 'completed'
                      ? 'bg-green-50 border-green-200 hover:bg-green-100'
                      : lesson.status === 'in_progress'
                      ? 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                  onClick={() => handleLessonClick(course.course_id, lesson.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-800 truncate">
                        {lesson.title}
                      </h4>
                      <p className="text-xs text-gray-600 mt-1">
                        第{lesson.order_index}回
                      </p>
                    </div>
                    <div className="ml-2">
                      {lesson.status === 'completed' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ✓ 完了
                        </span>
                      )}
                      {lesson.status === 'in_progress' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          🔄 学習中
                        </span>
                      )}
                      {lesson.status === 'not_started' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          ⏳ 未開始
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {lesson.test_score !== null && (
                    <div className="mt-2 text-xs text-gray-600">
                      テストスコア: {lesson.test_score}点
                    </div>
                  )}
                  
                  {lesson.assignment_submitted && (
                    <div className="mt-1 text-xs text-green-600">
                      ✓ 課題提出済み
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* コース全体のアクション */}
            <div className="mt-4 flex justify-between items-center">
              <div className="flex gap-3">
                <button
                  onClick={() => handleCourseClick(course.course_id)}
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                >
                  コース詳細を見る →
                </button>
                <button
                  onClick={() => handleStartLearning(course.course_id, course.lessons)}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium"
                >
                  📖 学習開始
                </button>
              </div>
              
              {course.progress_percentage === 100 && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  🎉 コース完了！
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 全体統計 */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">
              {progressData.length}
            </div>
            <div className="text-sm text-gray-600">学習中コース</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {progressData.reduce((sum, course) => sum + course.completed_lessons, 0)}
            </div>
            <div className="text-sm text-gray-600">完了レッスン</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {progressData.reduce((sum, course) => sum + course.total_lessons, 0)}
            </div>
            <div className="text-sm text-gray-600">総レッスン数</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(
                progressData.reduce((sum, course) => sum + course.progress_percentage, 0) / progressData.length
              )}%
            </div>
            <div className="text-sm text-gray-600">平均進捗率</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningProgress;
