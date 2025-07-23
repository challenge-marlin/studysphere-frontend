import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LessonList = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  // const [lessonProgress, setLessonProgress] = useState({});

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      const userData = JSON.parse(user);
      setCurrentUser(userData);
      
      // カリキュラム全体像.txtに基づくコース・レッスンデータ
      const mockEnrolledCourses = [
        {
          id: 'course001',
          title: 'オフィスソフトの操作・文書作成',
          category: '選択科目',
          progress: 75,
          lessons: [
            {
              id: 'lesson001-1',
              title: 'Microsoft Wordの特徴と文書作成',
              description: '基本操作、文書の作成、保存方法。フォーマット設定、スタイルの適用、図形や画像の挿入',
              duration: '120分',
              order: 1,
              status: 'completed',
              testScore: 85,
              hasAssignment: false
            },
            {
              id: 'lesson001-2',
              title: 'Microsoft Excelの特徴と表計算',
              description: '基本操作、セルの入力、データの整形、数式の使用、基本的な関数の紹介',
              duration: '120分',
              order: 2,
              status: 'completed',
              testScore: 92,
              hasAssignment: false
            },
            {
              id: 'lesson001-3',
              title: 'Microsoft Excelを使用したデータ分析',
              description: '基本操作、セルの入力、データの整形、数式の使用、基本的な関数の紹介',
              duration: '120分',
              order: 3,
              status: 'in-progress',
              testScore: null,
              hasAssignment: true
            },
            {
              id: 'lesson001-4',
              title: 'Microsoft PowerPointでのプレゼンテーション作成',
              description: 'スライドの構成、デザインの基本、アニメーションやトランジションの追加',
              duration: '120分',
              order: 4,
              status: 'not-started',
              testScore: null,
              hasAssignment: false
            },
            {
              id: 'lesson001-5',
              title: 'Wordでのレポート作成',
              description: '文書の構成（見出し、段落、リスト）、実践課題: 簡単なレポートを作成',
              duration: '120分',
              order: 5,
              status: 'not-started',
              testScore: null,
              hasAssignment: true
            },
            {
              id: 'lesson001-6',
              title: '実務での活用方法と応用技術',
              description: '各ソフトの実務での具体的な活用事例の紹介、効率的な作業方法やショートカットキーの紹介',
              duration: '120分',
              order: 6,
              status: 'not-started',
              testScore: null,
              hasAssignment: false
            }
          ]
        },
        {
          id: 'course002',
          title: 'ITリテラシー・AIの基本',
          category: '必修科目',
          progress: 50,
          lessons: [
            {
              id: 'lesson002-1',
              title: 'Windows11の基本操作',
              description: 'ファイル操作、ショートカットキーの利用、ソフトウェアの使用方法（ブラウザ、Word、Excelの簡単操作）',
              duration: '120分',
              order: 1,
              status: 'completed',
              testScore: 88,
              hasAssignment: false
            },
            {
              id: 'lesson002-2',
              title: 'インターネットの基礎',
              description: 'インターネットの仕組みと安全な利用（セキュリティ、パスワード管理）、情報検索と信頼性の高い情報の見分け方',
              duration: '120分',
              order: 2,
              status: 'completed',
              testScore: 95,
              hasAssignment: false
            },
            {
              id: 'lesson002-3',
              title: 'AIの基本概念',
              description: 'AIの基本概念（AIとは何か、利用されている分野）',
              duration: '120分',
              order: 3,
              status: 'in-progress',
              testScore: null,
              hasAssignment: false
            },
            {
              id: 'lesson002-4',
              title: 'AIの活用例',
              description: 'AIの活用例（日常での利用例、Google検索や翻訳ツールの仕組み）、AIツールの体験',
              duration: '120分',
              order: 4,
              status: 'not-started',
              testScore: null,
              hasAssignment: true
            },
            {
              id: 'lesson002-5',
              title: 'プログラミングの基本',
              description: 'プログラミングの基本、ChatGPTなどのAIアシスタントの活用',
              duration: '120分',
              order: 5,
              status: 'not-started',
              testScore: null,
              hasAssignment: false
            },
            {
              id: 'lesson002-6',
              title: 'AIを使用した簡単なLP作成',
              description: 'AIを使用した簡単なLP作成、チャットボットの仕組みと作成',
              duration: '120分',
              order: 6,
              status: 'not-started',
              testScore: null,
              hasAssignment: true
            }
          ]
        }
        // 今後、他コース（SNS運用、LP制作等）もここに追加可能
      ];
      
      setEnrolledCourses(mockEnrolledCourses);
      if (mockEnrolledCourses.length > 0) {
        setSelectedCourse(mockEnrolledCourses[0]);
      }
    }
  }, []);

  // レッスン進行状況の取得
  const getLessonStatus = (lesson) => {
    switch (lesson.status) {
      case 'completed':
        return { label: '完了', class: 'completed', icon: '✅' };
      case 'in-progress':
        return { label: '進行中', class: 'in-progress', icon: '🔄' };
      case 'not-started':
        return { label: '未開始', class: 'not-started', icon: '⏳' };
      default:
        return { label: '未開始', class: 'not-started', icon: '⏳' };
    }
  };

  // レッスン学習へのリンク
  const handleStartLesson = (lesson) => {
    // レッスン番号を取得（orderを使用）
    const lessonNumber = lesson.order;
    
    // 学習画面に遷移（レッスン番号をパラメータとして渡す）
    navigate(`/student/learning?lesson=${lessonNumber}`);
  };

  // 改善版レッスン学習へのリンク
  const handleStartEnhancedLesson = (lesson) => {
    // レッスン番号を取得（orderを使用）
    const lessonNumber = lesson.order;
    
    // 改善版学習画面に遷移（レッスン番号をパラメータとして渡す）
    navigate(`/student/enhanced-learning?lesson=${lessonNumber}`);
  };

  // 高度なレッスン学習へのリンク
  const handleStartAdvancedLesson = (lesson) => {
    // レッスン番号を取得（orderを使用）
    const lessonNumber = lesson.order;
    
    // 高度な学習画面に遷移（レッスン番号をパラメータとして渡す）
    navigate(`/student/advanced-learning?lesson=${lessonNumber}`);
  };

  // テスト受験へのリンク
  const handleTakeTest = (lesson) => {
    // レッスン番号を取得（orderを使用）
    const lessonNumber = lesson.order;
    
    // テスト画面に遷移（レッスン番号をパラメータとして渡す）
    navigate(`/student/test?lesson=${lessonNumber}`);
  };

  // 課題提出へのリンク
  const handleSubmitAssignment = (lesson) => {
    alert(`${lesson.title}の課題提出機能は開発中です。`);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-blue-600 text-xl font-semibold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-6">
      {/* コース名大見出し */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-2 mb-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            {selectedCourse?.title || 'コース名不明'}
          </h1>
          <div className="flex items-center gap-3">
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
              selectedCourse?.category === '必修科目'
                ? 'bg-red-100 text-red-800'
                : 'bg-blue-100 text-blue-800'
            }`}>
              {selectedCourse?.category || 'カテゴリ不明'}
            </span>
            <span className="text-gray-500 text-sm">{selectedCourse?.lessons?.length || 0}レッスン</span>
          </div>
        </div>
      </div>

      {/* コース切り替えタブ */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-4">
          {enrolledCourses.map(course => (
            <button
              key={course.id}
              className={`px-6 py-3 rounded-t-lg font-semibold text-lg border-b-4 transition-all duration-200 focus:outline-none ${
                selectedCourse?.id === course.id
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white border-blue-600 shadow-lg'
                  : 'bg-gray-100 text-gray-700 border-transparent hover:bg-blue-50'
              }`}
              onClick={() => setSelectedCourse(course)}
            >
              {course.title}
              <span className="ml-2 text-xs font-normal px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                {course.category}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* レッスン一覧テーブル */}
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 w-full overflow-x-auto">
        {selectedCourse && (
          <>
            {/* ここでコース名は大見出しに移動したので、テーブル上部のコース名表示は省略 */}
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-blue-800">レッスン名</th>
                    <th className="px-4 py-3 text-left font-semibold text-blue-800">説明</th>
                    <th className="px-4 py-3 text-left font-semibold text-blue-800">所要時間</th>
                    <th className="px-4 py-3 text-left font-semibold text-blue-800">進捗</th>
                    <th className="px-4 py-3 text-left font-semibold text-blue-800">テスト</th>
                    <th className="px-4 py-3 text-left font-semibold text-blue-800">課題</th>
                    <th className="px-4 py-3 text-left font-semibold text-blue-800">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedCourse.lessons && selectedCourse.lessons.map((lesson, index) => {
                    const status = getLessonStatus(lesson);
                    return (
                      <tr key={lesson.id} className="border-b border-gray-100 hover:bg-blue-50 transition-colors duration-200">
                        <td className="px-4 py-3 font-semibold text-gray-800">{lesson.title}</td>
                        <td className="px-4 py-3 text-gray-600">{lesson.description}</td>
                        <td className="px-4 py-3 text-gray-500">{lesson.duration}</td>
                        <td className="px-4 py-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            lesson.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : lesson.status === 'in-progress'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-600'
                          }`}>
                            {status.icon} {status.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {lesson.testScore !== null ? (
                            <span className="text-green-600 font-medium">{lesson.testScore}点</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {lesson.hasAssignment ? (
                            <span className="text-yellow-600 font-medium">あり</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <button
                              className="px-3 py-1 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg font-medium hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                              onClick={() => handleStartLesson(lesson)}
                            >
                              🎓 学習
                            </button>
                            <button
                              className="px-3 py-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                              onClick={() => handleStartEnhancedLesson(lesson)}
                            >
                              🚀 改善
                            </button>
                            <button
                              className="px-3 py-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-medium hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                              onClick={() => handleStartAdvancedLesson(lesson)}
                            >
                              ⭐ 高度
                            </button>
                            {lesson.status === 'completed' && (
                              <button
                                className="px-3 py-1 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                                onClick={() => handleTakeTest(lesson)}
                              >
                                📝 テスト
                              </button>
                            )}
                            {lesson.hasAssignment && (
                              <button
                                className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg font-medium hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                                onClick={() => handleSubmitAssignment(lesson)}
                              >
                                📋 課題
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LessonList; 