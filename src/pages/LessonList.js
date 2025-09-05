import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/contexts/AuthContext';
import { fetchStudentCourses, fetchStudentLessons } from '../utils/studentApi';
import CourseHeader from '../components/student/CourseHeader';
import CourseSelector from '../components/student/CourseSelector';
import LessonTable from '../components/student/LessonTable';

const LessonList = ({ selectedCourseId }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // コース一覧を取得
  const loadCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetchStudentCourses();
      
      if (response.success) {
        setCourses(response.data);
        
        // selectedCourseIdが指定されている場合はそのコースを選択、そうでなければ最初のコースを選択
        if (selectedCourseId && response.data.length > 0) {
          const targetCourse = response.data.find(course => course.id === selectedCourseId);
          if (targetCourse) {
            setSelectedCourse(targetCourse);
          } else {
            // 指定されたコースが見つからない場合は最初のコースを選択
            setSelectedCourse(response.data[0]);
          }
        } else if (response.data.length > 0) {
          setSelectedCourse(response.data[0]);
        }
      } else {
        setError('コース一覧の取得に失敗しました: ' + (response.message || ''));
      }
    } catch (err) {
      console.error('コース一覧取得エラー:', err);
      
      // 認証エラーの場合はログインページにリダイレクト
      if (err.message.includes('認証') || err.message.includes('Authentication') || err.message.includes('401') || err.message.includes('認証情報が見つかりません')) {
        console.log('認証エラーのため、ログインページにリダイレクトします');
        // 複数のログインページパスを試行
        try {
          navigate('/student/login');
        } catch (navError) {
          console.error('ナビゲーションエラー:', navError);
          // フォールバック: 直接URLを変更
          window.location.href = '/student/login';
        }
        return;
      }
      
      setError('コース一覧の取得中にエラーが発生しました: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // レッスン一覧を取得
  const loadLessons = async (courseId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetchStudentLessons(courseId);
      
      if (response.success) {
        setLessons(response.data);
      } else {
        setError('レッスン一覧の取得に失敗しました: ' + (response.message || ''));
      }
    } catch (err) {
      console.error('レッスン一覧取得エラー:', err);
      
      // 認証エラーの場合はログインページにリダイレクト
      if (err.message.includes('認証') || err.message.includes('Authentication') || err.message.includes('401')) {
        console.log('認証エラーのため、ログインページにリダイレクトします');
        navigate('/student/login');
        return;
      }
      
      setError('レッスン一覧の取得中にエラーが発生しました: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 現在受講中レッスンを取得
  const loadCurrentLesson = async (courseId) => {
    try {
      console.log(`🔍 現在受講中レッスン取得開始: コースID ${courseId}`);
      
      const response = await fetch(`http://localhost:5050/api/learning/current-lesson?courseId=${courseId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`📊 現在受講中レッスンデータ:`, data);
        
        if (data.success && data.data.length > 0) {
          setCurrentLesson(data.data[0]);
          console.log(`✅ 現在受講中レッスン設定: レッスンID ${data.data[0].lesson_id}`);
        } else {
          setCurrentLesson(null);
          console.log(`ℹ️ 現在受講中レッスンなし`);
        }
      } else {
        console.error(`❌ 現在受講中レッスン取得失敗: ${response.status}`);
        setCurrentLesson(null);
      }
    } catch (error) {
      console.error('現在受講中レッスン取得エラー:', error);
      setCurrentLesson(null);
    }
  };

  // コース選択時の処理
  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    loadLessons(course.id);
    loadCurrentLesson(course.id);
  };

  // レッスン学習へのリンク（改善版学習画面を使用）
  const handleStartLesson = async (lesson) => {
    try {
      console.log(`🎓 レッスン学習開始: レッスンID ${lesson.id}, コースID ${lesson.course_id}`);
      
      // 現在のレッスンを開始する前に、既存の進捗を確認・更新
      const response = await fetch(`http://localhost:5050/api/learning/progress/lesson`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: currentUser.id,
          lessonId: lesson.id,
          status: 'in_progress',
          testScore: null,
          assignmentSubmitted: false
        })
      });

      if (response.ok) {
        console.log(`✅ 進捗更新成功: レッスンID ${lesson.id}`);
        // 進捗更新成功後、現在受講中レッスンを再読み込み
        await loadCurrentLesson(lesson.course_id);
        // 学習画面に遷移
        console.log(`🔄 学習画面に遷移: course=${lesson.course_id}&lesson=${lesson.id}`);
        navigate(`/student/enhanced-learning?course=${lesson.course_id}&lesson=${lesson.id}`);
      } else {
        console.error('進捗更新に失敗しました');
        // 進捗更新に失敗しても学習画面には遷移
        navigate(`/student/enhanced-learning?course=${lesson.course_id}&lesson=${lesson.id}`);
      }
    } catch (error) {
      console.error('学習開始エラー:', error);
      // エラーが発生しても学習画面には遷移
      navigate(`/student/enhanced-learning?course=${lesson.course_id}&lesson=${lesson.id}`);
    }
  };

  // テスト受験へのリンク
  const handleTakeTest = (lesson) => {
    navigate(`/student/test?course=${lesson.course_id}&lesson=${lesson.id}`);
  };

  // 課題提出へのリンク
  const handleSubmitAssignment = (lesson) => {
    alert(`${lesson.title}の課題提出機能は開発中です。`);
  };

  // 初期データ読み込み
  useEffect(() => {
    console.log('=== LessonList 初期化 ===');
    console.log('currentUser:', currentUser);
    console.log('isAuthenticated:', currentUser ? '認証済み' : '未認証');
    console.log('selectedCourseId:', selectedCourseId);
    
    // 利用者がログインしていない場合はログインページにリダイレクト
    if (!currentUser) {
      console.log('利用者がログインしていないため、ログインページにリダイレクトします');
      // 複数のログインページパスを試行
      try {
        navigate('/student/login');
      } catch (navError) {
        console.error('ナビゲーションエラー:', navError);
        // フォールバック: 直接URLを変更
        window.location.href = '/student/login';
      }
      return;
    }
    
    // 認証済みの場合はコース一覧を読み込み
    console.log('認証済みユーザーです。コース一覧を読み込みます。');
    loadCourses();
  }, [currentUser, navigate, selectedCourseId]);

  // 選択されたコースが変更されたときにレッスンを読み込み
  useEffect(() => {
    if (selectedCourse) {
      loadLessons(selectedCourse.id);
      loadCurrentLesson(selectedCourse.id);
    }
  }, [selectedCourse]);

  // ページが表示された時に現在受講中レッスンを再読み込み
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && selectedCourse) {
        console.log('📱 ページが表示されました - 現在受講中レッスンを再読み込み');
        loadCurrentLesson(selectedCourse.id);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [selectedCourse]);

  // 利用者がログインしていない場合
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-blue-600 text-xl font-semibold mb-4">認証中...</div>
          <div className="text-gray-600 text-sm">ログインページにリダイレクトしています</div>
        </div>
      </div>
    );
  }

  if (loading && courses.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-blue-600 text-xl font-semibold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-6">
      {/* エラーメッセージ */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <div className="flex justify-between items-start">
            <div>
              <div className="font-semibold mb-2">エラーが発生しました</div>
              <div>{error}</div>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700 text-xl"
            >
              ×
            </button>
          </div>
          {error.includes('認証') && (
            <button
              onClick={() => navigate('/student/login')}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              ログインページに移動
            </button>
          )}
        </div>
      )}

      {/* コースヘッダー */}
      <CourseHeader course={selectedCourse} />

      {/* コース選択 */}
      {courses.length > 0 && (
        <CourseSelector
          courses={courses}
          selectedCourse={selectedCourse}
          onCourseSelect={handleCourseSelect}
        />
      )}

             {/* 現在受講中レッスン */}
       {selectedCourse && currentLesson && (
         <div className="mb-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl shadow-lg p-6 border border-blue-200">
           <h3 className="text-xl font-bold text-blue-800 mb-4">🎯 現在受講中</h3>
           <div className="bg-white rounded-xl p-4 shadow-md">
             <div className="flex items-center justify-between">
               <div>
                 <h4 className="text-lg font-semibold text-gray-800 mb-2">{currentLesson.lesson_title}</h4>
                 <p className="text-sm text-blue-600 font-medium mb-2">{currentLesson.course_title}</p>
                 <p className="text-sm text-gray-600">開始日時: {(() => {
                   const dateStr = currentLesson.started_at || currentLesson.created_at;
                   if (!dateStr) return '';
                   // データベースの値を変更せず、表示形式のみ成型（UTC扱いで解釈）
                   const date = new Date(dateStr);
                   return date.toLocaleString('ja-JP', { 
                     year: 'numeric', 
                     month: '2-digit', 
                     day: '2-digit', 
                     hour: '2-digit', 
                     minute: '2-digit',
                     hour12: false,
                     timeZone: 'UTC'
                   });
                 })()}</p>
                 <p className="text-sm text-gray-600">最終更新: {(() => {
                   const dateStr = currentLesson.updated_at;
                   if (!dateStr) return '';
                   // データベースの値を変更せず、表示形式のみ成型（UTC扱いで解釈）
                   const date = new Date(dateStr);
                   return date.toLocaleString('ja-JP', { 
                     year: 'numeric', 
                     month: '2-digit', 
                     day: '2-digit', 
                     hour: '2-digit', 
                     minute: '2-digit',
                     hour12: false,
                     timeZone: 'UTC'
                   });
                 })()}</p>
               </div>
               <div className="flex gap-2">
                 <button
                   className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                   onClick={() => handleStartLesson(currentLesson)}
                 >
                   🎓 続きから学習
                 </button>
               </div>
             </div>
           </div>
         </div>
       )}

      {/* レッスン一覧 */}
      {selectedCourse && (
        <LessonTable
          lessons={lessons}
          onStartLesson={handleStartLesson}
          onTakeTest={handleTakeTest}
          onSubmitAssignment={handleSubmitAssignment}
          currentLessonId={currentLesson?.lesson_id || currentLesson?.id}
        />
      )}

      {/* コースが存在しない場合 */}
      {courses.length === 0 && !loading && (
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-gray-500 text-lg mb-4">
            受講可能なコースがありません
          </div>
          <p className="text-gray-400 mb-4">
            管理者にお問い合わせください
          </p>
          <button
            onClick={() => navigate('/student/login')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ログインページに戻る
          </button>
        </div>
      )}
    </div>
  );
};

export default LessonList; 