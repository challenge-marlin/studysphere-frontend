import React, { useState, useEffect } from 'react';
import StudentVoiceCareView from '../components/StudentVoiceCareView';

const Dashboard = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [lastLesson, setLastLesson] = useState(null);

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      const userData = JSON.parse(user);
      setCurrentUser(userData);
      
      // 生徒の受講コースを取得（モックデータ）
      const mockEnrolledCourses = [
        {
          id: 'course001',
          title: 'オフィスソフトの操作・文書作成',
          category: '選択科目',
          progress: 75,
          totalLessons: 6,
          completedLessons: 4,
          nextLesson: {
            id: 'lesson001-4',
            title: 'Microsoft PowerPointでのプレゼンテーション作成',
            courseTitle: 'オフィスソフトの操作・文書作成'
          }
        },
        {
          id: 'course002',
          title: 'ITリテラシー・AIの基本',
          category: '必修科目',
          progress: 50,
          totalLessons: 6,
          completedLessons: 3,
          nextLesson: {
            id: 'lesson002-4',
            title: 'AIの活用例',
            courseTitle: 'ITリテラシー・AIの基本'
          }
        },
        {
          id: 'course003',
          title: 'SNS運用の基礎・画像生成編集',
          category: '必修科目',
          progress: 100,
          totalLessons: 4,
          completedLessons: 4,
          nextLesson: null
        },
        {
          id: 'course004',
          title: 'ビジネスマナー基礎',
          category: '選択科目',
          progress: 25,
          totalLessons: 8,
          completedLessons: 2,
          nextLesson: {
            id: 'lesson004-3',
            title: '電話応対の基本',
            courseTitle: 'ビジネスマナー基礎'
          }
        }
      ];
      
      setEnrolledCourses(mockEnrolledCourses);
      
      // 最後に学習したレッスンを設定（モックデータ）
      const mockLastLesson = {
        id: 'lesson002-3',
        title: 'AIの仕組みや基本用語を学ぶ',
        courseTitle: 'ITリテラシー・AIの基本',
        completedDate: '2024-01-15 16:30',
        score: 85,
        status: 'completed'
      };
      setLastLesson(mockLastLesson);
    }
  }, []);

  const handleViewLastLesson = () => {
    if (lastLesson) {
      alert(`最後に学習したレッスン「${lastLesson.title}」の詳細を表示します。\nコース: ${lastLesson.courseTitle}\n完了日時: ${lastLesson.completedDate}\nスコア: ${lastLesson.score}点`);
    }
  };

  const handleViewCourse = (courseId) => {
    const course = enrolledCourses.find(c => c.id === courseId);
    alert(`コース「${course?.title}」の詳細を表示します。`);
  };

  const handleStartCourse = (courseId) => {
    const course = enrolledCourses.find(c => c.id === courseId);
    alert(`コース「${course?.title}」の学習を開始します。`);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-blue-600 text-xl font-semibold">読み込み中...</div>
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
          {/* 受講可能なカリキュラムセクション */}
          <section className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-6">📚 受講可能なカリキュラム</h3>
            <div className="space-y-4">
              {enrolledCourses.map((course) => (
                <div key={course.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-800">{course.title}</h4>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {course.category}
                      </span>
                      {course.progress === 100 && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          ✅ 修了
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>進捗: {course.progress}%</span>
                      <span>{course.completedLessons}/{course.totalLessons} レッスン完了</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          course.progress === 100 
                            ? 'bg-gradient-to-r from-green-400 to-green-600' 
                            : 'bg-gradient-to-r from-blue-400 to-cyan-600'
                        }`}
                        style={{ width: `${course.progress}%` }}
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
                    {course.progress === 0 && (
                      <button 
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-medium transition-all duration-200"
                        onClick={() => handleStartCourse(course.id)}
                      >
                        開始
                      </button>
                    )}
                    {course.progress > 0 && course.progress < 100 && (
                      <button 
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg font-medium transition-all duration-200"
                        onClick={() => handleViewCourse(course.id)}
                      >
                        続きから
                      </button>
                    )}
                    {course.progress === 100 && (
                      <button 
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-lg font-medium transition-all duration-200"
                        onClick={() => handleViewCourse(course.id)}
                      >
                        復習
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 最後に学習したもの */}
          {lastLesson && (
            <section className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-6">📚 最後に学習したもの</h3>
              <div className="border border-gray-200 rounded-xl p-4">
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-800 mb-2">{lastLesson.title}</h4>
                  <p className="text-sm text-blue-600 font-medium mb-2">{lastLesson.courseTitle}</p>
                  <div className="space-y-1 text-sm text-gray-600 mb-3">
                    <div>完了日時: {lastLesson.completedDate}</div>
                    <div className="flex items-center gap-2">
                      <span>スコア: {lastLesson.score}点</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        lastLesson.score >= 80 
                          ? 'bg-green-100 text-green-800' 
                          : lastLesson.score >= 60 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {lastLesson.score >= 80 ? '優秀' : lastLesson.score >= 60 ? '合格' : '要復習'}
                      </span>
                    </div>
                  </div>
                </div>
                <button 
                  className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                  onClick={handleViewLastLesson}
                >
                  📖 詳細を見る
                </button>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 