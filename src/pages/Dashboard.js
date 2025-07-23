import React, { useState, useEffect } from 'react';
import RecentActivity from '../components/RecentActivity';

const Dashboard = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [completedCourses, setCompletedCourses] = useState([]);
  const [nextLesson, setNextLesson] = useState(null);
  const [pendingApprovals, setPendingApprovals] = useState([]);

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
        }
      ];
      
      // 修了コース（モックデータ）
      const mockCompletedCourses = [
        {
          id: 'course003',
          title: 'SNS運用の基礎・画像生成編集',
          category: '必修科目',
          completedDate: '2024-01-10',
          finalScore: 92
        }
      ];
      
      setEnrolledCourses(mockEnrolledCourses);
      setCompletedCourses(mockCompletedCourses);
      
      // 次に受講すべきレッスンを設定
      if (mockEnrolledCourses.length > 0) {
        setNextLesson(mockEnrolledCourses[0].nextLesson);
      }

      // 判定依頼中のテスト（モックデータ）
      const mockPendingApprovals = [
        {
          id: 'approval001',
          courseTitle: 'ITリテラシー・AIの基本',
          lessonTitle: '第3回　AIの仕組みや基本用語を学ぶ',
          testScore: 85,
          submittedDate: '2024-01-15',
          status: 'pending',
          instructorName: '山田 指導員'
        },
        {
          id: 'approval002',
          courseTitle: 'オフィスソフトの操作・文書作成',
          lessonTitle: '第2回　Microsoft Wordでの文書作成',
          testScore: 92,
          submittedDate: '2024-01-14',
          status: 'pending',
          instructorName: '田中 指導員'
        }
      ];
      
      setPendingApprovals(mockPendingApprovals);
    }
  }, []);

  // 最新の活動データ
  const recentActivities = [
    { 
      title: 'Microsoft Excelを使用したデータ分析', 
      date: '2024-01-15', 
      type: 'lesson',
      course: 'オフィスソフトの操作・文書作成',
      status: '完了'
    },
    { 
      title: '課題: Excelデータ分析レポート', 
      date: '2024-01-14', 
      type: 'assignment',
      course: 'オフィスソフトの操作・文書作成',
      status: '提出済み'
    },
    { 
      title: 'AIの基本概念', 
      date: '2024-01-13', 
      type: 'lesson',
      course: 'ITリテラシー・AIの基本',
      status: '進行中'
    },
    { 
      title: 'テスト: インターネットの基礎', 
      date: '2024-01-12', 
      type: 'test',
      course: 'ITリテラシー・AIの基本',
      status: '95点'
    },
  ];

  const handleStartNextLesson = () => {
    if (nextLesson) {
      alert(`レッスン「${nextLesson.title}」の学習を開始します。\nコース: ${nextLesson.courseTitle}`);
    }
  };

  const handleViewCourse = (courseId) => {
    alert(`コース「${enrolledCourses.find(c => c.id === courseId)?.title}」の詳細を表示します。`);
  };

  const handleViewCompletedCourse = (courseId) => {
    const course = completedCourses.find(c => c.id === courseId);
    alert(`修了コース「${course?.title}」の詳細を表示します。\n修了日: ${course?.completedDate}\n最終スコア: ${course?.finalScore}点`);
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
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 現在利用コースセクション */}
          <section className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-6">📚 現在利用コース</h3>
            <div className="space-y-4">
              {enrolledCourses.map((course) => (
                <div key={course.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-800">{course.title}</h4>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {course.category}
                    </span>
                  </div>
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>進捗: {course.progress}%</span>
                      <span>{course.completedLessons}/{course.totalLessons} レッスン完了</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-400 to-cyan-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  <button 
                    className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-200"
                    onClick={() => handleViewCourse(course.id)}
                  >
                    詳細を見る
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* 最新学習へのリンク */}
          {nextLesson && (
            <section className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-6">🎯 次に学習するレッスン</h3>
              <div className="border border-gray-200 rounded-xl p-4">
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-800 mb-2">{nextLesson.title}</h4>
                  <p className="text-sm text-blue-600 font-medium mb-2">{nextLesson.courseTitle}</p>
                  <p className="text-sm text-gray-600">
                    このレッスンでは、PDF資料の閲覧、動画の視聴、テストの受講を行います。
                  </p>
                </div>
                <button 
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                  onClick={handleStartNextLesson}
                >
                  📖 学習を開始
                </button>
              </div>
            </section>
          )}

          {/* 判定依頼中セクション */}
          {pendingApprovals.length > 0 && (
            <section className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-6">⏳ 判定依頼中</h3>
              <div className="space-y-4">
                {pendingApprovals.map((approval) => (
                  <div key={approval.id} className="border border-yellow-200 bg-yellow-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-800">{approval.lessonTitle}</h4>
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                        判定待ち
                      </span>
                    </div>
                    <div className="mb-3">
                      <p className="text-sm text-blue-600 font-medium mb-2">{approval.courseTitle}</p>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div>テストスコア: {approval.testScore}点</div>
                        <div>提出日: {approval.submittedDate}</div>
                        <div>担当指導員: {approval.instructorName}</div>
                      </div>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-yellow-200">
                      <p className="text-sm text-gray-700">テストに合格しました。指導員の承認をお待ちしています。</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 修了コースセクション */}
          {completedCourses.length > 0 && (
            <section className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-6">🏆 修了コース</h3>
              <div className="space-y-4">
                {completedCourses.map((course) => (
                  <div key={course.id} className="border border-green-200 bg-green-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-800">{course.title}</h4>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        {course.category}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600 mb-3">
                      <div>修了日: {course.completedDate}</div>
                      <div>最終スコア: {course.finalScore}点</div>
                    </div>
                    <button 
                      className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all duration-200"
                      onClick={() => handleViewCompletedCourse(course.id)}
                    >
                      詳細を見る
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 最近の活動 */}
          <section className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 lg:col-span-2">
            <h3 className="text-xl font-bold text-gray-800 mb-6">📈 最近の活動</h3>
            <RecentActivity activities={recentActivities} />
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 