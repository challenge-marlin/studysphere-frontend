import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentVoiceCareView from '../components/StudentVoiceCareView';
import CertificateList from '../components/CertificateList';
import { fetchStudentCourses } from '../utils/studentApi';
import { useAuth } from '../components/contexts/AuthContext';

const Dashboard = ({ onTabChange }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 認証情報の確認
        if (!currentUser) {
          setError('認証情報が無効です。ログインし直してください。');
          setLoading(false);
          return;
        }
        
        // 利用者の受講コースを取得
        const coursesResponse = await fetchStudentCourses();
        if (coursesResponse.success) {
          setEnrolledCourses(coursesResponse.data);
        }
      } catch (error) {
        console.error('ダッシュボードデータの取得に失敗しました:', error);
        setError('データの取得に失敗しました。ページを再読み込みしてください。');
      } finally {
        setLoading(false);
      }
    };
    
    loadDashboardData();
  }, [currentUser]);


  const handleViewCourse = (courseId) => {
    // レッスン一覧のタブに移動し、特定のコースを選択状態にする
    if (onTabChange) {
      onTabChange('lessons', courseId);
    }
  };

  const handleStartCourse = async (courseId) => {
    try {
      // 現在受講中のレッスンを取得
      const currentLessonResponse = await fetch(`http://localhost:5050/api/learning/current-lesson?courseId=${courseId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (currentLessonResponse.ok) {
        const currentLessonData = await currentLessonResponse.json();
        if (currentLessonData.success && currentLessonData.data.length > 0) {
          const currentLesson = currentLessonData.data[0];
          console.log(`🎯 現在受講中レッスン: レッスンID ${currentLesson.lesson_id}, コースID ${courseId}`);
          
          // 学習画面に遷移（進捗更新は不要、既にin_progress状態）
          navigate(`/student/enhanced-learning?course=${courseId}&lesson=${currentLesson.lesson_id}`);
          return;
        }
      }

      // 現在受講中のレッスンがない場合は、利用者のコース情報を取得
      const response = await fetch(`http://localhost:5050/api/learning/progress/${currentUser.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.length > 0) {
          // 指定されたコースを検索
          const targetCourse = data.data.find(course => course.course_id === courseId);
          if (targetCourse && targetCourse.lessons && targetCourse.lessons.length > 0) {
            // 最初のレッスンまたは未完了のレッスンを取得
            const firstLesson = targetCourse.lessons.find(lesson => 
              lesson.status !== 'completed'
            ) || targetCourse.lessons[0];
            
            // 学習開始時に進捗を更新
            try {
              await fetch('http://localhost:5050/api/learning/progress/lesson', {
                method: 'PUT',
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  userId: parseInt(currentUser.id),
                  lessonId: parseInt(firstLesson.id),
                  status: 'in_progress'
                  // testScoreとassignmentSubmittedは指定せず、既存の値を保持
                })
              });
            } catch (error) {
              console.error('学習進捗更新エラー:', error);
            }
            
            // 学習画面に遷移
            navigate(`/student/enhanced-learning?course=${courseId}&lesson=${firstLesson.id}`);
            return;
          }
        }
      }
      
      // 学習データが存在しない場合は、新たに作成
      try {
        // 利用者とコースの関連付けを作成
        const createUserCourseResponse = await fetch('http://localhost:5050/api/learning/assign-course', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: parseInt(currentUser.id),
            courseId: parseInt(courseId)
          })
        });

        if (createUserCourseResponse.ok) {
          const createData = await createUserCourseResponse.json();
          if (createData.success) {
            // 作成成功後、再度コース情報を取得して学習画面に遷移
            const retryResponse = await fetch(`http://localhost:5050/api/learning/progress/${currentUser.id}`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                'Content-Type': 'application/json'
              }
            });

            if (retryResponse.ok) {
              const retryData = await retryResponse.json();
              if (retryData.success && retryData.data.length > 0) {
                const targetCourse = retryData.data.find(course => course.course_id === courseId);
                if (targetCourse && targetCourse.lessons && targetCourse.lessons.length > 0) {
                  const firstLesson = targetCourse.lessons[0];
                  
                  // 最初のレッスンを学習中に設定
                  await fetch('http://localhost:5050/api/learning/progress/lesson', {
                    method: 'PUT',
                    headers: {
                      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                      userId: parseInt(currentUser.id),
                      lessonId: parseInt(firstLesson.id),
                      status: 'in_progress'
                      // testScoreとassignmentSubmittedは指定せず、既存の値を保持
                    })
                  });
                  
                  navigate(`/student/enhanced-learning?course=${courseId}&lesson=${firstLesson.id}`);
                  return;
                }
              }
            }
          }
        }
      } catch (createError) {
        console.error('学習データ作成エラー:', createError);
      }
      
      // データ作成に失敗した場合は、学習進捗画面に遷移
      alert('学習データの作成に失敗しました。学習進捗画面でコースを確認してください。');
      if (onTabChange) {
        onTabChange('learning');
      }
      
    } catch (error) {
      console.error('学習開始エラー:', error);
      alert('学習開始に失敗しました。学習進捗画面でコースを確認してください。');
      if (onTabChange) {
        onTabChange('learning');
      }
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-blue-600 text-xl font-semibold">読み込み中...</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-blue-600 text-xl font-semibold">データを読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl font-semibold mb-4">{error}</div>
          <div className="space-y-4">
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-200 mr-4"
            >
              ページを再読み込み
            </button>
            <button 
              onClick={() => window.location.href = '/student-login'} 
              className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all duration-200"
            >
              ログインページへ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
            ダッシュボード
          </h2>
          <p className="text-lg text-gray-600">おかえりなさい、{currentUser.name}さん！学習を続けましょう。</p>
        </div>

        {/* 声かけセクション */}
        <StudentVoiceCareView 
          studentId={currentUser.id} 
          studentName={currentUser.name} 
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 受講可能なコースセクション */}
          <section className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-6">📚 受講可能コース</h3>
            <div className="space-y-4">
              {enrolledCourses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-lg mb-2">受講可能なコースがありません</p>
                  <p className="text-sm">管理者にお問い合わせください</p>
                </div>
              ) : (
                enrolledCourses.map((course) => (
                  <div key={course.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-800">{course.title}</h4>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {course.category || '未分類'}
                        </span>
                                              {Number(course.progress_percentage || 0) === 100 && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          ✅ 修了
                        </span>
                      )}
                      </div>
                    </div>
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>進捗: {course.progress_percentage || 0}%</span>
                        <span>{course.completed_lessons || 0}/{course.total_lessons || 0} レッスン完了</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            Number(course.progress_percentage || 0) === 100 
                              ? 'bg-gradient-to-r from-green-400 to-green-600' 
                              : 'bg-gradient-to-r from-blue-400 to-cyan-600'
                          }`}
                          style={{ width: `${Number(course.progress_percentage || 0)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-200"
                        onClick={() => handleViewCourse(course.id)}
                      >
                        詳細を見る
                      </button>
                                          {Number(course.progress_percentage || 0) === 0 ? (
                      <button 
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-medium transition-all duration-200"
                        onClick={() => handleStartCourse(course.id)}
                      >
                        学習開始
                      </button>
                    ) : (
                      <button 
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg font-medium transition-all duration-200"
                        onClick={() => handleStartCourse(course.id)}
                      >
                        続きから
                      </button>
                    )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* 終了証の確認 */}
          <CertificateList />
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 