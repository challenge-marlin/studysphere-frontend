import React from 'react';

<<<<<<< Updated upstream
<<<<<<< Updated upstream
const LessonTable = ({ lessons, onStartLesson, onTakeTest, onSubmitAssignment, currentLessonId }) => {
=======
const LessonTable = ({ lessons, onStartLesson, onViewExamResults, onSubmitAssignment, currentLessonId, testResults }) => {
>>>>>>> Stashed changes
=======
const LessonTable = ({ lessons, onStartLesson, onViewExamResults, onSubmitAssignment, currentLessonId, testResults }) => {
>>>>>>> Stashed changes
  // レッスン進行状況の取得
  const getLessonStatus = (lesson) => {
    const status = lesson.progress_status || 'not_started';
    switch (status) {
      case 'completed':
        return { label: '完了', class: 'completed', icon: '✅' };
      case 'in_progress':
        return { label: '進行中', class: 'in-progress', icon: '🔄' };
      case 'not_started':
        return { label: '未開始', class: 'not-started', icon: '⏳' };
      default:
        return { label: '未開始', class: 'not-started', icon: '⏳' };
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 w-full overflow-x-auto">
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
            {lessons && lessons.map((lesson, index) => {
              const status = getLessonStatus(lesson);
              const isCurrentLesson = currentLessonId === lesson.id;
              return (
                <tr key={lesson.id} className={`border-b border-gray-100 hover:bg-blue-50 transition-colors duration-200 ${
                  isCurrentLesson ? 'bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-l-blue-500' : ''
                }`}>
                  <td className="px-4 py-3">
                    {/* レッスン名 */}
                    <div>
                      <div className="font-semibold text-gray-800">{lesson.title}</div>
                      {isCurrentLesson && (
                        <div className="mt-1">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                            🎯 現在受講中
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{lesson.description}</td>
                  <td className="px-4 py-3 text-gray-500">{lesson.duration}</td>
                  <td className="px-4 py-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                      lesson.progress_status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : lesson.progress_status === 'in_progress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-600'
                    }`}>
                      {status.icon} {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
<<<<<<< Updated upstream
                    {lesson.test_score !== null ? (
                      <span className="text-green-600 font-medium">{lesson.test_score}点</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
=======
                    {(() => {
                      const testResult = testResults[lesson.id];
                      console.log(`🔍 レッスン${lesson.id}のテスト結果:`, {
                        lessonId: lesson.id,
                        testResult: testResult,
                        testResults: testResults
                      });
                      
                      if (testResult) {
                        const percentage = testResult.percentage || Math.round((testResult.score / testResult.totalQuestions) * 100);
                        return (
                          <div className="flex flex-col items-center">
                            <span className={`font-medium ${testResult.passed ? 'text-green-600' : 'text-red-600'}`}>
                              {testResult.score}/{testResult.totalQuestions}点
                            </span>
                            <span className="text-xs text-gray-500">
                              ({percentage}%)
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              testResult.passed 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {testResult.passed ? '合格' : '不合格'}
                            </span>
                          </div>
                        );
                      } else {
                        return <span className="text-gray-400">-</span>;
                      }
                    })()}
>>>>>>> Stashed changes
                  </td>
                  <td className="px-4 py-3 text-center">
                    {lesson.has_assignment === 1 || lesson.has_assignment === true ? (
                      lesson.assignment_submitted === 1 || lesson.assignment_submitted === true ? (
                        <span className="text-green-600 font-medium">提出済み</span>
                      ) : (
                        <span className="text-yellow-600 font-medium">未提出</span>
                      )
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        className="px-3 py-1 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg font-medium hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                        onClick={() => onStartLesson(lesson)}
                      >
                        🎓 学習
                      </button>
<<<<<<< Updated upstream
<<<<<<< Updated upstream
                      {lesson.progress_status === 'completed' && (
                        <button
                          className="px-3 py-1 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                          onClick={() => onTakeTest(lesson)}
                        >
                          📝 テスト
                        </button>
                      )}
=======
=======
>>>>>>> Stashed changes
                      {/* 試験結果一覧ボタン（常に表示） */}
                      <button
                        className="px-3 py-1 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                        onClick={() => onViewExamResults(lesson)}
                      >
                        📝 試験結果一覧
                      </button>
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
                      {(lesson.has_assignment === 1 || lesson.has_assignment === true) && 
                       !(lesson.assignment_submitted === 1 || lesson.assignment_submitted === true) && (
                        <button
                          className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg font-medium hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                          onClick={() => onSubmitAssignment(lesson)}
                        >
                          📄 課題提出
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
    </div>
  );
};

export default LessonTable;
