import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/contexts/AuthContext';
import { fetchStudentCourses, fetchStudentLessons } from '../utils/studentApi';
import { API_BASE_URL } from '../config/apiConfig';
import CourseHeader from '../components/student/CourseHeader';
import CourseSelector from '../components/student/CourseSelector';
import LessonTable from '../components/student/LessonTable';
import ExamResultListModal from '../components/student/ExamResultListModal';
import ExamResultDetailModal from '../components/student/ExamResultDetailModal';

const LessonList = ({ selectedCourseId }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [testResults, setTestResults] = useState({});
  
  // 試験結果モーダル関連の状態
  const [examResultListModalOpen, setExamResultListModalOpen] = useState(false);
  const [examResultDetailModalOpen, setExamResultDetailModalOpen] = useState(false);
  const [selectedLessonForExam, setSelectedLessonForExam] = useState(null);
  const [selectedExamResultKey, setSelectedExamResultKey] = useState(null);

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

  // レッスン一覧から現在受講中のレッスンIDを取得する関数
  const getCurrentLessonIdFromList = (lessonList) => {
    // 未学習以外のステータス（in_progress、completed）のレッスンを対象とする
    const activeLessons = lessonList.filter(lesson => lesson.progress_status !== 'not_started');
    
    // 未学習以外のレッスンがない場合はnullを返す
    if (activeLessons.length === 0) {
      console.log('🎯 未学習以外のレッスンが見つかりません - 現在受講中タグは表示されません');
      return null;
    }
    
    // updated_atでソートして最新のものを取得
    const sortedLessons = [...activeLessons].sort((a, b) => {
      const dateA = a.updated_at ? new Date(a.updated_at).getTime() : 0;
      const dateB = b.updated_at ? new Date(b.updated_at).getTime() : 0;
      if (dateB !== dateA) return dateB - dateA; // updated_atが新しい順
      return b.id - a.id; // 同じ時刻の場合はIDが大きい方を優先
    });
    
    const mostRecentLesson = sortedLessons[0];
    console.log(`🎯 レッスン一覧から特定した現在受講中: レッスンID ${mostRecentLesson.id}, updated_at: ${mostRecentLesson.updated_at}`);
    return mostRecentLesson.id;
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
      
      const response = await fetch(`${API_BASE_URL}/api/learning/current-lesson?courseId=${courseId}`, {
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

  // テスト結果を取得
  const loadTestResults = async () => {
    try {
      console.log('🔍 テスト結果取得開始');
      
      const response = await fetch(`${API_BASE_URL}/api/learning/test/results/${currentUser.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📊 テスト結果データ:', data);
        
        if (data.success && data.data) {
          // テスト結果をレッスンIDをキーとしたオブジェクトに変換
          const resultsMap = {};
          console.log('🔍 テスト結果データ詳細:', data.data);
          console.log('🔍 テスト結果データの型:', typeof data.data, Array.isArray(data.data));
          console.log('🔍 テスト結果データの長さ:', data.data.length);
          
          data.data.forEach((result, index) => {
            console.log(`📊 テスト結果[${index}]:`, result);
            console.log(`📊 テスト結果[${index}]の全フィールド:`, Object.keys(result));
            
            // 新しいAPI形式に対応（lesson_idを使用）
            const lessonId = result.lesson_id;
            console.log(`🔍 レッスンID:`, lessonId);
            
            if (lessonId) {
              resultsMap[lessonId] = {
                score: result.test_score || 0,
                totalQuestions: result.total_questions || 0,
                passed: result.passed || false,
                percentage: result.percentage || 0,
                testType: result.test_type || 'lesson',
                completedAt: result.completed_at
              };
              console.log(`✅ テスト結果[${lessonId}]設定:`, resultsMap[lessonId]);
            } else {
              console.warn(`⚠️ レッスンIDが見つからないテスト結果:`, result);
              console.warn(`⚠️ 利用可能なフィールド:`, Object.keys(result));
            }
          });
          
          setTestResults(resultsMap);
          console.log('✅ テスト結果設定完了:', resultsMap);
          console.log('✅ テスト結果マップのキー:', Object.keys(resultsMap));
        } else {
          console.log('ℹ️ テスト結果なし');
          console.log('ℹ️ レスポンスデータ:', data);
          setTestResults({});
        }
      } else {
        console.error(`❌ テスト結果取得失敗: ${response.status}`);
        setTestResults({});
      }
    } catch (error) {
      console.error('テスト結果取得エラー:', error);
      setTestResults({});
    }
  };
  // コース選択時の処理
  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    loadLessons(course.id);
    loadCurrentLesson(course.id);
    loadTestResults();
  };

  // レッスン学習へのリンク（改善版学習画面を使用）
  const handleStartLesson = async (lesson) => {
    try {
      console.log(`🎓 レッスン学習開始: レッスンID ${lesson.id}, コースID ${lesson.course_id}`);
      
      // 1. まず、利用者とコースの関連付けを確認・作成
      console.log('1. コース割り当て処理開始...');
      const assignResponse = await fetch(`${API_BASE_URL}/api/learning/assign-course`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: parseInt(currentUser.id),
          courseId: parseInt(lesson.course_id)
        })
      });
      
      console.log('コース割り当てレスポンス:', assignResponse.status, assignResponse.statusText);
      
      if (assignResponse.ok) {
        const assignData = await assignResponse.json();
        console.log('利用者とコースの関連付けが完了しました:', assignData);
      } else {
        console.error('利用者とコースの関連付けに失敗しました');
        const errorData = await assignResponse.json().catch(() => ({}));
        console.error('エラー詳細:', errorData);
      }
      
      // 2. レッスンのステータスを確認して適切に更新
      const currentStatus = lesson.progress_status || 'not_started';
      console.log(`📊 現在のステータス: ${currentStatus}`);
      
      // 未学習または受講中のレッスンをin_progressに更新
      const targetStatus = (currentStatus === 'not_started' || currentStatus === 'in_progress') ? 'in_progress' : currentStatus;
      
      console.log(`🔄 進捗更新開始: レッスンID ${lesson.id}, ステータス ${targetStatus}`);
      
      const response = await fetch(`${API_BASE_URL}/api/learning/progress/lesson`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: currentUser.id,
          lessonId: lesson.id,
          status: targetStatus,
          forceUpdate: true  // 強制更新フラグを追加
          // testScoreとassignmentSubmittedは指定せず、既存の値を保持
        })
      });

      if (response.ok) {
        console.log(`✅ 進捗更新成功: レッスンID ${lesson.id}, 新ステータス: ${targetStatus}`);
        
        // 進捗更新成功後、レッスン一覧と現在受講中レッスンを再読み込み
        await Promise.all([
          loadLessons(lesson.course_id),
          loadCurrentLesson(lesson.course_id)
        ]);
        
        console.log(`✅ レッスン一覧と現在受講中レッスンを再読み込み完了`);
        
        // 学習画面に遷移
        console.log(`🔄 学習画面に遷移: course=${lesson.course_id}&lesson=${lesson.id}`);
        navigate(`/student/enhanced-learning?course=${lesson.course_id}&lesson=${lesson.id}`);
      } else {
        const errorData = await response.json();
        console.error('進捗更新に失敗しました:', errorData);
        // 進捗更新に失敗しても学習画面には遷移
        navigate(`/student/enhanced-learning?course=${lesson.course_id}&lesson=${lesson.id}`);
      }
    } catch (error) {
      console.error('学習開始エラー:', error);
      // エラーが発生しても学習画面には遷移
      navigate(`/student/enhanced-learning?course=${lesson.course_id}&lesson=${lesson.id}`);
    }
  };

  // 試験結果一覧を表示（新しい実装）
  const handleViewExamResults = (lesson) => {
    console.log(`📊 試験結果一覧表示: レッスンID ${lesson.id}`);
    setSelectedLessonForExam(lesson);
    setExamResultListModalOpen(true);
  };

  // 試験結果詳細を表示
  const handleViewExamResultDetail = (result) => {
    console.log(`📋 試験結果詳細表示:`, result);
    setSelectedExamResultKey(result.key);
    setExamResultListModalOpen(false);
    setExamResultDetailModalOpen(true);
  };

  // 試験結果詳細モーダルを閉じる
  const handleCloseExamResultDetail = () => {
    setExamResultDetailModalOpen(false);
    // 詳細モーダルを閉じたら一覧モーダルに戻る
    setExamResultListModalOpen(true);
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
       {selectedCourse && (() => {
         // レッスン一覧から現在受講中のレッスンを取得
         const currentLessonId = getCurrentLessonIdFromList(lessons);
         const currentLessonData = currentLessonId ? lessons.find(l => l.id === currentLessonId) : null;
         
         // in_progressステータスのレッスンがない場合は表示しない
         if (!currentLessonData) {
           // APIから取得したcurrentLessonも確認するが、in_progressステータスでない場合は表示しない
           if (currentLesson && currentLesson.status !== 'in_progress') {
             console.log('🎯 APIから取得したレッスンはin_progressステータスではありません - 現在受講中セクションは表示されません');
             return null;
           }
           if (!currentLesson) return null;
         }
         
         // currentLessonDataまたはcurrentLessonのどちらかが存在する場合に表示
         const displayLesson = currentLessonData || currentLesson;
         
         if (!displayLesson) return null;
         
         return (
           <div className="mb-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl shadow-lg p-6 border border-blue-200">
             <h3 className="text-xl font-bold text-blue-800 mb-4">🎯 現在受講中</h3>
             <div className="bg-white rounded-xl p-4 shadow-md">
               <div className="flex items-center justify-between">
                 <div>
                   <h4 className="text-lg font-semibold text-gray-800 mb-2">
                     {currentLessonData ? currentLessonData.title : displayLesson.lesson_title}
                   </h4>
                   <p className="text-sm text-blue-600 font-medium mb-2">
                     {currentLessonData ? currentLessonData.course_title : displayLesson.course_title}
                   </p>
                   <p className="text-sm text-gray-600">最終更新: {(() => {
                     const dateStr = currentLessonData ? currentLessonData.updated_at : displayLesson.updated_at;
                     if (!dateStr) return '';
                     // データベースから取得した日本時間の値をそのまま表示
                     return dateStr
                       .replace(/-/g, '/')           // ハイフンをスラッシュに変換
                       .replace('T', ' ')            // Tをスペースに変換
                       .replace(/\.\d{3}Z?$/, '')    // .000Z または .000 を削除
                       .replace(/\s+/g, ' ');        // 複数のスペースを1つに統一
                   })()}</p>
                 </div>
                 <div className="flex gap-2">
                   <button
                     className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                     onClick={() => {
                       if (currentLessonData) {
                         handleStartLesson(currentLessonData);
                       } else {
                         handleStartLesson(displayLesson);
                       }
                     }}
                   >
                     🎓 続きから学習
                   </button>
                 </div>
               </div>
             </div>
           </div>
         );
       })()}

      {/* レッスン一覧 */}
      {selectedCourse && (
        <LessonTable
          lessons={lessons}
          onStartLesson={handleStartLesson}
          onViewExamResults={handleViewExamResults}
          onSubmitAssignment={handleSubmitAssignment}
          currentLessonId={
            // レッスン一覧から計算したIDを優先、なければAPIから取得した値を使用
            getCurrentLessonIdFromList(lessons) || currentLesson?.lesson_id || currentLesson?.id
          }
          testResults={testResults}
        />
      )}

      {/* 試験結果一覧モーダル */}
      <ExamResultListModal
        isOpen={examResultListModalOpen}
        onClose={() => setExamResultListModalOpen(false)}
        lesson={selectedLessonForExam}
        onViewDetail={handleViewExamResultDetail}
      />

      {/* 試験結果詳細モーダル */}
      <ExamResultDetailModal
        isOpen={examResultDetailModalOpen}
        onClose={handleCloseExamResultDetail}
        resultKey={selectedExamResultKey}
      />

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