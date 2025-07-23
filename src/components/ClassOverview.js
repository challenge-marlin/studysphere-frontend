import React from 'react';

const ClassOverview = ({ teacherId }) => {
  // モックデータ
  const classStats = {
    totalStudents: 15,
    activeStudents: 12,
    averageProgress: 68,
    completedCourses: 23,
    pendingAssignments: 8
  };

  const recentStudentActivity = [
    { name: '鈴木太郎', action: 'Microsoft Excelを使用したデータ分析を完了', time: '30分前', progress: 75 },
    { name: '田中花子', action: '課題「Excelデータ分析レポート」を提出', time: '1時間前', progress: 60 },
    { name: '山田次郎', action: 'ITリテラシー・AIの基本コースを開始', time: '2時間前', progress: 85 },
    { name: '佐藤美香', action: 'テスト「インターネットの基礎」で90点獲得', time: '3時間前', progress: 55 }
  ];

  const upcomingDeadlines = [
    { title: 'オフィスソフトの操作・文書作成 - 最終課題', dueDate: '2024-01-20', studentsCount: 8 },
    { title: 'ITリテラシー・AIの基本 - 中間テスト', dueDate: '2024-01-22', studentsCount: 6 },
    { title: 'SNS運用の基礎・画像生成編集 - プロジェクト発表', dueDate: '2024-01-25', studentsCount: 5 }
  ];

  return (
    <div className="bg-white rounded-xl p-8 shadow-lg">
      <div className="mb-8">
        <h2 className="text-3xl text-gray-800 mb-2">指導員概要</h2>
        <p className="text-gray-600 text-base">担当生徒の個別学習状況を確認できます</p>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 flex items-center gap-4 border border-green-200 transition-transform duration-200 hover:-translate-y-1">
          <div className="text-4xl">👥</div>
          <div>
            <h3 className="text-2xl text-green-800 font-bold">総生徒数</h3>
            <p className="text-green-700 text-lg font-medium">{classStats.totalStudents}</p>
            <small className="text-green-600 text-sm">アクティブ: {classStats.activeStudents}名</small>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 flex items-center gap-4 border border-blue-200 transition-transform duration-200 hover:-translate-y-1">
          <div className="text-4xl">📈</div>
          <div>
            <h3 className="text-2xl text-blue-800 font-bold">平均進捗</h3>
            <p className="text-blue-700 text-lg font-medium">{classStats.averageProgress}%</p>
            <small className="text-blue-600 text-sm">全体平均</small>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 flex items-center gap-4 border border-purple-200 transition-transform duration-200 hover:-translate-y-1">
          <div className="text-4xl">✅</div>
          <div>
            <h3 className="text-2xl text-purple-800 font-bold">完了コース</h3>
            <p className="text-purple-700 text-lg font-medium">{classStats.completedCourses}</p>
            <small className="text-purple-600 text-sm">累計完了数</small>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 flex items-center gap-4 border border-orange-200 transition-transform duration-200 hover:-translate-y-1">
          <div className="text-4xl">📝</div>
          <div>
            <h3 className="text-2xl text-orange-800 font-bold">課題待ち</h3>
            <p className="text-orange-700 text-lg font-medium">{classStats.pendingAssignments}</p>
            <small className="text-orange-600 text-sm">提出待ち課題</small>
          </div>
        </div>
      </div>

      {/* 最近の活動 */}
      <div className="bg-gray-50 rounded-xl p-6 mb-6">
        <h3 className="text-2xl text-gray-800 mb-4">最近の活動</h3>
        <div className="space-y-4">
          {recentStudentActivity.map((activity, index) => (
            <div key={index} className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
              <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center font-semibold">
                {activity.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-green-700">{activity.name}</div>
                <div className="text-gray-800">{activity.action}</div>
                <div className="flex gap-4 text-sm text-gray-600 mt-1">
                  <span>{activity.time}</span>
                  <span>進捗: {activity.progress}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 期限が近い課題 */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-2xl text-gray-800 mb-4">期限が近い課題</h3>
        <div className="space-y-4">
          {upcomingDeadlines.map((deadline, index) => (
            <div key={index} className="flex justify-between items-center p-4 bg-white rounded-lg shadow-sm">
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">{deadline.title}</h4>
                <p className="text-gray-600 text-sm mb-1">期限: {deadline.dueDate}</p>
                <span className="text-blue-600 text-sm font-medium">{deadline.studentsCount}名対象</span>
              </div>
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors duration-200">
                詳細を見る
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClassOverview; 